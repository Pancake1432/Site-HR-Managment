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
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Email = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    PasswordHash = table.Column<string>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Role = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    CompanyId = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    CompanyName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CompanyId", "CompanyName", "Email", "Name", "PasswordHash", "Role" },
                values: new object[,]
                {
                    { 1, "company-paks", "Paks Logistic LLC", "dispatch@pakslogistic.com", "Paks Admin", "$2a$11$YXFM.cjpJGvSUQVoecy8fOFqb8n0iLyV1ALp0.1.YxZsNMJuGl.Qy", "admin" },
                    { 2, "company-paks", "Paks Logistic LLC", "accounting@pakslogistic.com", "Paks Accounting", "$2a$11$xVuQG.4dpHibXlwVh6YnX.I9fDKs96dw6uPKh4NbDEih8FNAdVQXa", "accounting" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
