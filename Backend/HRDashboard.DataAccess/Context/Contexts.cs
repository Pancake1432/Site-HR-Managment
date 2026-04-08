using HRDashboard.DataAccess;
using HRDashboard.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HRDashboard.DataAccess.Context
{
    public class UserContext : DbContext
    {
        public DbSet<UserData> Users { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder o)
            => o.UseSqlite(DbSession.ConnectionString);

        // No seed data here — seeding is handled in Program.cs so passwords
        // never appear in source code.
    }

    public class DriverContext : DbContext
    {
        public DbSet<DriverData> Drivers { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder o)
            => o.UseSqlite(DbSession.ConnectionString);
    }

    public class ApplicantContext : DbContext
    {
        public DbSet<ApplicantData> Applicants { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder o)
            => o.UseSqlite(DbSession.ConnectionString);
    }

    public class DocumentContext : DbContext
    {
        public DbSet<DocumentData> Documents { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder o)
            => o.UseSqlite(DbSession.ConnectionString);
    }

    public class StatementContext : DbContext
    {
        public DbSet<SavedStatementData> Statements { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder o)
            => o.UseSqlite(DbSession.ConnectionString);
    }
}
