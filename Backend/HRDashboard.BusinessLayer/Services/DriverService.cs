using HRDashboard.Domain.DTOs;
using HRDashboard.Domain.Entities;
using HRDashboard.Domain.Interfaces;

namespace HRDashboard.BusinessLayer.Services
{
    public class DriverService
    {
        private readonly IDriverRepository _repo;

        public DriverService(IDriverRepository repo) { _repo = repo; }

        public Task<List<Driver>> GetAllAsync(string companyId)
            => _repo.GetAllAsync(companyId);

        public Task<Driver?> GetByIdAsync(int id, string companyId)
            => _repo.GetByIdAsync(id, companyId);

        public async Task<Driver> CreateAsync(Driver driver, string companyId)
        {
            driver.CompanyId = companyId;
            driver.Date      = DateTime.Now.ToString("MM/dd/yyyy");
            return await _repo.CreateAsync(driver);
        }

        public Task<Driver?> UpdateAsync(int id, string companyId, UpdateDriverDto dto)
            => _repo.UpdateAsync(id, companyId, driver =>
            {
                if (dto.Name             != null) driver.Name             = dto.Name;
                if (dto.FirstName        != null) driver.FirstName        = dto.FirstName;
                if (dto.LastName         != null) driver.LastName         = dto.LastName;
                if (dto.Position         != null) driver.Position         = dto.Position;
                if (dto.Equipment        != null) driver.Equipment        = dto.Equipment;
                if (dto.Status           != null) driver.Status           = dto.Status;
                if (dto.DriverStatus     != null) driver.DriverStatus     = dto.DriverStatus;
                if (dto.PaymentType      != null) driver.PaymentType      = dto.PaymentType;
                if (dto.EmploymentStatus != null) driver.EmploymentStatus = dto.EmploymentStatus;
            });

        public Task<bool> DeleteAsync(int id, string companyId)
            => _repo.DeleteAsync(id, companyId);
    }
}
