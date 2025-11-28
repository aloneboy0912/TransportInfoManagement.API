using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace TransportInfoManagement.API.Migrations
{
    /// <inheritdoc />
    public partial class AddContactsTableOnly : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Clients",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    ClientCode = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CompanyName = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ContactPerson = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Email = table.Column<string>(type: "varchar(255)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Phone = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Address = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    City = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Country = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Clients", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Contacts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Name = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Email = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Company = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Phone = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Subject = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Message = table.Column<string>(type: "text", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    IsProcessed = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Contacts", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Departments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Name = table.Column<string>(type: "varchar(255)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Description = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Departments", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Services",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Name = table.Column<string>(type: "varchar(255)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Description = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Services", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Username = table.Column<string>(type: "varchar(255)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PasswordHash = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Email = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FullName = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Role = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Payments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    ClientId = table.Column<int>(type: "int", nullable: false),
                    PaymentCode = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PaymentDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    DueDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    PaymentMethod = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Status = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Notes = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Payments_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Products",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    ClientId = table.Column<int>(type: "int", nullable: false),
                    ProductName = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ProductCode = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Description = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Category = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Products_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Employees",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    EmployeeCode = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FullName = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Email = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Phone = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Position = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ServiceId = table.Column<int>(type: "int", nullable: false),
                    DepartmentId = table.Column<int>(type: "int", nullable: false),
                    HireDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Employees", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Employees_Departments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalTable: "Departments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Employees_Services_ServiceId",
                        column: x => x.ServiceId,
                        principalTable: "Services",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "ServiceFees",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    ServiceId = table.Column<int>(type: "int", nullable: false),
                    FeePerDayPerEmployee = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceFees", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServiceFees_Services_ServiceId",
                        column: x => x.ServiceId,
                        principalTable: "Services",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "ClientServices",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    ClientId = table.Column<int>(type: "int", nullable: false),
                    ServiceId = table.Column<int>(type: "int", nullable: false),
                    EmployeeId = table.Column<int>(type: "int", nullable: true),
                    NumberOfEmployees = table.Column<int>(type: "int", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClientServices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClientServices_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ClientServices_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ClientServices_Services_ServiceId",
                        column: x => x.ServiceId,
                        principalTable: "Services",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.InsertData(
                table: "Clients",
                columns: new[] { "Id", "Address", "City", "ClientCode", "CompanyName", "ContactPerson", "Country", "CreatedAt", "Email", "IsActive", "Phone" },
                values: new object[,]
                {
                    { 1, "123 Tech Street", "San Francisco", "CLI001", "Tech Solutions Inc.", "Robert Chen", "USA", new DateTime(2023, 7, 5, 0, 0, 0, 0, DateTimeKind.Utc), "robert.chen@techsolutions.com", true, "+1-555-1001" },
                    { 2, "456 Business Ave", "New York", "CLI002", "Global Enterprises Ltd.", "Maria Garcia", "USA", new DateTime(2023, 8, 4, 0, 0, 0, 0, DateTimeKind.Utc), "maria.garcia@globalent.com", true, "+1-555-1002" },
                    { 3, "789 Innovation Blvd", "Seattle", "CLI003", "Digital Innovations Corp.", "James Wilson", "USA", new DateTime(2023, 9, 3, 0, 0, 0, 0, DateTimeKind.Utc), "james.wilson@digitalinnov.com", true, "+1-555-1003" },
                    { 4, "321 Service Road", "Chicago", "CLI004", "Premier Services Group", "Sarah Thompson", "USA", new DateTime(2023, 6, 15, 0, 0, 0, 0, DateTimeKind.Utc), "sarah.thompson@premierservices.com", true, "+1-555-1004" },
                    { 5, "654 System Drive", "Austin", "CLI005", "Advanced Systems Co.", "Michael Rodriguez", "USA", new DateTime(2023, 10, 3, 0, 0, 0, 0, DateTimeKind.Utc), "michael.rodriguez@advancedsys.com", true, "+1-555-1005" },
                    { 6, "987 Elite Plaza", "Los Angeles", "CLI006", "Elite Business Partners", "Jennifer Martinez", "USA", new DateTime(2023, 11, 2, 0, 0, 0, 0, DateTimeKind.Utc), "jennifer.martinez@elitebiz.com", true, "+1-555-1006" },
                    { 7, "147 Strategy Lane", "Boston", "CLI007", "Strategic Solutions LLC", "David Kim", "USA", new DateTime(2023, 4, 26, 0, 0, 0, 0, DateTimeKind.Utc), "david.kim@strategicsol.com", true, "+1-555-1007" },
                    { 8, "258 Prime Street", "Denver", "CLI008", "Prime Consulting Group", "Lisa Anderson", "USA", new DateTime(2023, 9, 23, 0, 0, 0, 0, DateTimeKind.Utc), "lisa.anderson@primeconsult.com", true, "+1-555-1008" },
                    { 9, "369 Modern Way", "Portland", "CLI009", "Modern Tech Solutions", "Christopher Brown", "USA", new DateTime(2023, 10, 18, 0, 0, 0, 0, DateTimeKind.Utc), "christopher.brown@moderntech.com", true, "+1-555-1009" },
                    { 10, "741 Excellence Blvd", "Miami", "CLI010", "Excellence Corporation", "Amanda White", "USA", new DateTime(2023, 11, 17, 0, 0, 0, 0, DateTimeKind.Utc), "amanda.white@excellencecorp.com", true, "+1-555-1010" },
                    { 11, "852 Innovation Center", "San Diego", "CLI011", "Innovation Hub Inc.", "Daniel Lee", "USA", new DateTime(2023, 12, 2, 0, 0, 0, 0, DateTimeKind.Utc), "daniel.lee@innovationhub.com", true, "+1-555-1011" },
                    { 12, "963 Professional Park", "Phoenix", "CLI012", "Professional Services Co.", "Nicole Taylor", "USA", new DateTime(2023, 12, 12, 0, 0, 0, 0, DateTimeKind.Utc), "nicole.taylor@profservices.com", true, "+1-555-1012" }
                });

            migrationBuilder.InsertData(
                table: "Departments",
                columns: new[] { "Id", "CreatedAt", "Description", "IsActive", "Name" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 11, 26, 13, 51, 33, 130, DateTimeKind.Utc).AddTicks(5094), "Human Resources", true, "HR" },
                    { 2, new DateTime(2025, 11, 26, 13, 51, 33, 130, DateTimeKind.Utc).AddTicks(5097), "Administration", true, "Admin" },
                    { 3, new DateTime(2025, 11, 26, 13, 51, 33, 130, DateTimeKind.Utc).AddTicks(5099), "Service Department", true, "Service" },
                    { 4, new DateTime(2025, 11, 26, 13, 51, 33, 130, DateTimeKind.Utc).AddTicks(5100), "Training Department", true, "Training" },
                    { 5, new DateTime(2025, 11, 26, 13, 51, 33, 130, DateTimeKind.Utc).AddTicks(5101), "Internet Security Department", true, "Internet Security" },
                    { 6, new DateTime(2025, 11, 26, 13, 51, 33, 130, DateTimeKind.Utc).AddTicks(5102), "Auditing Department", true, "Auditors" }
                });

            migrationBuilder.InsertData(
                table: "Services",
                columns: new[] { "Id", "CreatedAt", "Description", "IsActive", "Name" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 11, 26, 13, 51, 33, 130, DateTimeKind.Utc).AddTicks(4846), "Receiving calls from customers", true, "In-bound Services" },
                    { 2, new DateTime(2025, 11, 26, 13, 51, 33, 130, DateTimeKind.Utc).AddTicks(4853), "Staff proactively calling customers", true, "Out-bound Services" },
                    { 3, new DateTime(2025, 11, 26, 13, 51, 33, 130, DateTimeKind.Utc).AddTicks(4854), "Marketing and sales services via telephone", true, "Tele Marketing Services" }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "Email", "FullName", "PasswordHash", "Role", "Username" },
                values: new object[] { 1, new DateTime(2025, 11, 26, 13, 51, 33, 130, DateTimeKind.Utc).AddTicks(5148), "admin@excell-on.com", "Administrator", "$2a$11$T5GEN3lBfOT/6aDBIcejq.npRshOptPonn/aduAjrKYcEx/ZNSu1u", "Admin", "admin" });

            migrationBuilder.InsertData(
                table: "Employees",
                columns: new[] { "Id", "CreatedAt", "DepartmentId", "Email", "EmployeeCode", "FullName", "HireDate", "IsActive", "Phone", "Position", "ServiceId" },
                values: new object[,]
                {
                    { 1, new DateTime(2023, 9, 3, 0, 0, 0, 0, DateTimeKind.Utc), 3, "john.smith@excell-on.com", "EMP001", "John Smith", new DateTime(2023, 9, 3, 0, 0, 0, 0, DateTimeKind.Utc), true, "+1-555-0101", "Customer Service Representative", 1 },
                    { 2, new DateTime(2023, 6, 15, 0, 0, 0, 0, DateTimeKind.Utc), 3, "sarah.johnson@excell-on.com", "EMP002", "Sarah Johnson", new DateTime(2023, 6, 15, 0, 0, 0, 0, DateTimeKind.Utc), true, "+1-555-0102", "Sales Manager", 2 },
                    { 3, new DateTime(2023, 10, 3, 0, 0, 0, 0, DateTimeKind.Utc), 3, "michael.brown@excell-on.com", "EMP003", "Michael Brown", new DateTime(2023, 10, 3, 0, 0, 0, 0, DateTimeKind.Utc), true, "+1-555-0103", "Telemarketing Specialist", 3 },
                    { 4, new DateTime(2023, 3, 7, 0, 0, 0, 0, DateTimeKind.Utc), 1, "emily.davis@excell-on.com", "EMP004", "Emily Davis", new DateTime(2023, 3, 7, 0, 0, 0, 0, DateTimeKind.Utc), true, "+1-555-0104", "HR Manager", 1 },
                    { 5, new DateTime(2023, 11, 2, 0, 0, 0, 0, DateTimeKind.Utc), 2, "david.wilson@excell-on.com", "EMP005", "David Wilson", new DateTime(2023, 11, 2, 0, 0, 0, 0, DateTimeKind.Utc), true, "+1-555-0105", "Administrative Assistant", 1 },
                    { 6, new DateTime(2023, 8, 4, 0, 0, 0, 0, DateTimeKind.Utc), 4, "jessica.martinez@excell-on.com", "EMP006", "Jessica Martinez", new DateTime(2023, 8, 4, 0, 0, 0, 0, DateTimeKind.Utc), true, "+1-555-0106", "Training Coordinator", 2 },
                    { 7, new DateTime(2023, 7, 5, 0, 0, 0, 0, DateTimeKind.Utc), 5, "robert.taylor@excell-on.com", "EMP007", "Robert Taylor", new DateTime(2023, 7, 5, 0, 0, 0, 0, DateTimeKind.Utc), true, "+1-555-0107", "Security Analyst", 1 },
                    { 8, new DateTime(2023, 9, 23, 0, 0, 0, 0, DateTimeKind.Utc), 6, "lisa.anderson@excell-on.com", "EMP008", "Lisa Anderson", new DateTime(2023, 9, 23, 0, 0, 0, 0, DateTimeKind.Utc), true, "+1-555-0108", "Auditor", 3 },
                    { 9, new DateTime(2023, 4, 26, 0, 0, 0, 0, DateTimeKind.Utc), 3, "james.thomas@excell-on.com", "EMP009", "James Thomas", new DateTime(2023, 4, 26, 0, 0, 0, 0, DateTimeKind.Utc), true, "+1-555-0109", "Customer Support Lead", 1 },
                    { 10, new DateTime(2023, 11, 17, 0, 0, 0, 0, DateTimeKind.Utc), 3, "amanda.white@excell-on.com", "EMP010", "Amanda White", new DateTime(2023, 11, 17, 0, 0, 0, 0, DateTimeKind.Utc), true, "+1-555-0110", "Sales Representative", 2 },
                    { 11, new DateTime(2023, 10, 18, 0, 0, 0, 0, DateTimeKind.Utc), 3, "christopher.lee@excell-on.com", "EMP011", "Christopher Lee", new DateTime(2023, 10, 18, 0, 0, 0, 0, DateTimeKind.Utc), true, "+1-555-0111", "Marketing Specialist", 3 },
                    { 12, new DateTime(2023, 12, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1, "michelle.harris@excell-on.com", "EMP012", "Michelle Harris", new DateTime(2023, 12, 2, 0, 0, 0, 0, DateTimeKind.Utc), true, "+1-555-0112", "HR Coordinator", 1 }
                });

            migrationBuilder.InsertData(
                table: "ServiceFees",
                columns: new[] { "Id", "FeePerDayPerEmployee", "ServiceId", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, 4500.00m, 1, new DateTime(2025, 11, 26, 13, 51, 33, 130, DateTimeKind.Utc).AddTicks(5052) },
                    { 2, 6000.00m, 2, new DateTime(2025, 11, 26, 13, 51, 33, 130, DateTimeKind.Utc).AddTicks(5057) },
                    { 3, 5500.00m, 3, new DateTime(2025, 11, 26, 13, 51, 33, 130, DateTimeKind.Utc).AddTicks(5058) }
                });

            migrationBuilder.InsertData(
                table: "ClientServices",
                columns: new[] { "Id", "ClientId", "CreatedAt", "EmployeeId", "EndDate", "IsActive", "NumberOfEmployees", "ServiceId", "StartDate" },
                values: new object[,]
                {
                    { 1, 1, new DateTime(2023, 8, 4, 0, 0, 0, 0, DateTimeKind.Utc), 1, null, true, 3, 1, new DateTime(2023, 8, 4, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 2, 2, new DateTime(2023, 9, 3, 0, 0, 0, 0, DateTimeKind.Utc), 2, null, true, 5, 2, new DateTime(2023, 9, 3, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 3, 3, new DateTime(2023, 9, 23, 0, 0, 0, 0, DateTimeKind.Utc), 3, new DateTime(2023, 12, 22, 0, 0, 0, 0, DateTimeKind.Utc), false, 2, 3, new DateTime(2023, 9, 23, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 4, 4, new DateTime(2023, 7, 5, 0, 0, 0, 0, DateTimeKind.Utc), 4, null, true, 4, 1, new DateTime(2023, 7, 5, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 5, 5, new DateTime(2023, 10, 13, 0, 0, 0, 0, DateTimeKind.Utc), 5, null, true, 6, 2, new DateTime(2023, 10, 13, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 6, 6, new DateTime(2023, 11, 2, 0, 0, 0, 0, DateTimeKind.Utc), 6, null, true, 3, 3, new DateTime(2023, 11, 2, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 7, 7, new DateTime(2023, 6, 15, 0, 0, 0, 0, DateTimeKind.Utc), 7, null, true, 2, 1, new DateTime(2023, 6, 15, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 8, 8, new DateTime(2023, 10, 3, 0, 0, 0, 0, DateTimeKind.Utc), 8, new DateTime(2023, 12, 27, 0, 0, 0, 0, DateTimeKind.Utc), false, 4, 2, new DateTime(2023, 10, 3, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 9, 9, new DateTime(2023, 10, 23, 0, 0, 0, 0, DateTimeKind.Utc), 9, null, true, 5, 3, new DateTime(2023, 10, 23, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 10, 10, new DateTime(2023, 11, 22, 0, 0, 0, 0, DateTimeKind.Utc), 10, null, true, 3, 1, new DateTime(2023, 11, 22, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 11, 11, new DateTime(2023, 12, 2, 0, 0, 0, 0, DateTimeKind.Utc), 11, null, true, 4, 2, new DateTime(2023, 12, 2, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 12, 12, new DateTime(2023, 12, 12, 0, 0, 0, 0, DateTimeKind.Utc), 12, null, true, 2, 3, new DateTime(2023, 12, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 13, 1, new DateTime(2023, 11, 12, 0, 0, 0, 0, DateTimeKind.Utc), 2, null, true, 3, 2, new DateTime(2023, 11, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 14, 2, new DateTime(2023, 9, 13, 0, 0, 0, 0, DateTimeKind.Utc), 1, null, true, 4, 1, new DateTime(2023, 9, 13, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 15, 3, new DateTime(2023, 10, 8, 0, 0, 0, 0, DateTimeKind.Utc), 4, null, true, 2, 1, new DateTime(2023, 10, 8, 0, 0, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Clients_Email",
                table: "Clients",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ClientServices_ClientId",
                table: "ClientServices",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_ClientServices_EmployeeId",
                table: "ClientServices",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_ClientServices_ServiceId",
                table: "ClientServices",
                column: "ServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_Departments_Name",
                table: "Departments",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Employees_DepartmentId",
                table: "Employees",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_ServiceId",
                table: "Employees",
                column: "ServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_ClientId",
                table: "Payments",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_ClientId",
                table: "Products",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceFees_ServiceId",
                table: "ServiceFees",
                column: "ServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_Services_Name",
                table: "Services",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ClientServices");

            migrationBuilder.DropTable(
                name: "Contacts");

            migrationBuilder.DropTable(
                name: "Payments");

            migrationBuilder.DropTable(
                name: "Products");

            migrationBuilder.DropTable(
                name: "ServiceFees");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Employees");

            migrationBuilder.DropTable(
                name: "Clients");

            migrationBuilder.DropTable(
                name: "Departments");

            migrationBuilder.DropTable(
                name: "Services");
        }
    }
}
