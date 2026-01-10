using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RecruitmentSystemAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddCandidateDocumentFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InterviewFeedbacks_Users_InterviewerId",
                table: "InterviewFeedbacks");

            migrationBuilder.DropIndex(
                name: "IX_InterviewFeedbacks_InterviewerId",
                table: "InterviewFeedbacks");

            migrationBuilder.DropIndex(
                name: "IX_InterviewFeedbacks_InterviewId",
                table: "InterviewFeedbacks");

            migrationBuilder.DropColumn(
                name: "InterviewerId",
                table: "InterviewFeedbacks");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "Interviews",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "RoundType",
                table: "Interviews",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Interviewers",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Interviewers",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<string>(
                name: "BackgroundCheckStatus",
                table: "CandidateDocuments",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Verified",
                table: "CandidateDocuments",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_InterviewFeedbacks_InterviewerUserId",
                table: "InterviewFeedbacks",
                column: "InterviewerUserId");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewFeedbacks_InterviewId_InterviewerUserId",
                table: "InterviewFeedbacks",
                columns: new[] { "InterviewId", "InterviewerUserId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_InterviewFeedbacks_Users_InterviewerUserId",
                table: "InterviewFeedbacks",
                column: "InterviewerUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InterviewFeedbacks_Users_InterviewerUserId",
                table: "InterviewFeedbacks");

            migrationBuilder.DropIndex(
                name: "IX_InterviewFeedbacks_InterviewerUserId",
                table: "InterviewFeedbacks");

            migrationBuilder.DropIndex(
                name: "IX_InterviewFeedbacks_InterviewId_InterviewerUserId",
                table: "InterviewFeedbacks");

            migrationBuilder.DropColumn(
                name: "BackgroundCheckStatus",
                table: "CandidateDocuments");

            migrationBuilder.DropColumn(
                name: "Verified",
                table: "CandidateDocuments");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "Interviews",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(30)",
                oldMaxLength: 30);

            migrationBuilder.AlterColumn<string>(
                name: "RoundType",
                table: "Interviews",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AddColumn<int>(
                name: "InterviewerId",
                table: "InterviewFeedbacks",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Interviewers",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(150)",
                oldMaxLength: 150);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Interviewers",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.CreateIndex(
                name: "IX_InterviewFeedbacks_InterviewerId",
                table: "InterviewFeedbacks",
                column: "InterviewerId");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewFeedbacks_InterviewId",
                table: "InterviewFeedbacks",
                column: "InterviewId");

            migrationBuilder.AddForeignKey(
                name: "FK_InterviewFeedbacks_Users_InterviewerId",
                table: "InterviewFeedbacks",
                column: "InterviewerId",
                principalTable: "Users",
                principalColumn: "Id");
        }
    }
}
