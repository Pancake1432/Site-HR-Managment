using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HRDashboard.DataAccess.Migrations.Driver
{
    /// <inheritdoc />
    public partial class AddNotesToDriver : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "Drivers",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Notes",
                table: "Drivers");
        }
    }
}
