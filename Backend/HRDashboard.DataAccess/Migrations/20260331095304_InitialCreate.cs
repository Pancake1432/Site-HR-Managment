using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace HRDashboard.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Applicants",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    CompanyId = table.Column<string>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    FirstName = table.Column<string>(type: "TEXT", nullable: false),
                    LastName = table.Column<string>(type: "TEXT", nullable: false),
                    Position = table.Column<string>(type: "TEXT", nullable: false),
                    Equipment = table.Column<string>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", nullable: false),
                    Date = table.Column<string>(type: "TEXT", nullable: false),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Applicants", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Applications",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    CompanyId = table.Column<string>(type: "TEXT", nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Phone = table.Column<string>(type: "TEXT", nullable: false),
                    Email = table.Column<string>(type: "TEXT", nullable: false),
                    City = table.Column<string>(type: "TEXT", nullable: false),
                    State = table.Column<string>(type: "TEXT", nullable: false),
                    Zip = table.Column<string>(type: "TEXT", nullable: false),
                    FamilyStatus = table.Column<string>(type: "TEXT", nullable: false),
                    DrivingExperience = table.Column<string>(type: "TEXT", nullable: false),
                    PreviousCompany = table.Column<string>(type: "TEXT", nullable: false),
                    ReasonForLeaving = table.Column<string>(type: "TEXT", nullable: false),
                    Felonies = table.Column<string>(type: "TEXT", nullable: false),
                    DrivingRecord = table.Column<string>(type: "TEXT", nullable: false),
                    WorkedReefer = table.Column<string>(type: "TEXT", nullable: false),
                    Dislike = table.Column<string>(type: "TEXT", nullable: false),
                    Hos = table.Column<string>(type: "TEXT", nullable: false),
                    OvernightPark = table.Column<string>(type: "TEXT", nullable: false),
                    SpecialConsideration = table.Column<string>(type: "TEXT", nullable: false),
                    OnRoad = table.Column<string>(type: "TEXT", nullable: false),
                    DrugTest = table.Column<string>(type: "TEXT", nullable: false),
                    SecuringUnloading = table.Column<string>(type: "TEXT", nullable: false),
                    SalaryExpectation = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Applications", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Documents",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    CompanyId = table.Column<string>(type: "TEXT", nullable: false),
                    DriverId = table.Column<int>(type: "INTEGER", nullable: false),
                    DocType = table.Column<string>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    FileType = table.Column<string>(type: "TEXT", nullable: false),
                    UploadDate = table.Column<string>(type: "TEXT", nullable: false),
                    Size = table.Column<string>(type: "TEXT", nullable: false),
                    Base64 = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Documents", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Drivers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    CompanyId = table.Column<string>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    FirstName = table.Column<string>(type: "TEXT", nullable: false),
                    LastName = table.Column<string>(type: "TEXT", nullable: false),
                    Position = table.Column<string>(type: "TEXT", nullable: false),
                    Equipment = table.Column<string>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", nullable: false),
                    Date = table.Column<string>(type: "TEXT", nullable: false),
                    IsEmployee = table.Column<bool>(type: "INTEGER", nullable: false),
                    DriverStatus = table.Column<string>(type: "TEXT", nullable: false),
                    PaymentType = table.Column<string>(type: "TEXT", nullable: false),
                    EmploymentStatus = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Drivers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SavedStatements",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    CompanyId = table.Column<string>(type: "TEXT", nullable: false),
                    DriverId = table.Column<int>(type: "INTEGER", nullable: false),
                    DriverName = table.Column<string>(type: "TEXT", nullable: false),
                    PaymentType = table.Column<string>(type: "TEXT", nullable: false),
                    Miles = table.Column<string>(type: "TEXT", nullable: false),
                    RatePerMile = table.Column<string>(type: "TEXT", nullable: false),
                    Percent = table.Column<string>(type: "TEXT", nullable: false),
                    GrossAmount = table.Column<string>(type: "TEXT", nullable: false),
                    AdjustmentType = table.Column<string>(type: "TEXT", nullable: false),
                    AdjustmentAmount = table.Column<string>(type: "TEXT", nullable: false),
                    AdjustmentReason = table.Column<string>(type: "TEXT", nullable: false),
                    Adjustment = table.Column<string>(type: "TEXT", nullable: false),
                    Subtotal = table.Column<string>(type: "TEXT", nullable: false),
                    Total = table.Column<string>(type: "TEXT", nullable: false),
                    SavedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SavedStatements", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Email = table.Column<string>(type: "TEXT", nullable: false),
                    PasswordHash = table.Column<string>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Role = table.Column<string>(type: "TEXT", nullable: false),
                    CompanyId = table.Column<string>(type: "TEXT", nullable: false),
                    CompanyName = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Applicants",
                columns: new[] { "Id", "CompanyId", "Date", "Equipment", "FirstName", "IsDeleted", "LastName", "Name", "Position", "Status" },
                values: new object[,]
                {
                    { 1, "company-paks", "07/22/23", "Van", "John", false, "Doe", "John Doe", "Owner Operator", "Applied" },
                    { 2, "company-paks", "07/22/23", "Reefer", "Jane", false, "Smith", "Jane Smith", "Company Driver", "Contacted" },
                    { 3, "company-paks", "07/22/23", "Flat Bed", "Mike", false, "Johnson", "Mike Johnson", "Owner Operator", "Documents Sent" },
                    { 4, "company-paks", "07/23/23", "Van", "Sarah", false, "Williams", "Sarah Williams", "Company Driver", "Applied" },
                    { 5, "company-paks", "07/23/23", "Reefer", "David", false, "Brown", "David Brown", "Company Driver", "Contacted" },
                    { 6, "company-paks", "07/24/23", "Flat Bed", "Emily", false, "Davis", "Emily Davis", "Owner Operator", "Documents Sent" },
                    { 7, "company-paks", "07/24/23", "Van", "Michael", false, "Wilson", "Michael Wilson", "Owner Operator", "Applied" },
                    { 8, "company-paks", "07/25/23", "Van", "Jennifer", false, "Martinez", "Jennifer Martinez", "Company Driver", "Contacted" },
                    { 9, "company-paks", "07/25/23", "Flat Bed", "Robert", false, "Taylor", "Robert Taylor", "Company Driver", "Applied" },
                    { 10, "company-paks", "07/26/23", "Reefer", "Jessica", false, "Anderson", "Jessica Anderson", "Owner Operator", "Documents Sent" }
                });

            migrationBuilder.InsertData(
                table: "Drivers",
                columns: new[] { "Id", "CompanyId", "Date", "DriverStatus", "EmploymentStatus", "Equipment", "FirstName", "IsEmployee", "LastName", "Name", "PaymentType", "Position", "Status" },
                values: new object[,]
                {
                    { 1, "company-paks", "01/15/2024", "Ready", "Working", "Van", "John", true, "Smith", "John Smith", "percent", "Owner Operator", "Applied" },
                    { 2, "company-paks", "01/18/2024", "Not Ready", "Fired", "Reefer", "Maria", true, "Garcia", "Maria Garcia", "miles", "Company Driver", "Contacted" },
                    { 3, "company-paks", "01/20/2024", "Ready", "Working", "Van", "James", true, "Wilson", "James Wilson", "miles", "Company Driver", "Documents Sent" },
                    { 4, "company-paks", "01/22/2024", "Ready", "Working", "Reefer", "Patricia", true, "Brown", "Patricia Brown", "percent", "Owner Operator", "Applied" },
                    { 5, "company-paks", "01/25/2024", "Not Ready", "Working", "Flat Bed", "Robert", true, "Jones", "Robert Jones", "percent", "Company Driver", "Contacted" },
                    { 6, "company-paks", "02/01/2024", "Ready", "Working", "Van", "Linda", true, "Davis", "Linda Davis", "percent", "Owner Operator", "Documents Sent" },
                    { 7, "company-paks", "02/03/2024", "Ready", "Working", "Van", "Michael", true, "Miller", "Michael Miller", "miles", "Company Driver", "Applied" },
                    { 8, "company-paks", "02/05/2024", "Not Ready", "Fired", "Flat Bed", "Elizabeth", true, "Martinez", "Elizabeth Martinez", "miles", "Company Driver", "Contacted" },
                    { 9, "company-paks", "02/08/2024", "Ready", "Working", "Reefer", "William", true, "Anderson", "William Anderson", "percent", "Owner Operator", "Applied" },
                    { 10, "company-paks", "02/10/2024", "Ready", "Working", "Reefer", "Jennifer", true, "Taylor", "Jennifer Taylor", "miles", "Company Driver", "Documents Sent" }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CompanyId", "CompanyName", "Email", "Name", "PasswordHash", "Role" },
                values: new object[,]
                {
                    { 1, "company-paks", "Paks Logistic LLC", "dispatch@pakslogistic.com", "Paks Admin", "$2a$11$6D1V/5sQqG6DdwN5yuVKjOUzCtGgybazNcYXyfJZT9t2nwCnjUdia", "admin" },
                    { 4, "company-paks", "Paks Logistic LLC", "accounting@pakslogistic.com", "Paks Accounting", "$2a$11$v7SN8nFpOdQhhGYGA6k8y.plu9KV/hHjZxfeBsk3qdj8rREx87sm6", "accounting" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Applicants");

            migrationBuilder.DropTable(
                name: "Applications");

            migrationBuilder.DropTable(
                name: "Documents");

            migrationBuilder.DropTable(
                name: "Drivers");

            migrationBuilder.DropTable(
                name: "SavedStatements");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
