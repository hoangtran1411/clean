using CleanArch.Application.Common.Interfaces;
using CleanArch.Application.Features.Workflows.Commands.ApproveWorkflowLevel;
using CleanArch.Application.Features.Workflows.Commands.CompleteWorkflow;
using CleanArch.Application.Features.Workflows.Commands.CreateWorkflowRequest;
using CleanArch.Application.Features.Workflows.Commands.CreateWorkflowTemplate;
using CleanArch.Application.Features.Workflows.Commands.RejectWorkflow;
using CleanArch.Application.Features.Workflows.Commands.SubmitWorkflowRequest;
using CleanArch.Domain.Constants;
using CleanArch.Domain.Entities;
using CleanArch.Domain.Enums;
using CleanArch.Domain.Exceptions;
using CleanArch.UnitTests.Common;
using FluentAssertions;
using Moq;
using Xunit;

namespace CleanArch.UnitTests.Features.Workflows;

public class WorkflowEngineTests
{
    private readonly Mock<ICurrentUserService> _currentUserServiceMock = new();

    public WorkflowEngineTests()
    {
        _currentUserServiceMock.Setup(s => s.UserId).Returns("user-123");
        _currentUserServiceMock.Setup(s => s.UserName).Returns("test_user");
        _currentUserServiceMock.Setup(s => s.HasPermission(It.IsAny<string>())).Returns(true);
    }

    [Fact]
    public void Domain_WorkflowRequest_FullHappyPath_TransitionsToApprovedAndCompleted()
    {
        // Arrange: Template with 3 levels (v1: TeamLeader -> DeptHead -> TechDirector)
        var template = new WorkflowTemplate
        {
            Id = 1,
            Name = "Standard 3-Level Approval"
        };
        template.ApprovalLevels.Add(new() { LevelOrder = 1, LevelName = "Team Leader", RequiredPermission = "Workflows.Approve.TeamLeader" });
        template.ApprovalLevels.Add(new() { LevelOrder = 2, LevelName = "Department Head", RequiredPermission = "Workflows.Approve.DepartmentHead" });
        template.ApprovalLevels.Add(new() { LevelOrder = 3, LevelName = "Technical Director", RequiredPermission = "Workflows.Approve.TechnicalDirector" });

        var request = new WorkflowRequest
        {
            Id = 10,
            WorkflowTemplateId = template.Id,
            Template = template,
            Title = "Production Upgrade",
            Description = "Upgrade DB instance",
            RequestedByUserId = "user-123",
            RequestedByUserName = "test_user",
            Status = WorkflowStatus.Draft,
            TotalApprovalLevels = template.ApprovalLevels.Count
        };

        // Act 1: Submit (Draft -> InApproval Level 1)
        request.Submit("user-123", "test_user");
        request.Status.Should().Be(WorkflowStatus.InApproval);
        request.CurrentApprovalLevel.Should().Be(1);

        // Act 2: Approve Level 1 (Team Leader) -> advances to Level 2
        request.ApproveCurrentLevel("lead-1", "lead_user", "Level 1 approved");
        request.Status.Should().Be(WorkflowStatus.InApproval);
        request.CurrentApprovalLevel.Should().Be(2);

        // Act 3: Approve Level 2 (Department Head) -> advances to Level 3
        request.ApproveCurrentLevel("head-1", "head_user", "Level 2 approved");
        request.Status.Should().Be(WorkflowStatus.InApproval);
        request.CurrentApprovalLevel.Should().Be(3);

        // Act 4: Approve Level 3 (Technical Director) -> transitions to Approved
        request.ApproveCurrentLevel("dir-1", "dir_user", "Level 3 final approval");
        request.Status.Should().Be(WorkflowStatus.Approved);
        request.ApprovedByUserId.Should().Be("dir-1");
        request.ApprovedAtUtc.Should().NotBeNull();

        // Act 5: Complete (Approved -> Completed)
        request.Complete("admin-1", "admin_user");
        request.Status.Should().Be(WorkflowStatus.Completed);
        request.CompletedAtUtc.Should().NotBeNull();
        request.ApprovalActions.Should().HaveCount(5); // 1 submit + 3 approves + 1 complete
    }

