using HRDashboard.BusinessLayer.Services;
using HRDashboard.Domain.DTOs;
using HRDashboard.Domain.Entities;
using HRDashboard.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRDashboard.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DocumentsController : ControllerBase
    {
        private readonly IDocumentRepository _repo;
        public DocumentsController(IDocumentRepository repo) { _repo = repo; }

        private string CompanyId => TokenService.GetCompanyId(User);

        // GET /api/documents/{driverId} — protected
        [HttpGet("{driverId}")]
        [Authorize]
        public async Task<IActionResult> GetByDriver(int driverId)
            => Ok(await _repo.GetByDriverAsync(driverId, CompanyId));

        // POST /api/documents — protected (admin upload)
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Upload([FromBody] Document doc)
        {
            doc.CompanyId = CompanyId;
            return Ok(await _repo.CreateAsync(doc));
        }

        // POST /api/documents/public — public (from application form)
        [HttpPost("public")]
        public async Task<IActionResult> UploadPublic([FromBody] PublicDocumentRequest req)
        {
            var doc = new Document
            {
                CompanyId = "company-paks",
                DriverId  = req.DriverId,
                DocType   = req.DocType,
                Name      = req.Name,
                FileType  = req.FileType ?? "PDF",
                Size      = req.Size ?? "",
                Base64    = req.Base64,
            };
            return Ok(await _repo.CreatePublicAsync(doc));
        }

        // DELETE /api/documents/{id} — protected
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var ok = await _repo.DeleteAsync(id, CompanyId);
            return ok ? Ok(new { message = "Document deleted." }) : NotFound();
        }
    }
}
