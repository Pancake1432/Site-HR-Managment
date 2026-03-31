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
    public class DriversController : ControllerBase
    {
        private readonly AppDbContext _db;
        public DriversController(AppDbContext db) { _db = db; }

        // GET /api/drivers
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var companyId = TokenService.GetCompanyId(User);
            var drivers   = await _db.Drivers
                .Where(d => d.CompanyId == companyId)
                .ToListAsync();

            // Fix any drivers with empty Name — populate from FirstName+LastName
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

            return Ok(drivers.OrderBy(d => d.Name));
        }

        // GET /api/drivers/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var companyId = TokenService.GetCompanyId(User);
            var driver    = await _db.Drivers
                .FirstOrDefaultAsync(d => d.Id == id && d.CompanyId == companyId);
            return driver == null ? NotFound() : Ok(driver);
        }

        // POST /api/drivers
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Driver driver)
        {
            driver.CompanyId = TokenService.GetCompanyId(User);
            driver.Date      = DateTime.Now.ToString("MM/dd/yyyy");
            // Always ensure Name is set
            if (string.IsNullOrWhiteSpace(driver.Name))
                driver.Name = $"{driver.FirstName} {driver.LastName}".Trim();
            _db.Drivers.Add(driver);
            await _db.SaveChangesAsync();
            return Ok(driver);
        }

        // PUT /api/drivers/{id}
        // Uses a nullable DTO so only explicitly sent fields are updated
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateDriverDto dto)
        {
            var companyId = TokenService.GetCompanyId(User);
            var driver    = await _db.Drivers
                .FirstOrDefaultAsync(d => d.Id == id && d.CompanyId == companyId);
            if (driver == null) return NotFound();

            if (dto.Name             != null) driver.Name             = dto.Name;
            if (dto.FirstName        != null) driver.FirstName        = dto.FirstName;
            if (dto.LastName         != null) driver.LastName         = dto.LastName;
            if (dto.Position         != null) driver.Position         = dto.Position;
            if (dto.Equipment        != null) driver.Equipment        = dto.Equipment;
            if (dto.Status           != null) driver.Status           = dto.Status;
            if (dto.DriverStatus     != null) driver.DriverStatus     = dto.DriverStatus;
            if (dto.PaymentType      != null) driver.PaymentType      = dto.PaymentType;
            if (dto.EmploymentStatus != null) driver.EmploymentStatus = dto.EmploymentStatus;

            if (string.IsNullOrWhiteSpace(driver.Name))
                driver.Name = $"{driver.FirstName} {driver.LastName}".Trim();

            await _db.SaveChangesAsync();
            return Ok(driver);
        }

        // DELETE /api/drivers/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var companyId = TokenService.GetCompanyId(User);
            var driver    = await _db.Drivers
                .FirstOrDefaultAsync(d => d.Id == id && d.CompanyId == companyId);
            if (driver == null) return NotFound();

            _db.Drivers.Remove(driver);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Driver removed." });
        }
    }
}

public record UpdateDriverDto(
    string? Name,
    string? FirstName,
    string? LastName,
    string? Position,
    string? Equipment,
    string? Status,
    string? DriverStatus,
    string? PaymentType,
    string? EmploymentStatus
);
