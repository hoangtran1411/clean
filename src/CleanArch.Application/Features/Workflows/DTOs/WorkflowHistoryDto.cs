using System;
using CleanArch.Domain.Enums;

namespace CleanArch.Application.Features.Workflows.DTOs;

public record WorkflowHistoryDto(
    int Id,
    WorkflowStatus FromStatus,
    WorkflowStatus ToStatus,
    string ChangedByUserName,
    string? Comment,
    DateTime CreatedAtUtc
);
