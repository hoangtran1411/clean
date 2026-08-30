$domainDir = "C:\Users\Hoang\Desktop\clean\src\CleanArch.Domain"
$appDir = "C:\Users\Hoang\Desktop\clean\src\CleanArch.Application"
$infraDir = "C:\Users\Hoang\Desktop\clean\src\CleanArch.Infrastructure"
$webDir = "C:\Users\Hoang\Desktop\clean\src\CleanArch.WebApi"

# Domain
Set-Content -Path "$domainDir\Entities\WorkflowTemplate.cs" -Value @"
using CleanArch.Domain.Common;

namespace CleanArch.Domain.Entities;

public class WorkflowTemplate : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public IList<WorkflowApprovalLevel> ApprovalLevels { get; private set; } = [];
    public IList<WorkflowRequest> Requests { get; private set; } = [];
}
"@

Set-Content -Path "$domainDir\Entities\WorkflowApprovalLevel.cs" -Value @"
using CleanArch.Domain.Common;

namespace CleanArch.Domain.Entities;

public class WorkflowApprovalLevel : BaseEntity
{
    public int WorkflowTemplateId { get; set; }
    public WorkflowTemplate Template { get; set; } = null!;
    public int LevelOrder { get; set; }
    public string LevelName { get; set; } = string.Empty;
    public string RequiredPermission { get; set; } = string.Empty;
}
"@

Set-Content -Path "$domainDir\Entities\WorkflowApprovalAction.cs" -Value @"
using CleanArch.Domain.Common;
using CleanArch.Domain.Enums;

namespace CleanArch.Domain.Entities;

public class WorkflowApprovalAction : BaseEntity
{
    public int WorkflowRequestId { get; set; }
    public WorkflowRequest Request { get; set; } = null!;
    public int ApprovalLevel { get; set; }
    public WorkflowAction Action { get; set; }
    public string ActedByUserId { get; set; } = string.Empty;
    public string ActedByUserName { get; set; } = string.Empty;
    public string? Comment { get; set; }
}
"@

Set-Content -Path "$domainDir\Entities\WorkflowRequest.cs" -Value @"
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
    public int CurrentApprovalLevel { get; set; } = 0;
    public int TotalApprovalLevels { get; set; } = 0;
    
    public string? RejectionReason { get; set; }
    public string? RejectedByUserId { get; set; }
    public string? RejectedByUserName { get; set; }
    public DateTime? RejectedAtUtc { get; set; }
    
    public DateTime? ApprovedAtUtc { get; set; }
    public string? ApprovedByUserId { get; set; }
    public string? ApprovedByUserName { get; set; }
    
    public DateTime? CompletedAtUtc { get; set; }
    
    public IList<WorkflowApprovalAction> ApprovalActions { get; private set; } = [];

    public void Submit(string userId, string userName)
    {
        if (Status != WorkflowStatus.Draft)
            throw new DomainException(""Only Draft requests can be submitted."");
        if (RequestedByUserId != userId)
            throw new DomainException(""Only the creator can submit this request."");

        Status = WorkflowStatus.InApproval;
        CurrentApprovalLevel = 1;

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
            throw new DomainException(""Request is not currently in approval."");

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
    }

    public void Reject(string userId, string userName, string reason)
    {
        if (Status == WorkflowStatus.Completed || Status == WorkflowStatus.Rejected)
            throw new DomainException(""Cannot reject a completed or already rejected request."");

        Status = WorkflowStatus.Rejected;
        RejectionReason = reason;
        RejectedByUserId = userId;
        RejectedByUserName = userName;
        RejectedAtUtc = DateTime.UtcNow;

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
            throw new DomainException(""Only approved requests can be completed."");

        Status = WorkflowStatus.Completed;
        CompletedAtUtc = DateTime.UtcNow;

        ApprovalActions.Add(new WorkflowApprovalAction
        {
            ApprovalLevel = CurrentApprovalLevel,
            Action = WorkflowAction.Completed,
            ActedByUserId = userId,
            ActedByUserName = userName
        });
    }
}
"@
