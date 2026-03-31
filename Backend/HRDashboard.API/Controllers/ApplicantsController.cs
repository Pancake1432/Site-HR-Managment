using HRDashboard.BusinessLayer.Services;
using HRDashboard.Domain.DTOs;
using HRDashboard.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRDashboard.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ApplicantsController : ControllerBase
    {
        private readonly ApplicantService _service;
        public ApplicantsController(ApplicantService service) { _service = service; }

        private string CompanyId => TokenService.GetCompanyId(User);

        // GET /api/applicants
        [HttpGet]
        public async Task<IActionResult> GetAll()
            => Ok(await _service.GetAllAsync(CompanyId));

        // GET /api/applicants/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var a = await _service.GetByIdAsync(id, CompanyId);
            return a == null ? NotFound() : Ok(a);
        }

        // POST /api/applicants
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Applicant applicant)
            => Ok(await _service.CreateAsync(applicant, CompanyId));

        // PUT /api/applicants/{id}/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusRequest req)
        {
            var result = await _service.UpdateStatusAsync(id, CompanyId, req);
            return result == null ? NotFound() : Ok(result);
        }

        // PUT /api/applicants/{id}/equipment
        [HttpPut("{id}/equipment")]
        public async Task<IActionResult> UpdateEquipment(int id, [FromBody] UpdateEquipmentRequest req)
        {
            var result = await _service.UpdateEquipmentAsync(id, CompanyId, req);
            return result == null ? NotFound() : Ok(result);
        }

        // POST /api/applicants/{id}/hire
        [HttpPost("{id}/hire")]
        public async Task<IActionResult> Hire(int id)
        {
            var driver = await _service.HireAsync(id, CompanyId);
            return driver == null ? NotFound() : Ok(driver);
        }

        // DELETE /api/applicants/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var ok = await _service.DeleteAsync(id, CompanyId);
            return ok ? Ok(new { message = "Applicant removed." }) : NotFound();
        }
    }
}
