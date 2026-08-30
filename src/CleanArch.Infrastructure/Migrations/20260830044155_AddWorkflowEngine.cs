using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace CleanArch.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddWorkflowEngine : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WorkflowHistories_WorkflowRequests_WorkflowRequestId",
                table: "WorkflowHistories");

            migrationBuilder.DropIndex(
                name: "IX_WorkflowHistories_WorkflowRequestId",
                table: "WorkflowHistories");

            migrationBuilder.DropColumn(
                name: "FinalApprovedAtUtc",
                table: "WorkflowRequests");

            migrationBuilder.DropColumn(
                name: "FinalApprovedByUserId",
                table: "WorkflowRequests");

            migrationBuilder.DropColumn(
                name: "FinalApprovedByUserName",
                table: "WorkflowRequests");

            migrationBuilder.DropColumn(
                name: "Level1ApprovedAtUtc",
                table: "WorkflowRequests");

            migrationBuilder.DropColumn(
                name: "Level1ApprovedByUserId",
                table: "WorkflowRequests");

            migrationBuilder.DropColumn(
                name: "Level1ApprovedByUserName",
                table: "WorkflowRequests");

            migrationBuilder.RenameColumn(
                name: "Level2ApprovedByUserName",
                table: "WorkflowRequests",
                newName: "ApprovedByUserName");

            migrationBuilder.RenameColumn(
                name: "Level2ApprovedByUserId",
                table: "WorkflowRequests",
                newName: "ApprovedByUserId");

            migrationBuilder.RenameColumn(
                name: "Level2ApprovedAtUtc",
                table: "WorkflowRequests",
                newName: "ApprovedAtUtc");

            migrationBuilder.AddColumn<int>(
                name: "CurrentApprovalLevel",
                table: "WorkflowRequests",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TotalApprovalLevels",
                table: "WorkflowRequests",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "WorkflowTemplateId",
                table: "WorkflowRequests",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "WorkflowApprovalActions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    WorkflowRequestId = table.Column<int>(type: "INTEGER", nullable: false),
                    ApprovalLevel = table.Column<int>(type: "INTEGER", nullable: false),
                    Action = table.Column<int>(type: "INTEGER", nullable: false),
                    ActedByUserId = table.Column<string>(type: "TEXT", nullable: false),
                    ActedByUserName = table.Column<string>(type: "TEXT", nullable: false),
                    Comment = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: false),
                    LastModifiedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkflowApprovalActions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkflowApprovalActions_WorkflowRequests_WorkflowRequestId",
                        column: x => x.WorkflowRequestId,
                        principalTable: "WorkflowRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WorkflowTemplates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: false),
                    LastModifiedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkflowTemplates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WorkflowApprovalLevels",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    WorkflowTemplateId = table.Column<int>(type: "INTEGER", nullable: false),
                    LevelOrder = table.Column<int>(type: "INTEGER", nullable: false),
                    LevelName = table.Column<string>(type: "TEXT", nullable: false),
                    RequiredPermission = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: false),
                    LastModifiedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkflowApprovalLevels", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkflowApprovalLevels_WorkflowTemplates_WorkflowTemplateId",
                        column: x => x.WorkflowTemplateId,
                        principalTable: "WorkflowTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "WorkflowTemplates",
                columns: new[] { "Id", "CreatedAtUtc", "Description", "IsActive", "LastModifiedAtUtc", "Name" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 8, 30, 4, 41, 54, 18, DateTimeKind.Utc).AddTicks(8943), "TeamLeader -> DepartmentHead -> TechnicalDirector", true, null, "Standard Approval (3 Levels)" },
                    { 2, new DateTime(2026, 8, 30, 4, 41, 54, 19, DateTimeKind.Utc).AddTicks(2868), "TeamLeader -> DepartmentHead -> DeputyDirector -> TechnicalDirector", true, null, "Extended Approval (4 Levels)" }
                });

            migrationBuilder.InsertData(
                table: "WorkflowApprovalLevels",
                columns: new[] { "Id", "CreatedAtUtc", "LastModifiedAtUtc", "LevelName", "LevelOrder", "RequiredPermission", "WorkflowTemplateId" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 8, 30, 4, 41, 54, 20, DateTimeKind.Utc).AddTicks(7750), null, "Team Leader", 1, "Workflows.Approve.TeamLeader", 1 },
                    { 2, new DateTime(2026, 8, 30, 4, 41, 54, 21, DateTimeKind.Utc).AddTicks(1520), null, "Department Head", 2, "Workflows.Approve.DepartmentHead", 1 },
                    { 3, new DateTime(2026, 8, 30, 4, 41, 54, 21, DateTimeKind.Utc).AddTicks(1525), null, "Technical Director", 3, "Workflows.Approve.TechnicalDirector", 1 },
                    { 4, new DateTime(2026, 8, 30, 4, 41, 54, 21, DateTimeKind.Utc).AddTicks(1527), null, "Team Leader", 1, "Workflows.Approve.TeamLeader", 2 },
                    { 5, new DateTime(2026, 8, 30, 4, 41, 54, 21, DateTimeKind.Utc).AddTicks(1529), null, "Department Head", 2, "Workflows.Approve.DepartmentHead", 2 },
                    { 6, new DateTime(2026, 8, 30, 4, 41, 54, 21, DateTimeKind.Utc).AddTicks(1531), null, "Deputy Director", 3, "Workflows.Approve.DeputyDirector", 2 },
                    { 7, new DateTime(2026, 8, 30, 4, 41, 54, 21, DateTimeKind.Utc).AddTicks(1533), null, "Technical Director", 4, "Workflows.Approve.TechnicalDirector", 2 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowRequests_WorkflowTemplateId",
                table: "WorkflowRequests",
                column: "WorkflowTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowApprovalActions_WorkflowRequestId",
                table: "WorkflowApprovalActions",
                column: "WorkflowRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowApprovalLevels_WorkflowTemplateId_LevelOrder",
                table: "WorkflowApprovalLevels",
                columns: new[] { "WorkflowTemplateId", "LevelOrder" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkflowRequests_WorkflowTemplates_WorkflowTemplateId",
                table: "WorkflowRequests",
                column: "WorkflowTemplateId",
                principalTable: "WorkflowTemplates",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WorkflowRequests_WorkflowTemplates_WorkflowTemplateId",
                table: "WorkflowRequests");

            migrationBuilder.DropTable(
                name: "WorkflowApprovalActions");

            migrationBuilder.DropTable(
                name: "WorkflowApprovalLevels");

            migrationBuilder.DropTable(
                name: "WorkflowTemplates");

            migrationBuilder.DropIndex(
                name: "IX_WorkflowRequests_WorkflowTemplateId",
                table: "WorkflowRequests");

            migrationBuilder.DropColumn(
                name: "CurrentApprovalLevel",
                table: "WorkflowRequests");

            migrationBuilder.DropColumn(
                name: "TotalApprovalLevels",
                table: "WorkflowRequests");

            migrationBuilder.DropColumn(
                name: "WorkflowTemplateId",
                table: "WorkflowRequests");

            migrationBuilder.RenameColumn(
                name: "ApprovedByUserName",
                table: "WorkflowRequests",
                newName: "Level2ApprovedByUserName");

            migrationBuilder.RenameColumn(
                name: "ApprovedByUserId",
                table: "WorkflowRequests",
                newName: "Level2ApprovedByUserId");

            migrationBuilder.RenameColumn(
                name: "ApprovedAtUtc",
                table: "WorkflowRequests",
                newName: "Level2ApprovedAtUtc");

            migrationBuilder.AddColumn<DateTime>(
                name: "FinalApprovedAtUtc",
                table: "WorkflowRequests",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FinalApprovedByUserId",
                table: "WorkflowRequests",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FinalApprovedByUserName",
                table: "WorkflowRequests",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "Level1ApprovedAtUtc",
                table: "WorkflowRequests",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Level1ApprovedByUserId",
                table: "WorkflowRequests",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Level1ApprovedByUserName",
                table: "WorkflowRequests",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowHistories_WorkflowRequestId",
                table: "WorkflowHistories",
                column: "WorkflowRequestId");

            migrationBuilder.AddForeignKey(
                name: "FK_WorkflowHistories_WorkflowRequests_WorkflowRequestId",
                table: "WorkflowHistories",
                column: "WorkflowRequestId",
                principalTable: "WorkflowRequests",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
