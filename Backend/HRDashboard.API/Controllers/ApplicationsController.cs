using HRDashboard.API.Data;
using HRDashboard.API.Models;
using Microsoft.AspNetCore.Mvc;

namespace HRDashboard.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ApplicationsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public ApplicationsController(AppDbContext db) { _db = db; }

        // POST /api/applications
        // Apelat de formularul multi-step (nu necesită autentificare — e public)
        [HttpPost]
        public async Task<IActionResult> Submit([FromBody] Application app)
        {
            app.Id          = $"APP-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";
            app.SubmittedAt = DateTime.UtcNow;
            app.Status      = "pending";

            // Creăm și applicant-ul în tabelul Applicants (vizibil în Documents tab)
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

            return Ok(new { applicationId = app.Id, applicantId = applicant.Id, message = "Application submitted successfully." });
        }

        // GET /api/applications (protected — pentru admin)
        [Microsoft.AspNetCore.Authorization.Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var companyId = Services.TokenService.GetCompanyId(User);
            var apps      = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions
                .ToListAsync(_db.Applications.Where(a => a.CompanyId == companyId)
                .OrderByDescending(a => a.SubmittedAt));
            return Ok(apps);
        }
    }
}