    [Fact]
    public void Domain_WorkflowRequest_4LevelWorkflow_ScalesSeamlesslyWithoutCodeChange()
    {
        // Arrange: Template with 4 levels (v2: TeamLeader -> DeptHead -> DeputyDirector -> TechDirector)
        var template = new WorkflowTemplate
        {
            Id = 2,
            Name = "Extended 4-Level Approval"
        };
        template.ApprovalLevels.Add(new() { LevelOrder = 1, LevelName = "Team Leader", RequiredPermission = "Workflows.Approve.TeamLeader" });
        template.ApprovalLevels.Add(new() { LevelOrder = 2, LevelName = "Department Head", RequiredPermission = "Workflows.Approve.DepartmentHead" });
        template.ApprovalLevels.Add(new() { LevelOrder = 3, LevelName = "Deputy Director", RequiredPermission = "Workflows.Approve.DeputyDirector" });
        template.ApprovalLevels.Add(new() { LevelOrder = 4, LevelName = "Technical Director", RequiredPermission = "Workflows.Approve.TechnicalDirector" });

        var request = new WorkflowRequest
        {
            Id = 20,
            WorkflowTemplateId = 2,
            Template = template,
            Title = "High-Cost Server Procurement",
            RequestedByUserId = "user-123",
            RequestedByUserName = "test_user",
            Status = WorkflowStatus.Draft,
            TotalApprovalLevels = 4
        };

        request.Submit("user-123", "test_user");
        request.CurrentApprovalLevel.Should().Be(1);

        request.ApproveCurrentLevel("lead-1", "lead_user", "L1 ok");
        request.CurrentApprovalLevel.Should().Be(2);

        request.ApproveCurrentLevel("head-1", "head_user", "L2 ok");
        request.CurrentApprovalLevel.Should().Be(3);

        request.ApproveCurrentLevel("deputy-1", "deputy_user", "L3 ok");
        request.CurrentApprovalLevel.Should().Be(4);
        request.Status.Should().Be(WorkflowStatus.InApproval);

        request.ApproveCurrentLevel("dir-1", "dir_user", "L4 final ok");
        request.Status.Should().Be(WorkflowStatus.Approved);
        request.ApprovalActions.Should().HaveCount(5); // 1 submit + 4 approves
    }

    [Fact]
    public void Domain_WorkflowRequest_RejectAtLevel2_SetsTerminalRejectedState()
    {
        var template = new WorkflowTemplate
        {
            Id = 1
        };
        template.ApprovalLevels.Add(new() { LevelOrder = 1, LevelName = "Team Leader", RequiredPermission = "Workflows.Approve.TeamLeader" });
        template.ApprovalLevels.Add(new() { LevelOrder = 2, LevelName = "Department Head", RequiredPermission = "Workflows.Approve.DepartmentHead" });

        var request = new WorkflowRequest
        {
            Id = 30,
            WorkflowTemplateId = 1,
            Template = template,
            Title = "Test Request",
            RequestedByUserId = "user-123",
            RequestedByUserName = "test_user",
            Status = WorkflowStatus.Draft,
            TotalApprovalLevels = 2
        };

        request.Submit("user-123", "test_user");
        request.ApproveCurrentLevel("lead-1", "lead_user", "L1 ok");

        // Reject at Level 2
        request.Reject("head-1", "head_user", "Budget exceeded for Q3");

        request.Status.Should().Be(WorkflowStatus.Rejected);
        request.RejectionReason.Should().Be("Budget exceeded for Q3");
        request.RejectedByUserId.Should().Be("head-1");
        request.RejectedAtUtc.Should().NotBeNull();

        // Attempting to approve rejected request throws DomainException
        var act = () => request.ApproveCurrentLevel("head-1", "head_user", "Try approve again");
        act.Should().Throw<DomainException>()
            .WithMessage("*Request is not currently in approval*");
    }

    [Fact]
    public void Domain_WorkflowRequest_SubmitByDifferentUser_ThrowsDomainException()
    {
        var request = new WorkflowRequest
        {
            Id = 40,
            RequestedByUserId = "user-123",
            Status = WorkflowStatus.Draft,
            TotalApprovalLevels = 2
        };

        var act = () => request.Submit("impostor-user", "impostor");
        act.Should().Throw<DomainException>()
            .WithMessage("*Only the creator can submit this request*");
    }

    [Fact]
    public async Task Handler_CreateWorkflowTemplate_PersistsTemplateWithNLevels()
    {
        using var context = TestDbContextFactory.Create();
        var handler = new CreateWorkflowTemplateCommandHandler(context, _currentUserServiceMock.Object);

        var command = new CreateWorkflowTemplateCommand(
            Name: "Custom 5-Level Approval",
            Description: "Enterprise workflow with 5 levels",
            ApprovalLevels:
            [
                new(1, "Lead", "Workflows.Approve.1"),
                new(2, "Manager", "Workflows.Approve.2"),
                new(3, "VP", "Workflows.Approve.3"),
                new(4, "Director", "Workflows.Approve.4"),
                new(5, "Board", "Workflows.Approve.5")
            ]
        );

        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.ApprovalLevels.Should().HaveCount(5);
        result.Data.Name.Should().Be("Custom 5-Level Approval");

        var persisted = await context.WorkflowTemplates.FindAsync(result.Data.Id);
        persisted.Should().NotBeNull();
    }

