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
    public class StatementsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public StatementsController(AppDbContext db) { _db = db; }

        // GET /api/statements
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var companyId  = TokenService.GetCompanyId(User);
            var statements = await _db.SavedStatements
                .Where(s => s.CompanyId == companyId)
                .OrderByDescending(s => s.SavedAt)
                .ToListAsync();
            return Ok(statements);
        }

        // POST /api/statements
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] SavedStatement statement)
        {
            statement.CompanyId = TokenService.GetCompanyId(User);
            statement.Id        = $"stmt-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";
            statement.SavedAt   = DateTime.UtcNow;
            _db.SavedStatements.Add(statement);
            await _db.SaveChangesAsync();
            return Ok(statement);
        }

        // DELETE /api/statements/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var companyId = TokenService.GetCompanyId(User);
            var statement = await _db.SavedStatements
                .FirstOrDefaultAsync(s => s.Id == id && s.CompanyId == companyId);
            if (statement == null) return NotFound();

            _db.SavedStatements.Remove(statement);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Statement removed." });
        }

        // DELETE /api/statements  (clear all for company)
        [HttpDelete]
        public async Task<IActionResult> ClearAll()
        {
            var companyId  = TokenService.GetCompanyId(User);
            var statements = _db.SavedStatements.Where(s => s.CompanyId == companyId);
            _db.SavedStatements.RemoveRange(statements);
            await _db.SaveChangesAsync();
            return Ok(new { message = "All statements cleared." });
        }
    }
}
