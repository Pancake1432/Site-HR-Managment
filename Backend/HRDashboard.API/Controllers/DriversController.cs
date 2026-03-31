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
    public class DriversController : ControllerBase
    {
        private readonly DriverService _service;
        public DriversController(DriverService service) { _service = service; }

        private string CompanyId => TokenService.GetCompanyId(User);

        // GET /api/drivers
        [HttpGet]
        public async Task<IActionResult> GetAll()
            => Ok(await _service.GetAllAsync(CompanyId));

        // GET /api/drivers/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var driver = await _service.GetByIdAsync(id, CompanyId);
            return driver == null ? NotFound() : Ok(driver);
        }

        // POST /api/drivers
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Driver driver)
            => Ok(await _service.CreateAsync(driver, CompanyId));

        // PUT /api/drivers/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateDriverDto dto)
        {
            var result = await _service.UpdateAsync(id, CompanyId, dto);
            return result == null ? NotFound() : Ok(result);
        }

        // DELETE /api/drivers/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var ok = await _service.DeleteAsync(id, CompanyId);
            return ok ? Ok(new { message = "Driver removed." }) : NotFound();
        }
    }
}