    [Fact]
    public async Task Handler_ApproveWithoutPermission_ThrowsForbiddenException()
    {
        using var context = TestDbContextFactory.Create();
        var unauthorizedUserMock = new Mock<ICurrentUserService>();
        unauthorizedUserMock.Setup(s => s.UserId).Returns("unauthorized-user");
        unauthorizedUserMock.Setup(s => s.UserName).Returns("unauthorized");
        unauthorizedUserMock.Setup(s => s.HasPermission("Workflows.Approve.TeamLeader")).Returns(false);

        // Seed template & request
        var template = new WorkflowTemplate
        {
            Id = 100,
            Name = "Test Template"
        };
        template.ApprovalLevels.Add(new() { LevelOrder = 1, LevelName = "Team Leader", RequiredPermission = "Workflows.Approve.TeamLeader" });

        var request = new WorkflowRequest
        {
            Id = 200,
            WorkflowTemplateId = 100,
            Title = "Test",
            RequestedByUserId = "user-123",
            RequestedByUserName = "user",
            Status = WorkflowStatus.InApproval,
            CurrentApprovalLevel = 1,
            TotalApprovalLevels = 1
        };
        context.WorkflowTemplates.Add(template);
        context.WorkflowRequests.Add(request);
        await context.SaveChangesAsync();

        var handler = new ApproveWorkflowLevelCommandHandler(context, unauthorizedUserMock.Object);
        var command = new ApproveWorkflowLevelCommand(200, "Trying to approve without permission");

        var act = async () => await handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<ForbiddenException>()
            .WithMessage("*Workflows.Approve.TeamLeader*");
    }

    [Fact]
    public void Domain_WorkflowRequest_MarkObsolete_TransitionsToObsolescenceAndRecordsAudit()
    {
        var request = new WorkflowRequest
        {
            Id = 50,
            RequestedByUserId = "user-123",
            RequestedByUserName = "test_user",
            Status = WorkflowStatus.InApproval,
            CurrentApprovalLevel = 1,
            TotalApprovalLevels = 3
        };

        request.MarkObsolete("admin-1", "admin_user", "Project cancelled by leadership");

        request.Status.Should().Be(WorkflowStatus.Obsolescence);
        request.ObsolescenceReason.Should().Be("Project cancelled by leadership");
        request.ObsoletedByUserId.Should().Be("admin-1");
        request.ObsoletedByUserName.Should().Be("admin_user");
        request.ObsoletedAtUtc.Should().NotBeNull();
        request.ApprovalActions.Should().ContainSingle(a => a.Action == WorkflowAction.MarkedObsolete);
    }

    [Fact]
    public void Domain_WorkflowRequest_WhenObsolete_ActionsThrowDomainException()
    {
        var request = new WorkflowRequest
        {
            Id = 60,
            Status = WorkflowStatus.Obsolescence
        };

        var approveAct = () => request.ApproveCurrentLevel("user-1", "user", "ok");
        approveAct.Should().Throw<DomainException>()
            .WithMessage("*Request is not currently in approval*");

        var rejectAct = () => request.Reject("user-1", "user", "reject");
        rejectAct.Should().Throw<DomainException>()
            .WithMessage("*Cannot reject a completed, rejected, or obsolete request*");

        var completeAct = () => request.Complete("user-1", "user");
        completeAct.Should().Throw<DomainException>()
            .WithMessage("*Only approved requests can be completed*");

        var obsoleteAct = () => request.MarkObsolete("user-1", "user", "already obsolete");
        obsoleteAct.Should().Throw<DomainException>()
            .WithMessage("*Cannot mark a completed, rejected, or already obsolete request as obsolete*");
    }

    [Fact]
    public async Task Handler_ObsoleteWorkflow_SetsObsolescenceAndPersists()
    {
        using var context = TestDbContextFactory.Create();
        var template = new WorkflowTemplate { Id = 300, Name = "Template" };
        var request = new WorkflowRequest
        {
            Id = 400,
            WorkflowTemplateId = 300,
            Title = "Obsolescence Test",
            RequestedByUserId = "user-123",
            RequestedByUserName = "user",
            Status = WorkflowStatus.InApproval,
            CurrentApprovalLevel = 1,
            TotalApprovalLevels = 2
        };
        context.WorkflowTemplates.Add(template);
        context.WorkflowRequests.Add(request);
        await context.SaveChangesAsync();

        var handler = new CleanArch.Application.Features.Workflows.Commands.ObsoleteWorkflow.ObsoleteWorkflowCommandHandler(context, _currentUserServiceMock.Object);
        var command = new CleanArch.Application.Features.Workflows.Commands.ObsoleteWorkflow.ObsoleteWorkflowCommand(400, "Deprecating budget line item");

        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Status.Should().Be(WorkflowStatus.Obsolescence.ToString());
        result.Data.ObsolescenceReason.Should().Be("Deprecating budget line item");

        var persisted = await context.WorkflowRequests.FindAsync(400);
        persisted!.Status.Should().Be(WorkflowStatus.Obsolescence);
    }

