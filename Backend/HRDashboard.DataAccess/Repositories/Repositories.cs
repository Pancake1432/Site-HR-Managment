using Microsoft.EntityFrameworkCore;
using HRDashboard.Domain.Entities;
using HRDashboard.Domain.Interfaces;
using HRDashboard.DataAccess.Context;

namespace HRDashboard.DataAccess.Repositories
{
    // ── Driver Repository ─────────────────────────────────────────────────────
    public class DriverRepository : IDriverRepository
    {
        private readonly AppDbContext _db;
        public DriverRepository(AppDbContext db) { _db = db; }

        public async Task<List<Driver>> GetAllAsync(string companyId)
        {
            var drivers = await _db.Drivers
                .Where(d => d.CompanyId == companyId)
                .ToListAsync();

            // Auto-fix empty names
            bool anyFixed = false;
            foreach (var d in drivers)
            {
                if (string.IsNullOrWhiteSpace(d.Name) &&
                    (!string.IsNullOrWhiteSpace(d.FirstName) || !string.IsNullOrWhiteSpace(d.LastName)))
                {
                    d.Name = $"{d.FirstName} {d.LastName}".Trim();
                    anyFixed = true;
                }
            }
            if (anyFixed) await _db.SaveChangesAsync();

            return drivers.OrderBy(d => d.Name).ToList();
        }

        public async Task<Driver?> GetByIdAsync(int id, string companyId)
            => await _db.Drivers.FirstOrDefaultAsync(d => d.Id == id && d.CompanyId == companyId);

        public async Task<Driver> CreateAsync(Driver driver)
        {
            if (string.IsNullOrWhiteSpace(driver.Name))
                driver.Name = $"{driver.FirstName} {driver.LastName}".Trim();
            _db.Drivers.Add(driver);
            await _db.SaveChangesAsync();
            return driver;
        }

        public async Task<Driver?> UpdateAsync(int id, string companyId, Action<Driver> update)
        {
            var driver = await GetByIdAsync(id, companyId);
            if (driver == null) return null;
            update(driver);
            if (string.IsNullOrWhiteSpace(driver.Name))
                driver.Name = $"{driver.FirstName} {driver.LastName}".Trim();
            await _db.SaveChangesAsync();
            return driver;
        }

        public async Task<bool> DeleteAsync(int id, string companyId)
        {
            var driver = await GetByIdAsync(id, companyId);
            if (driver == null) return false;
            _db.Drivers.Remove(driver);
            await _db.SaveChangesAsync();
            return true;
        }
    }

    // ── Applicant Repository ──────────────────────────────────────────────────
    public class ApplicantRepository : IApplicantRepository
    {
        private readonly AppDbContext _db;
        public ApplicantRepository(AppDbContext db) { _db = db; }

        public async Task<List<Applicant>> GetAllAsync(string companyId)
        {
            var list = await _db.Applicants
                .Where(a => a.CompanyId == companyId && !a.IsDeleted)
                .ToListAsync();

            bool anyFixed = false;
            foreach (var a in list)
            {
                if (string.IsNullOrWhiteSpace(a.Name) &&
                    (!string.IsNullOrWhiteSpace(a.FirstName) || !string.IsNullOrWhiteSpace(a.LastName)))
                {
                    a.Name = $"{a.FirstName} {a.LastName}".Trim();
                    anyFixed = true;
                }
            }
            if (anyFixed) await _db.SaveChangesAsync();

            return list.OrderByDescending(a => a.Id).ToList();
        }

        public async Task<Applicant?> GetByIdAsync(int id, string companyId)
            => await _db.Applicants.FirstOrDefaultAsync(a => a.Id == id && a.CompanyId == companyId && !a.IsDeleted);

        public async Task<Applicant> CreateAsync(Applicant applicant)
        {
            applicant.Date = DateTime.Now.ToString("MM/dd/yyyy");
            _db.Applicants.Add(applicant);
            await _db.SaveChangesAsync();
            return applicant;
        }

        public async Task<Applicant?> UpdateAsync(int id, string companyId, Action<Applicant> update)
        {
            var applicant = await GetByIdAsync(id, companyId);
            if (applicant == null) return null;
            update(applicant);
            await _db.SaveChangesAsync();
            return applicant;
        }

        public async Task<bool> SoftDeleteAsync(int id, string companyId)
        {
            var applicant = await GetByIdAsync(id, companyId);
            if (applicant == null) return false;
            applicant.IsDeleted = true;
            await _db.SaveChangesAsync();
            return true;
        }
    }

    // ── Document Repository ───────────────────────────────────────────────────
    public class DocumentRepository : IDocumentRepository
    {
        private readonly AppDbContext _db;
        public DocumentRepository(AppDbContext db) { _db = db; }

        public async Task<List<Document>> GetByDriverAsync(int driverId, string companyId)
            => await _db.Documents
                .Where(d => d.DriverId == driverId && d.CompanyId == companyId)
                .ToListAsync();

        public async Task<Document> CreateAsync(Document document)
        {
            document.UploadDate = DateTime.Now.ToString("MM/dd/yyyy");
            _db.Documents.Add(document);
            await _db.SaveChangesAsync();
            return document;
        }

        public async Task<Document> CreatePublicAsync(Document document)
        {
            document.CompanyId  = "company-paks";
            document.UploadDate = DateTime.Now.ToString("MM/dd/yyyy");
            _db.Documents.Add(document);
            await _db.SaveChangesAsync();
            return document;
        }

        public async Task<bool> DeleteAsync(int id, string companyId)
        {
            var doc = await _db.Documents.FirstOrDefaultAsync(d => d.Id == id && d.CompanyId == companyId);
            if (doc == null) return false;
            _db.Documents.Remove(doc);
            await _db.SaveChangesAsync();
            return true;
        }
    }

    // ── Statement Repository ──────────────────────────────────────────────────
    public class StatementRepository : IStatementRepository
    {
        private readonly AppDbContext _db;
        public StatementRepository(AppDbContext db) { _db = db; }

        public async Task<List<SavedStatement>> GetAllAsync(string companyId)
            => await _db.SavedStatements
                .Where(s => s.CompanyId == companyId)
                .OrderByDescending(s => s.SavedAt)
                .ToListAsync();

        public async Task<SavedStatement> CreateAsync(SavedStatement statement)
        {
            _db.SavedStatements.Add(statement);
            await _db.SaveChangesAsync();
            return statement;
        }

        public async Task<bool> DeleteAsync(string id, string companyId)
        {
            var s = await _db.SavedStatements.FirstOrDefaultAsync(x => x.Id == id && x.CompanyId == companyId);
            if (s == null) return false;
            _db.SavedStatements.Remove(s);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAllAsync(string companyId)
        {
            var all = _db.SavedStatements.Where(s => s.CompanyId == companyId);
            _db.SavedStatements.RemoveRange(all);
            await _db.SaveChangesAsync();
            return true;
        }
    }

    // ── User Repository ───────────────────────────────────────────────────────
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _db;
        public UserRepository(AppDbContext db) { _db = db; }

        public async Task<User?> GetByEmailAsync(string email)
            => await _db.Users.FirstOrDefaultAsync(u => u.Email == email.ToLower());
    }
}
