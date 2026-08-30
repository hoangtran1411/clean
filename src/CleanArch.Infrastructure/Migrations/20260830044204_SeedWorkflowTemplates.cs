using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CleanArch.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedWorkflowTemplates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "WorkflowApprovalLevels",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAtUtc",
                value: new DateTime(2026, 8, 30, 4, 42, 3, 1, DateTimeKind.Utc).AddTicks(5885));

            migrationBuilder.UpdateData(
                table: "WorkflowApprovalLevels",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAtUtc",
                value: new DateTime(2026, 8, 30, 4, 42, 3, 1, DateTimeKind.Utc).AddTicks(8876));

            migrationBuilder.UpdateData(
                table: "WorkflowApprovalLevels",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAtUtc",
                value: new DateTime(2026, 8, 30, 4, 42, 3, 1, DateTimeKind.Utc).AddTicks(8879));

            migrationBuilder.UpdateData(
                table: "WorkflowApprovalLevels",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAtUtc",
                value: new DateTime(2026, 8, 30, 4, 42, 3, 1, DateTimeKind.Utc).AddTicks(8880));

            migrationBuilder.UpdateData(
                table: "WorkflowApprovalLevels",
                keyColumn: "Id",
                keyValue: 5,
                column: "CreatedAtUtc",
                value: new DateTime(2026, 8, 30, 4, 42, 3, 1, DateTimeKind.Utc).AddTicks(8882));

            migrationBuilder.UpdateData(
                table: "WorkflowApprovalLevels",
                keyColumn: "Id",
                keyValue: 6,
                column: "CreatedAtUtc",
                value: new DateTime(2026, 8, 30, 4, 42, 3, 1, DateTimeKind.Utc).AddTicks(8883));

            migrationBuilder.UpdateData(
                table: "WorkflowApprovalLevels",
                keyColumn: "Id",
                keyValue: 7,
                column: "CreatedAtUtc",
                value: new DateTime(2026, 8, 30, 4, 42, 3, 1, DateTimeKind.Utc).AddTicks(8885));

            migrationBuilder.UpdateData(
                table: "WorkflowTemplates",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAtUtc",
                value: new DateTime(2026, 8, 30, 4, 42, 3, 0, DateTimeKind.Utc).AddTicks(3698));

            migrationBuilder.UpdateData(
                table: "WorkflowTemplates",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAtUtc",
                value: new DateTime(2026, 8, 30, 4, 42, 3, 0, DateTimeKind.Utc).AddTicks(6438));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "WorkflowApprovalLevels",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAtUtc",
                value: new DateTime(2026, 8, 30, 4, 41, 54, 20, DateTimeKind.Utc).AddTicks(7750));

            migrationBuilder.UpdateData(
                table: "WorkflowApprovalLevels",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAtUtc",
                value: new DateTime(2026, 8, 30, 4, 41, 54, 21, DateTimeKind.Utc).AddTicks(1520));

            migrationBuilder.UpdateData(
                table: "WorkflowApprovalLevels",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAtUtc",
                value: new DateTime(2026, 8, 30, 4, 41, 54, 21, DateTimeKind.Utc).AddTicks(1525));

            migrationBuilder.UpdateData(
                table: "WorkflowApprovalLevels",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAtUtc",
                value: new DateTime(2026, 8, 30, 4, 41, 54, 21, DateTimeKind.Utc).AddTicks(1527));

            migrationBuilder.UpdateData(
                table: "WorkflowApprovalLevels",
                keyColumn: "Id",
                keyValue: 5,
                column: "CreatedAtUtc",
                value: new DateTime(2026, 8, 30, 4, 41, 54, 21, DateTimeKind.Utc).AddTicks(1529));

            migrationBuilder.UpdateData(
                table: "WorkflowApprovalLevels",
                keyColumn: "Id",
                keyValue: 6,
                column: "CreatedAtUtc",
                value: new DateTime(2026, 8, 30, 4, 41, 54, 21, DateTimeKind.Utc).AddTicks(1531));

            migrationBuilder.UpdateData(
                table: "WorkflowApprovalLevels",
                keyColumn: "Id",
                keyValue: 7,
                column: "CreatedAtUtc",
                value: new DateTime(2026, 8, 30, 4, 41, 54, 21, DateTimeKind.Utc).AddTicks(1533));

            migrationBuilder.UpdateData(
                table: "WorkflowTemplates",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAtUtc",
                value: new DateTime(2026, 8, 30, 4, 41, 54, 18, DateTimeKind.Utc).AddTicks(8943));

            migrationBuilder.UpdateData(
                table: "WorkflowTemplates",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAtUtc",
                value: new DateTime(2026, 8, 30, 4, 41, 54, 19, DateTimeKind.Utc).AddTicks(2868));
        }
    }
}