    [Fact]
    public void Domain_WorkflowRequest_ResetToDraft_ClearsSignaturesAndSetsDraftStatus()
    {
        var request = new WorkflowRequest
        {
            Id = 500,
            Title = "Product Pricing Request",
            RequestedByUserId = "user-123",
            RequestedByUserName = "test_user",
            Status = WorkflowStatus.Approved,
            ApprovedByUserId = "tech-dir-1",
            ApprovedByUserName = "tech_director",
            ApprovedAtUtc = DateTime.UtcNow,
            CurrentApprovalLevel = 3,
            TotalApprovalLevels = 3
        };

        // Act: Super Admin removes signatures and resets to Draft due to incorrect product pricing
        request.ResetToDraft("superadmin-1", "superadmin", "Product pricing was calculated incorrectly; reset for amendment");

        request.Status.Should().Be(WorkflowStatus.Draft);
        request.CurrentApprovalLevel.Should().Be(0);
        request.ApprovedByUserId.Should().BeNull();
        request.ApprovedByUserName.Should().BeNull();
        request.ApprovedAtUtc.Should().BeNull();
        request.ApprovalActions.Should().ContainSingle(a => a.Action == WorkflowAction.ResetToDraft && a.Comment!.Contains("Product pricing was calculated incorrectly"));
    }

    [Fact]
    public async Task Handler_ResetWorkflowToDraft_WithoutHighestPermission_ThrowsForbiddenException()
    {
        using var context = TestDbContextFactory.Create();
        var unauthorizedUserMock = new Mock<ICurrentUserService>();
        unauthorizedUserMock.Setup(s => s.UserId).Returns("regular-manager");
        unauthorizedUserMock.Setup(s => s.UserName).Returns("manager");
        unauthorizedUserMock.Setup(s => s.HasPermission(AppPermissions.WorkflowsResetToDraft)).Returns(false);

        var template = new WorkflowTemplate { Id = 550, Name = "Test Template" };
        var request = new WorkflowRequest
        {
            Id = 550,
            WorkflowTemplateId = 550,
            Title = "Reset Perm Test",
            RequestedByUserId = "user-123",
            Status = WorkflowStatus.InApproval,
            CurrentApprovalLevel = 2,
            TotalApprovalLevels = 3
        };
        context.WorkflowTemplates.Add(template);
        context.WorkflowRequests.Add(request);
        await context.SaveChangesAsync();

        var handler = new CleanArch.Application.Features.Workflows.Commands.ResetWorkflowToDraft.ResetWorkflowToDraftCommandHandler(context, unauthorizedUserMock.Object);
        var command = new CleanArch.Application.Features.Workflows.Commands.ResetWorkflowToDraft.ResetWorkflowToDraftCommand(550, "Attempt reset");

        var act = async () => await handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<ForbiddenException>()
            .WithMessage("*Workflows.ResetToDraft*");
    }

    [Fact]
    public async Task Handler_ResetWorkflowToDraft_WithHighestPermission_SuccessfullyResets()
    {
        using var context = TestDbContextFactory.Create();
        var superAdminMock = new Mock<ICurrentUserService>();
        superAdminMock.Setup(s => s.UserId).Returns("superadmin-id");
        superAdminMock.Setup(s => s.UserName).Returns("superadmin");
        superAdminMock.Setup(s => s.HasPermission(AppPermissions.WorkflowsResetToDraft)).Returns(true);

        var template = new WorkflowTemplate { Id = 600, Name = "Test Template" };
        var request = new WorkflowRequest
        {
            Id = 600,
            WorkflowTemplateId = 600,
            Title = "Wrong Product Spec",
            RequestedByUserId = "user-123",
            RequestedByUserName = "user",
            Status = WorkflowStatus.InApproval,
            CurrentApprovalLevel = 2,
            TotalApprovalLevels = 3
        };
        context.WorkflowTemplates.Add(template);
        context.WorkflowRequests.Add(request);
        await context.SaveChangesAsync();

        var handler = new CleanArch.Application.Features.Workflows.Commands.ResetWorkflowToDraft.ResetWorkflowToDraftCommandHandler(context, superAdminMock.Object);
        var command = new CleanArch.Application.Features.Workflows.Commands.ResetWorkflowToDraft.ResetWorkflowToDraftCommand(600, "Wrong product catalog items attached - reset to draft");

        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        result.Data!.Status.Should().Be(WorkflowStatus.Draft.ToString());
        result.Data.CurrentApprovalLevel.Should().Be(0);

        var persisted = await context.WorkflowRequests.FindAsync(600);
        persisted!.Status.Should().Be(WorkflowStatus.Draft);
    }
}
