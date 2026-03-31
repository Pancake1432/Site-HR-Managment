using HRDashboard.BusinessLayer.Services;
using HRDashboard.DataAccess.Context;
using HRDashboard.Domain.Entities;
using HRDashboard.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HRDashboard.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ApplicationsController : ControllerBase
    {
        private readonly AppDbContext         _db;
        private readonly IApplicantRepository _applicants;

        public ApplicationsController(AppDbContext db, IApplicantRepository applicants)
        {
            _db         = db;
            _applicants = applicants;
        }

        // POST /api/applications — public (no auth)
        [HttpPost]
        public async Task<IActionResult> Submit([FromBody] Application app)
        {
            app.Id          = $"APP-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";
            app.SubmittedAt = DateTime.UtcNow;
            app.Status      = "pending";

            var parts     = app.Name.Trim().Split(' ', 2);
            var applicant = new Applicant
            {
                CompanyId = app.CompanyId,
                Name      = app.Name,
                FirstName = parts[0],
                LastName  = parts.Length > 1 ? parts[1] : "",
                Position  = "Company Driver",
                Equipment = "Unsigned",
                Status    = "Documents Sent",
                Date      = DateTime.Now.ToString("MM/dd/yyyy"),
            };

            _db.Applications.Add(app);
            _db.Applicants.Add(applicant);
            await _db.SaveChangesAsync();

            return Ok(new { applicationId = app.Id, applicantId = applicant.Id, message = "Application submitted." });
        }

        // GET /api/applications — protected
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            var companyId = TokenService.GetCompanyId(User);
            var apps = await _db.Applications
                .Where(a => a.CompanyId == companyId)
                .OrderByDescending(a => a.SubmittedAt)
                .ToListAsync();
            return Ok(apps);
        }
    }
}
