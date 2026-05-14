using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HRDashboard.DataAccess.Migrations.Equipment
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Equipment",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    CompanyId = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    UnitNumber = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Type = table.Column<string>(type: "TEXT", maxLength: 30, nullable: false),
                    PlateNumber = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Vin = table.Column<string>(type: "TEXT", maxLength: 17, nullable: false),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    AssignedDriver = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    AssignedDriverId = table.Column<int>(type: "INTEGER", nullable: true),
                    InspectionDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Notes = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Equipment", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "Equipment");
        }
    }
}
