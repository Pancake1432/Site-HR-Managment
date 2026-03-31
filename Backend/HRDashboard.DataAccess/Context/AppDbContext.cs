using Microsoft.EntityFrameworkCore;
using HRDashboard.Domain.Entities;

namespace HRDashboard.DataAccess.Context
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User>           Users           => Set<User>();
        public DbSet<Driver>         Drivers         => Set<Driver>();
        public DbSet<Applicant>      Applicants      => Set<Applicant>();
        public DbSet<Document>       Documents       => Set<Document>();
        public DbSet<SavedStatement> SavedStatements => Set<SavedStatement>();
        public DbSet<Application>    Applications    => Set<Application>();

        protected override void OnModelCreating(ModelBuilder b)
        {
            // ── Seed Users ────────────────────────────────────────────────────
            b.Entity<User>().HasData(
                new User { Id = 1, Email = "dispatch@pakslogistic.com",   PasswordHash = BCrypt.Net.BCrypt.HashPassword("paks123"),  Name = "Paks Admin",      Role = "admin",      CompanyId = "company-paks", CompanyName = "Paks Logistic LLC" },
                new User { Id = 4, Email = "accounting@pakslogistic.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("acct123"),   Name = "Paks Accounting", Role = "accounting", CompanyId = "company-paks", CompanyName = "Paks Logistic LLC" }
            );

            // ── Seed Drivers ──────────────────────────────────────────────────
            b.Entity<Driver>().HasData(
                new Driver { Id = 1,  CompanyId = "company-paks", Name = "John Smith",       FirstName = "John",      LastName = "Smith",    Position = "Owner Operator", Equipment = "Van",      Status = "Applied",        Date = "01/15/2024", IsEmployee = true, DriverStatus = "Ready",     PaymentType = "percent", EmploymentStatus = "Working" },
                new Driver { Id = 2,  CompanyId = "company-paks", Name = "Maria Garcia",     FirstName = "Maria",     LastName = "Garcia",   Position = "Company Driver", Equipment = "Reefer",   Status = "Contacted",      Date = "01/18/2024", IsEmployee = true, DriverStatus = "Not Ready", PaymentType = "miles",   EmploymentStatus = "Fired"   },
                new Driver { Id = 3,  CompanyId = "company-paks", Name = "James Wilson",     FirstName = "James",     LastName = "Wilson",   Position = "Company Driver", Equipment = "Van",      Status = "Documents Sent", Date = "01/20/2024", IsEmployee = true, DriverStatus = "Ready",     PaymentType = "miles",   EmploymentStatus = "Working" },
                new Driver { Id = 4,  CompanyId = "company-paks", Name = "Patricia Brown",   FirstName = "Patricia",  LastName = "Brown",    Position = "Owner Operator", Equipment = "Reefer",   Status = "Applied",        Date = "01/22/2024", IsEmployee = true, DriverStatus = "Ready",     PaymentType = "percent", EmploymentStatus = "Working" },
                new Driver { Id = 5,  CompanyId = "company-paks", Name = "Robert Jones",     FirstName = "Robert",    LastName = "Jones",    Position = "Company Driver", Equipment = "Flat Bed", Status = "Contacted",      Date = "01/25/2024", IsEmployee = true, DriverStatus = "Not Ready", PaymentType = "percent", EmploymentStatus = "Working" },
                new Driver { Id = 6,  CompanyId = "company-paks", Name = "Linda Davis",      FirstName = "Linda",     LastName = "Davis",    Position = "Owner Operator", Equipment = "Van",      Status = "Documents Sent", Date = "02/01/2024", IsEmployee = true, DriverStatus = "Ready",     PaymentType = "percent", EmploymentStatus = "Working" },
                new Driver { Id = 7,  CompanyId = "company-paks", Name = "Michael Miller",   FirstName = "Michael",   LastName = "Miller",   Position = "Company Driver", Equipment = "Van",      Status = "Applied",        Date = "02/03/2024", IsEmployee = true, DriverStatus = "Ready",     PaymentType = "miles",   EmploymentStatus = "Working" },
                new Driver { Id = 8,  CompanyId = "company-paks", Name = "Elizabeth Martinez", FirstName = "Elizabeth", LastName = "Martinez", Position = "Company Driver", Equipment = "Flat Bed", Status = "Contacted",    Date = "02/05/2024", IsEmployee = true, DriverStatus = "Not Ready", PaymentType = "miles",   EmploymentStatus = "Fired"   },
                new Driver { Id = 9,  CompanyId = "company-paks", Name = "William Anderson", FirstName = "William",   LastName = "Anderson", Position = "Owner Operator", Equipment = "Reefer",   Status = "Applied",        Date = "02/08/2024", IsEmployee = true, DriverStatus = "Ready",     PaymentType = "percent", EmploymentStatus = "Working" },
                new Driver { Id = 10, CompanyId = "company-paks", Name = "Jennifer Taylor",  FirstName = "Jennifer",  LastName = "Taylor",   Position = "Company Driver", Equipment = "Reefer",   Status = "Documents Sent", Date = "02/10/2024", IsEmployee = true, DriverStatus = "Ready",     PaymentType = "miles",   EmploymentStatus = "Working" }
            );

            // ── Seed Applicants ───────────────────────────────────────────────
            b.Entity<Applicant>().HasData(
                new Applicant { Id = 1,  CompanyId = "company-paks", Name = "John Doe",          FirstName = "John",     LastName = "Doe",      Position = "Owner Operator", Equipment = "Van",      Status = "Applied",        Date = "07/22/23" },
                new Applicant { Id = 2,  CompanyId = "company-paks", Name = "Jane Smith",        FirstName = "Jane",     LastName = "Smith",    Position = "Company Driver", Equipment = "Reefer",   Status = "Contacted",      Date = "07/22/23" },
                new Applicant { Id = 3,  CompanyId = "company-paks", Name = "Mike Johnson",      FirstName = "Mike",     LastName = "Johnson",  Position = "Owner Operator", Equipment = "Flat Bed", Status = "Documents Sent", Date = "07/22/23" },
                new Applicant { Id = 4,  CompanyId = "company-paks", Name = "Sarah Williams",    FirstName = "Sarah",    LastName = "Williams", Position = "Company Driver", Equipment = "Van",      Status = "Applied",        Date = "07/23/23" },
                new Applicant { Id = 5,  CompanyId = "company-paks", Name = "David Brown",       FirstName = "David",    LastName = "Brown",    Position = "Company Driver", Equipment = "Reefer",   Status = "Contacted",      Date = "07/23/23" },
                new Applicant { Id = 6,  CompanyId = "company-paks", Name = "Emily Davis",       FirstName = "Emily",    LastName = "Davis",    Position = "Owner Operator", Equipment = "Flat Bed", Status = "Documents Sent", Date = "07/24/23" },
                new Applicant { Id = 7,  CompanyId = "company-paks", Name = "Michael Wilson",    FirstName = "Michael",  LastName = "Wilson",   Position = "Owner Operator", Equipment = "Van",      Status = "Applied",        Date = "07/24/23" },
                new Applicant { Id = 8,  CompanyId = "company-paks", Name = "Jennifer Martinez", FirstName = "Jennifer", LastName = "Martinez", Position = "Company Driver", Equipment = "Van",      Status = "Contacted",      Date = "07/25/23" },
                new Applicant { Id = 9,  CompanyId = "company-paks", Name = "Robert Taylor",     FirstName = "Robert",   LastName = "Taylor",   Position = "Company Driver", Equipment = "Flat Bed", Status = "Applied",        Date = "07/25/23" },
                new Applicant { Id = 10, CompanyId = "company-paks", Name = "Jessica Anderson",  FirstName = "Jessica",  LastName = "Anderson", Position = "Owner Operator", Equipment = "Reefer",   Status = "Documents Sent", Date = "07/26/23" }
            );
        }
    }
}
