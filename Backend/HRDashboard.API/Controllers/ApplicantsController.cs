using HRDashboard.API.Data;
using HRDashboard.API.Models;
using HRDashboard.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HRDashboard.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ApplicantsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public ApplicantsController(AppDbContext db) { _db = db; }

        // GET /api/applicants
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var companyId  = TokenService.GetCompanyId(User);
            var applicants = await _db.Applicants
                .Where(a => a.CompanyId == companyId && !a.IsDeleted)
                .ToListAsync();

            // Fix any applicants with empty Name
            bool anyFixed = false;
            foreach (var a in applicants)
            {
                if (string.IsNullOrWhiteSpace(a.Name) &&
                    (!string.IsNullOrWhiteSpace(a.FirstName) || !string.IsNullOrWhiteSpace(a.LastName)))
                {
                    a.Name = $"{a.FirstName} {a.LastName}".Trim();
                    anyFixed = true;
                }
            }
            if (anyFixed) await _db.SaveChangesAsync();

            return Ok(applicants.OrderByDescending(a => a.Id));
        }

        // POST /api/applicants
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Applicant applicant)
        {
            applicant.CompanyId = TokenService.GetCompanyId(User);
            applicant.Date      = DateTime.Now.ToString("MM/dd/yyyy");
            _db.Applicants.Add(applicant);
            await _db.SaveChangesAsync();
            return Ok(applicant);
        }

        // PUT /api/applicants/{id}/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusRequest req)
        {
            var companyId = TokenService.GetCompanyId(User);
            var applicant = await _db.Applicants
                .FirstOrDefaultAsync(a => a.Id == id && a.CompanyId == companyId);
            if (applicant == null) return NotFound();

            if (req.Status    != null) applicant.Status    = req.Status;
            if (req.Equipment != null) applicant.Equipment = req.Equipment;
            await _db.SaveChangesAsync();
            return Ok(applicant);
        }


        // PUT /api/applicants/{id}/equipment
        [HttpPut("{id}/equipment")]
        public async Task<IActionResult> UpdateEquipment(int id, [FromBody] UpdateEquipmentRequest req)
        {
            var companyId = TokenService.GetCompanyId(User);
            var applicant = await _db.Applicants
                .FirstOrDefaultAsync(a => a.Id == id && a.CompanyId == companyId);
            if (applicant == null) return NotFound();

            applicant.Equipment = req.Equipment;
            await _db.SaveChangesAsync();
            return Ok(applicant);
        }

        // POST /api/applicants/{id}/hire
        // Mută applicant → driver + copiază documentele
        [HttpPost("{id}/hire")]
        public async Task<IActionResult> Hire(int id)
        {
            var companyId = TokenService.GetCompanyId(User);
            var applicant = await _db.Applicants
                .FirstOrDefaultAsync(a => a.Id == id && a.CompanyId == companyId);
            if (applicant == null) return NotFound();

            var driver = new Driver
            {
                CompanyId        = companyId,
                Name             = applicant.Name,
                FirstName        = applicant.FirstName,
                LastName         = applicant.LastName,
                Position         = applicant.Position,
                Equipment        = applicant.Equipment == "Unsigned" ? "Van" : applicant.Equipment,
                Status           = "Applied",
                Date             = DateTime.Now.ToString("MM/dd/yyyy"),
                IsEmployee       = true,
                DriverStatus     = "Not Ready",
                PaymentType      = "miles",
                EmploymentStatus = "Working"
            };

            _db.Drivers.Add(driver);
            applicant.IsDeleted = true;
            await _db.SaveChangesAsync(); // driver.Id is now generated

            // Copy all documents from applicant → new driver
            var applicantDocs = await _db.Documents
                .Where(d => d.DriverId == applicant.Id && d.CompanyId == companyId)
                .ToListAsync();

            foreach (var doc in applicantDocs)
            {
                _db.Documents.Add(new Document
                {
                    CompanyId  = companyId,
                    DriverId   = driver.Id,
                    DocType    = doc.DocType,
                    Name       = doc.Name,
                    FileType   = doc.FileType,
                    UploadDate = doc.UploadDate,
                    Size       = doc.Size,
                    Base64     = doc.Base64,
                });
            }
            await _db.SaveChangesAsync();

            return Ok(driver);
        }

        // DELETE /api/applicants/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var companyId = TokenService.GetCompanyId(User);
            var applicant = await _db.Applicants
                .FirstOrDefaultAsync(a => a.Id == id && a.CompanyId == companyId);
            if (applicant == null) return NotFound();

            applicant.IsDeleted = true;
            await _db.SaveChangesAsync();
            return Ok(new { message = "Applicant removed." });
        }
    }

    public record UpdateStatusRequest(string? Status, string? Equipment);
    public record UpdateEquipmentRequest(string Equipment);
}
