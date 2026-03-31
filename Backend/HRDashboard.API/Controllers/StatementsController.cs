using HRDashboard.Domain.Entities;
using HRDashboard.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRDashboard.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class StatementsController : ControllerBase
    {
        private readonly IStatementRepository _repo;
        public StatementsController(IStatementRepository repo) { _repo = repo; }

        private string CompanyId => BusinessLayer.Services.TokenService.GetCompanyId(User);

        // GET /api/statements
        [HttpGet]
        public async Task<IActionResult> GetAll()
            => Ok(await _repo.GetAllAsync(CompanyId));

        // POST /api/statements
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] SavedStatement statement)
        {
            statement.CompanyId = CompanyId;
            statement.SavedAt   = DateTime.UtcNow;
            return Ok(await _repo.CreateAsync(statement));
        }

        // DELETE /api/statements/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var ok = await _repo.DeleteAsync(id, CompanyId);
            return ok ? Ok(new { message = "Statement deleted." }) : NotFound();
        }

        // DELETE /api/statements — delete all
        [HttpDelete]
        public async Task<IActionResult> DeleteAll()
        {
            await _repo.DeleteAllAsync(CompanyId);
            return Ok(new { message = "All statements cleared." });
        }
    }
}
