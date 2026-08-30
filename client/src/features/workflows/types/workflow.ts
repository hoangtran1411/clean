export enum WorkflowStatus { Draft = 0, Submitted = 1, InApproval = 2, Rejected = 3, Approved = 4, Completed = 5, Obsolescence = 6 }
export enum WorkflowActionType { Submitted = 0, Approved = 1, Rejected = 2, Completed = 3, MarkedObsolete = 4, ResetToDraft = 5 }
export interface WorkflowApprovalLevelDto { id: number; levelOrder: number; levelName: string; requiredPermission: string; }
export interface WorkflowTemplateDto { id: number; name: string; description: string; isActive: boolean; approvalLevels: WorkflowApprovalLevelDto[]; }
export interface WorkflowApprovalActionDto { id: number; approvalLevel: number; action: string; actedByUserName: string; comment?: string; createdAtUtc: string; }
export interface WorkflowRequestDto { id: number; title: string; description: string; requestedByUserName: string; status: string; currentApprovalLevel: number; totalApprovalLevels: number; currentLevelName?: string; rejectionReason?: string; obsolescenceReason?: string; obsoletedByUserName?: string; obsoletedAtUtc?: string; approvedAtUtc?: string; completedAtUtc?: string; createdAtUtc: string; workflowTemplateName: string; history: WorkflowApprovalActionDto[]; }
export interface WorkflowRequestSummaryDto { id: number; title: string; status: string; currentApprovalLevel: number; totalApprovalLevels: number; requestedByUserName: string; workflowTemplateName: string; createdAtUtc: string; }
