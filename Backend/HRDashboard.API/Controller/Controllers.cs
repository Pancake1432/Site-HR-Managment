using HRDashboard.BusinessLayer;
using HRDashboard.DataAccess;
using HRDashboard.BusinessLayer.Interfaces;
using HRDashboard.BusinessLayer.Structure;
using HRDashboard.DataAccess.Context;
using HRDashboard.Domain.Entities;
using HRDashboard.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HRDashboard.API.Services;

namespace HRDashboard.API.Controller
{
    // ── Health ────────────────────────────────────────────────────────────────
    [Route("api/health")]
    [ApiController]
    public class HealthController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
            => Ok(new { status = "healthy", version = "2.0.0", time = DateTime.UtcNow });
    }

    // ── Auth ──────────────────────────────────────────────────────────────────
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        internal IUserLoginAction _userAction;
        public AuthController()
        {
            _userAction = new BusinessLogic().UserLoginAction();
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] UserLoginDto udata)
        {
            var result = _userAction.UserLoginDataValidation(udata);
            if (result == null) return Unauthorized(new { message = "Invalid email or password." });
            return Ok(result);
        }
    }

    // ── Drivers ───────────────────────────────────────────────────────────────
    [Route("api/drivers")]
    [ApiController]
    [Authorize]
    public class DriverController : ControllerBase
    {
        internal IDriverAction _driver;
        public DriverController() { _driver = new BusinessLogic().DriverAction(); }
        private string CompanyId => TokenService.GetCompanyId(User);

        [HttpGet]
        public IActionResult GetAll() => Ok(_driver.GetAllDriversAction(CompanyId));

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var d = _driver.GetDriverByIdAction(id, CompanyId);
            return d == null ? NotFound() : Ok(d);
        }

        [HttpPost]
        public IActionResult Create([FromBody] CreateDriverDto data)
            => Ok(_driver.CreateDriverAction(data, CompanyId));

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] UpdateDriverDto data)
            => Ok(_driver.UpdateDriverAction(id, data, CompanyId));

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            // Delete all documents belonging to this driver
            using (var docDb = new DocumentContext())
            {
                var docs = docDb.Documents
                    .Where(d => d.DriverId == id && d.CompanyId == CompanyId)
                    .ToList();
                if (docs.Count > 0)
                {
                    docDb.Documents.RemoveRange(docs);
                    docDb.SaveChanges();
                }
            }

            // Delete all salary statements belonging to this driver
            using (var stmtDb = new StatementContext())
            {
                var stmts = stmtDb.Statements
                    .Where(s => s.DriverId == id && s.CompanyId == CompanyId)
                    .ToList();
                if (stmts.Count > 0)
                {
                    stmtDb.Statements.RemoveRange(stmts);
                    stmtDb.SaveChanges();
                }
            }

            return Ok(_driver.DeleteDriverAction(id, CompanyId));
        }
    }

    // ── Applicants ────────────────────────────────────────────────────────────
    [Route("api/applicants")]
    [ApiController]
    [Authorize]
    public class ApplicantController : ControllerBase
    {
        internal IApplicantAction _applicant;
        public ApplicantController() { _applicant = new BusinessLogic().ApplicantAction(); }
        private string CompanyId => TokenService.GetCompanyId(User);

        [HttpGet]
        public IActionResult GetAll() => Ok(_applicant.GetAllApplicantsAction(CompanyId));

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var a = _applicant.GetApplicantByIdAction(id, CompanyId);
            return a == null ? NotFound() : Ok(a);
        }

        [HttpPost]
        public IActionResult Create([FromBody] CreateApplicantDto data)
            => Ok(_applicant.CreateApplicantAction(data, CompanyId));

        [HttpPut("{id}")]
        [HttpPut("{id}/status")]
        public IActionResult Update(int id, [FromBody] UpdateApplicantDto data)
            => Ok(_applicant.UpdateApplicantAction(id, data, CompanyId));

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
            => Ok(_applicant.DeleteApplicantAction(id, CompanyId));

        // Promote applicant to driver
        [HttpPost("{id}/hire")]
        public IActionResult Hire(int id)
        {
            var applicant = _applicant.GetApplicantByIdAction(id, CompanyId);
            if (applicant == null) return NotFound();

            var driverAction = new BusinessLogic().DriverAction();
            var result = driverAction.CreateDriverAction(new CreateDriverDto
            {
                Name = applicant.Name,
                FirstName = applicant.FirstName,
                LastName = applicant.LastName,
                Position = applicant.Position,
                Equipment = applicant.Equipment == "Unsigned" ? "Van" : applicant.Equipment,
                DriverStatus = "Not Ready",
                PaymentType = "miles",
                EmploymentStatus = "Working",
            }, CompanyId);

            // Get the new driver's ID from the result so we can re-point documents
            var newDriverId = (result.Data as DriverDto)?.Id ?? 0;

            // Transfer all documents from the applicant to the new driver.
            // Documents are stored with DriverId = applicant.Id; after hiring
            // the applicant is deleted so those docs would become orphaned
            // unless we update their DriverId to match the new driver record.
            if (newDriverId > 0)
            {
                using var db = new DocumentContext();
                var docs = db.Documents
                    .Where(d => d.DriverId == id && d.CompanyId == CompanyId)
                    .ToList();

                if (docs.Count > 0)
                {
                    foreach (var doc in docs)
                        doc.DriverId = newDriverId;
                    db.SaveChanges();
                }
            }

            _applicant.DeleteApplicantAction(id, CompanyId);
            return Ok(result);
        }
    }

    // ── Documents ─────────────────────────────────────────────────────────────
    [Route("api/documents")]
    [ApiController]
    public class DocumentController : ControllerBase
    {
        internal IDocumentAction _document;
        public DocumentController() { _document = new BusinessLogic().DocumentAction(); }
        private string CompanyId => TokenService.GetCompanyId(User);

        [HttpGet("{driverId}")]
        [Authorize]
        public IActionResult GetByDriver(int driverId)
            => Ok(_document.GetDocumentsByDriverAction(driverId, CompanyId));

        [HttpPost]
        [Authorize]
        public IActionResult Upload([FromBody] CreateDocumentDto data)
            => Ok(_document.UploadDocumentAction(data, CompanyId));

        // Public upload — used by the application form (no auth token available)
        [HttpPost("public")]
        public IActionResult UploadPublic([FromBody] CreateDocumentDto data)
            => Ok(_document.UploadDocumentAction(data, "company-paks"));

        // Update expiry date on an existing document (CDL / Medical Card)
        [HttpPut("{id}/expiry")]
        [Authorize]
        public IActionResult SetExpiry(int id, [FromBody] SetExpiryDto dto)
        {
            using var db = new DocumentContext();
            var doc = db.Documents.FirstOrDefault(d => d.Id == id && d.CompanyId == CompanyId);
            if (doc == null) return NotFound();
            doc.ExpiryDate = string.IsNullOrWhiteSpace(dto.ExpiryDate)
                ? null
                : DateTime.Parse(dto.ExpiryDate);
            db.Documents.Update(doc);
            db.SaveChanges();
            return Ok(new { message = "Expiry date updated." });
        }

        [HttpDelete("{id}")]
        [Authorize]
        public IActionResult Delete(int id)
            => Ok(_document.DeleteDocumentAction(id, CompanyId));
    }

    // ── Statements ────────────────────────────────────────────────────────────
    [Route("api/statements")]
    [ApiController]
    [Authorize]
    public class StatementsController : ControllerBase
    {
        private string CompanyId => TokenService.GetCompanyId(User);

        [HttpGet]
        public IActionResult GetAll()
        {
            List<SavedStatementData> list;
            using (var db = new StatementContext())
                list = db.Statements
                    .Where(s => s.CompanyId == CompanyId)
                    .OrderByDescending(s => s.SavedAt)
                    .ToList();
            return Ok(list);
        }

        [HttpPost]
        public IActionResult Create([FromBody] SavedStatementDto dto)
        {
            var s = new SavedStatementData
            {
                Id = string.IsNullOrEmpty(dto.Id) ? Guid.NewGuid().ToString() : dto.Id,
                CompanyId = CompanyId,
                DriverId = dto.DriverId,
                DriverName = dto.DriverName,
                PaymentType = dto.PaymentType,
                Miles = dto.Miles,
                RatePerMile = dto.RatePerMile,
                Percent = dto.Percent,
                GrossAmount = dto.GrossAmount,
                AdjustmentType = dto.AdjustmentType,
                AdjustmentAmount = dto.AdjustmentAmount,
                AdjustmentReason = dto.AdjustmentReason,
                Adjustment = dto.Adjustment,
                Subtotal = dto.Subtotal,
                Total = dto.Total,
                SavedAt = DateTime.UtcNow,
            };
            using (var db = new StatementContext()) { db.Statements.Add(s); db.SaveChanges(); }
            return Ok(s);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(string id)
        {
            using (var db = new StatementContext())
            {
                var s = db.Statements.FirstOrDefault(x => x.Id == id && x.CompanyId == CompanyId);
                if (s == null) return NotFound();
                db.Statements.Remove(s); db.SaveChanges();
            }
            return Ok(new { message = "Statement deleted." });
        }

        [HttpDelete]
        public IActionResult DeleteAll()
        {
            using (var db = new StatementContext())
            {
                var all = db.Statements.Where(s => s.CompanyId == CompanyId).ToList();
                db.Statements.RemoveRange(all); db.SaveChanges();
            }
            return Ok(new { message = "All statements cleared." });
        }
    }

    // ── Applications — public form submission ─────────────────────────────────
    [Route("api/applications")]
    [ApiController]
    public class ApplicationsController : ControllerBase
    {
        private readonly EmailService _email;
        public ApplicationsController(EmailService email) { _email = email; }

        [HttpPost]
        public IActionResult Submit([FromBody] ApplicationSubmitDto dto)
        {
            var applicantAction = new BusinessLogic().ApplicantAction();
            var parts = (dto.Name ?? "").Trim().Split(' ', 2);

            var result = applicantAction.CreateApplicantAction(new CreateApplicantDto
            {
                Name = dto.Name ?? "",
                FirstName = parts[0],
                LastName = parts.Length > 1 ? parts[1] : "",
                Position = "Company Driver",
                Equipment = "Unsigned",
                Status = "Documents Sent",
            }, dto.CompanyId ?? "company-paks");

            var applicantDto = result.Data as ApplicantDto;
            var applicantId = applicantDto?.Id ?? 0;

            var appId = $"APP-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";
            var miamiTz = TimeZoneInfo.FindSystemTimeZoneById("Eastern Standard Time");
            var miamiTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, miamiTz);
            var miamiStr = miamiTime.ToString("MM/dd/yyyy hh:mm tt") + " ET";

            // 1. Notify admin about new application (fire-and-forget)
            _ = _email.SendToAdminAsync(
                $"📝 New Driver Application — {dto.Name}",
                $@"Hello,

A new driver application has been submitted.

  Name:        {dto.Name}
  Phone:       {dto.Phone ?? "—"}
  Email:       {dto.Email ?? "—"}
  City/State:  {dto.City ?? "—"}, {dto.State ?? "—"}
  Application: {appId}
  Submitted:   {miamiStr}

Log in to the HR dashboard to review the application and documents.

— {_email.CompanyName} HR System");

            // 2. Send confirmation email to the candidate (fire-and-forget)
            if (!string.IsNullOrWhiteSpace(dto.Email))
            {
                _ = _email.SendAsync(
                    dto.Email,
                    $"✅ Application Received — {_email.CompanyName}",
                    $@"Hello {dto.Name?.Split(' ')[0] ?? "there"},

Thank you for applying to {_email.CompanyName}!

We have received your application and will review it shortly.
Our team will contact you by phone or email within a few business days.

  Application ID: {appId}
  Submitted:      {miamiStr}

If you have any questions, please contact us at dispatch@pakslogistic.com.

— {_email.CompanyName} HR Team");
            }

            return Ok(new
            {
                applicationId = appId,
                applicantId = applicantId,
                message = "Application submitted successfully."
            });
        }
    }
}