using CleanArch.Domain.Common;
using CleanArch.Domain.Enums;
using CleanArch.Domain.Exceptions;

namespace CleanArch.Domain.Entities;

public class WorkflowRequest : BaseEntity
{
    public int WorkflowTemplateId { get; set; }
    public WorkflowTemplate Template { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    
    public string RequestedByUserId { get; set; } = string.Empty;
    public string RequestedByUserName { get; set; } = string.Empty;
    
    public WorkflowStatus Status { get; set; } = WorkflowStatus.Draft;
    public int CurrentApprovalLevel { get; set; }
    public int TotalApprovalLevels { get; set; }
    
    public string? RejectionReason { get; set; }
    public string? RejectedByUserId { get; set; }
    public string? RejectedByUserName { get; set; }
    public DateTime? RejectedAtUtc { get; set; }
    
    public DateTime? ApprovedAtUtc { get; set; }
    public string? ApprovedByUserId { get; set; }
    public string? ApprovedByUserName { get; set; }
    
    public DateTime? CompletedAtUtc { get; set; }
    
    public string? ObsolescenceReason { get; set; }
    public string? ObsoletedByUserId { get; set; }
    public string? ObsoletedByUserName { get; set; }
    public DateTime? ObsoletedAtUtc { get; set; }
    
    public IList<WorkflowApprovalAction> ApprovalActions { get; private set; } = [];

    public void Submit(string userId, string userName)
    {
        if (Status != WorkflowStatus.Draft)
            throw new DomainException("Only Draft requests can be submitted.");
        if (RequestedByUserId != userId)
            throw new DomainException("Only the creator can submit this request.");

        Status = WorkflowStatus.InApproval;
        CurrentApprovalLevel = 1;
        LastModifiedAtUtc = DateTime.UtcNow;

        ApprovalActions.Add(new WorkflowApprovalAction
        {
            ApprovalLevel = 0,
            Action = WorkflowAction.Submitted,
            ActedByUserId = userId,
            ActedByUserName = userName
        });
    }

    public void ApproveCurrentLevel(string userId, string userName, string? comment)
    {
        if (Status != WorkflowStatus.InApproval)
            throw new DomainException("Request is not currently in approval.");

        ApprovalActions.Add(new WorkflowApprovalAction
        {
            ApprovalLevel = CurrentApprovalLevel,
            Action = WorkflowAction.Approved,
            ActedByUserId = userId,
            ActedByUserName = userName,
            Comment = comment
        });

        if (CurrentApprovalLevel >= TotalApprovalLevels)
        {
            Status = WorkflowStatus.Approved;
            ApprovedAtUtc = DateTime.UtcNow;
            ApprovedByUserId = userId;
            ApprovedByUserName = userName;
        }
        else
        {
            CurrentApprovalLevel++;
        }

        LastModifiedAtUtc = DateTime.UtcNow;
    }

    public void Reject(string userId, string userName, string reason)
    {
        if (Status == WorkflowStatus.Completed || Status == WorkflowStatus.Rejected || Status == WorkflowStatus.Obsolescence)
            throw new DomainException("Cannot reject a completed, rejected, or obsolete request.");

        Status = WorkflowStatus.Rejected;
        RejectionReason = reason;
        RejectedByUserId = userId;
        RejectedByUserName = userName;
        RejectedAtUtc = DateTime.UtcNow;
        LastModifiedAtUtc = DateTime.UtcNow;

        ApprovalActions.Add(new WorkflowApprovalAction
        {
            ApprovalLevel = CurrentApprovalLevel,
            Action = WorkflowAction.Rejected,
            ActedByUserId = userId,
            ActedByUserName = userName,
            Comment = reason
        });
    }

    public void Complete(string userId, string userName)
    {
        if (Status != WorkflowStatus.Approved)
            throw new DomainException("Only approved requests can be completed.");

        Status = WorkflowStatus.Completed;
        CompletedAtUtc = DateTime.UtcNow;
        LastModifiedAtUtc = DateTime.UtcNow;

        ApprovalActions.Add(new WorkflowApprovalAction
        {
            ApprovalLevel = CurrentApprovalLevel,
            Action = WorkflowAction.Completed,
            ActedByUserId = userId,
            ActedByUserName = userName
        });
    }

    public void MarkObsolete(string userId, string userName, string reason)
    {
        if (Status == WorkflowStatus.Completed || Status == WorkflowStatus.Rejected || Status == WorkflowStatus.Obsolescence)
            throw new DomainException("Cannot mark a completed, rejected, or already obsolete request as obsolete.");

        Status = WorkflowStatus.Obsolescence;
        ObsolescenceReason = reason;
        ObsoletedByUserId = userId;
        ObsoletedByUserName = userName;
        ObsoletedAtUtc = DateTime.UtcNow;
        LastModifiedAtUtc = DateTime.UtcNow;

        ApprovalActions.Add(new WorkflowApprovalAction
        {
            ApprovalLevel = CurrentApprovalLevel,
            Action = WorkflowAction.MarkedObsolete,
            ActedByUserId = userId,
            ActedByUserName = userName,
            Comment = reason
        });
    }

    public void ResetToDraft(string userId, string userName, string reason)
    {
        if (Status == WorkflowStatus.Draft)
            throw new DomainException("Workflow request is already in Draft status.");
        if (Status == WorkflowStatus.Completed)
            throw new DomainException("Cannot reset a finalized and Completed workflow to Draft.");

        Status = WorkflowStatus.Draft;
        CurrentApprovalLevel = 0;
        
        // Remove signatures / clear decision states
        ApprovedAtUtc = null;
        ApprovedByUserId = null;
        ApprovedByUserName = null;
        RejectionReason = null;
        RejectedByUserId = null;
        RejectedByUserName = null;
        RejectedAtUtc = null;
        ObsolescenceReason = null;
        ObsoletedByUserId = null;
        ObsoletedByUserName = null;
        ObsoletedAtUtc = null;
        LastModifiedAtUtc = DateTime.UtcNow;

        ApprovalActions.Add(new WorkflowApprovalAction
        {
            ApprovalLevel = 0,
            Action = WorkflowAction.ResetToDraft,
            ActedByUserId = userId,
            ActedByUserName = userName,
            Comment = reason
        });
    }
}
