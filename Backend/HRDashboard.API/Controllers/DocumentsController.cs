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
    public class DocumentsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public DocumentsController(AppDbContext db) { _db = db; }

        // GET /api/documents/{driverId}
        // Returns all documents for a driver/applicant (protected)
        [HttpGet("{driverId}")]
        [Authorize]
        public async Task<IActionResult> GetByDriver(int driverId)
        {
            var companyId = TokenService.GetCompanyId(User);
            var docs = await _db.Documents
                .Where(d => d.DriverId == driverId && d.CompanyId == companyId)
                .ToListAsync();
            return Ok(docs);
        }

        // POST /api/documents
        // Upload a document (protected - for admin uploads)
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Upload([FromBody] Document doc)
        {
            doc.CompanyId  = TokenService.GetCompanyId(User);
            doc.UploadDate = DateTime.Now.ToString("MM/dd/yyyy");
            _db.Documents.Add(doc);
            await _db.SaveChangesAsync();
            return Ok(doc);
        }

        // POST /api/documents/public
        // Upload documents from application form (no auth - public)
        [HttpPost("public")]
        public async Task<IActionResult> UploadPublic([FromBody] PublicDocumentRequest req)
        {
            var doc = new Document
            {
                CompanyId  = "company-paks",
                DriverId   = req.DriverId,
                DocType    = req.DocType,
                Name       = req.Name,
                FileType   = req.FileType ?? "PDF",
                UploadDate = DateTime.Now.ToString("MM/dd/yyyy"),
                Size       = req.Size ?? "",
                Base64     = req.Base64,
            };
            _db.Documents.Add(doc);
            await _db.SaveChangesAsync();
            return Ok(doc);
        }

        // DELETE /api/documents/{id}
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var companyId = TokenService.GetCompanyId(User);
            var doc = await _db.Documents
                .FirstOrDefaultAsync(d => d.Id == id && d.CompanyId == companyId);
            if (doc == null) return NotFound();
            _db.Documents.Remove(doc);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Document deleted." });
        }
    }

    public record PublicDocumentRequest(
        int    DriverId,
        string DocType,
        string Name,
        string Base64,
        string? FileType,
        string? Size
    );
}
