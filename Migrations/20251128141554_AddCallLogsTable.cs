using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TransportInfoManagement.API.Migrations
{
    /// <inheritdoc />
    public partial class AddCallLogsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // TEMPORARY: Commented out because tables already exist in DB
            /*
            migrationBuilder.AlterColumn<string>(
                name: "Email",
            // ... (rest of the code)
            */
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CallLogs");

            migrationBuilder.DropIndex(
                name: "IX_Users_Email",
                table: "Users");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Users",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(255)")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 26, 13, 51, 33, 130, DateTimeKind.Utc).AddTicks(5094));

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 26, 13, 51, 33, 130, DateTimeKind.Utc).AddTicks(5097));

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 26, 13, 51, 33, 130, DateTimeKind.Utc).AddTicks(5099));

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 26, 13, 51, 33, 130, DateTimeKind.Utc).AddTicks(5100));

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "Id",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 26, 13, 51, 33, 130, DateTimeKind.Utc).AddTicks(5101));

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "Id",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 26, 13, 51, 33, 130, DateTimeKind.Utc).AddTicks(5102));

            migrationBuilder.UpdateData(
                table: "ServiceFees",
                keyColumn: "Id",
                keyValue: 1,
                column: "UpdatedAt",
                value: new DateTime(2025, 11, 26, 13, 51, 33, 130, DateTimeKind.Utc).AddTicks(5052));

            migrationBuilder.UpdateData(
                table: "ServiceFees",
                keyColumn: "Id",
                keyValue: 2,
                column: "UpdatedAt",
                value: new DateTime(2025, 11, 26, 13, 51, 33, 130, DateTimeKind.Utc).AddTicks(5057));

            migrationBuilder.UpdateData(
                table: "ServiceFees",
                keyColumn: "Id",
                keyValue: 3,
                column: "UpdatedAt",
                value: new DateTime(2025, 11, 26, 13, 51, 33, 130, DateTimeKind.Utc).AddTicks(5058));

            migrationBuilder.UpdateData(
                table: "Services",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 26, 13, 51, 33, 130, DateTimeKind.Utc).AddTicks(4846));

            migrationBuilder.UpdateData(
                table: "Services",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 26, 13, 51, 33, 130, DateTimeKind.Utc).AddTicks(4853));

            migrationBuilder.UpdateData(
                table: "Services",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 26, 13, 51, 33, 130, DateTimeKind.Utc).AddTicks(4854));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 11, 26, 13, 51, 33, 130, DateTimeKind.Utc).AddTicks(5148), "$2a$11$T5GEN3lBfOT/6aDBIcejq.npRshOptPonn/aduAjrKYcEx/ZNSu1u" });
        }
    }
}
