using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TransportInfoManagement.API.Migrations
{
    /// <inheritdoc />
    public partial class AddEmployeeRole : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "Employees",
                type: "varchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "Agent");

            // Update existing employees with appropriate roles based on their positions
            migrationBuilder.Sql(@"
                UPDATE Employees 
                SET Role = CASE 
                    WHEN Position LIKE '%Manager%' OR Position LIKE '%Director%' THEN 'Manager'
                    WHEN Position LIKE '%Lead%' OR Position LIKE '%Supervisor%' THEN 'Team Lead'
                    WHEN Position LIKE '%Coordinator%' THEN 'Supervisor'
                    ELSE 'Agent'
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Role",
                table: "Employees");
        }
    }
}

