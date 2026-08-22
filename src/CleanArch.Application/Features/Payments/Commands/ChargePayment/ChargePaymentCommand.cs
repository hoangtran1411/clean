using CleanArch.Application.Common.Interfaces;
using CleanArch.Application.Common.Models;
using CleanArch.Application.Features.Payments.DTOs;
using CleanArch.Domain.Entities;
using FluentValidation;
using MediatR;

namespace CleanArch.Application.Features.Payments.Commands.ChargePayment;

public record ChargePaymentCommand(
    decimal Amount,
    string Currency,
    string OrderReference,
    string Description) : IRequest<Result<PaymentReceiptDto>>;

public class ChargePaymentCommandValidator : AbstractValidator<ChargePaymentCommand>
{
    public ChargePaymentCommandValidator()
    {
        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Amount must be greater than zero.");

        RuleFor(x => x.Currency)
            .NotEmpty().WithMessage("Currency is required.")
            .Length(3).WithMessage("Currency must be a 3-letter ISO code.");

        RuleFor(x => x.OrderReference)
            .NotEmpty().WithMessage("Order reference is required.");
    }
}

public class ChargePaymentCommandHandler : IRequestHandler<ChargePaymentCommand, Result<PaymentReceiptDto>>
{
    private readonly IAppDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public ChargePaymentCommandHandler(IAppDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<PaymentReceiptDto>> Handle(ChargePaymentCommand request, CancellationToken cancellationToken)
    {
        var payment = new PaymentRecord
        {
            TransactionId = Guid.NewGuid(),
            Amount = request.Amount,
            Currency = request.Currency.ToUpperInvariant(),
            OrderReference = request.OrderReference,
            Status = "COMPLETED",
            ProcessedBy = _currentUser.UserName ?? "System",
            ProcessedAtUtc = DateTime.UtcNow
        };

        await _context.Payments.AddAsync(payment, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        var receipt = new PaymentReceiptDto
        {
            TransactionId = payment.TransactionId,
            Amount = payment.Amount,
            Currency = payment.Currency,
            OrderReference = payment.OrderReference,
            Status = payment.Status,
            ProcessedAtUtc = payment.ProcessedAtUtc,
            ProcessedBy = payment.ProcessedBy
        };

        return Result<PaymentReceiptDto>.Success(receipt, "Payment charged successfully.");
    }
}
