using HRDashboard.Domain.DTOs;
using HRDashboard.Domain.Entities;
using HRDashboard.Domain.Interfaces;

namespace HRDashboard.BusinessLayer.Services
{
    public class ApplicantService
    {
        private readonly IApplicantRepository _repo;
        private readonly IDriverRepository    _drivers;
        private readonly IDocumentRepository  _docs;

        public ApplicantService(
            IApplicantRepository repo,
            IDriverRepository    drivers,
            IDocumentRepository  docs)
        {
            _repo    = repo;
            _drivers = drivers;
            _docs    = docs;
        }

        public Task<List<Applicant>> GetAllAsync(string companyId)
            => _repo.GetAllAsync(companyId);

        public Task<Applicant?> GetByIdAsync(int id, string companyId)
            => _repo.GetByIdAsync(id, companyId);

        public Task<Applicant> CreateAsync(Applicant applicant, string companyId)
        {
            applicant.CompanyId = companyId;
            return _repo.CreateAsync(applicant);
        }

        public Task<Applicant?> UpdateStatusAsync(int id, string companyId, UpdateStatusRequest req)
            => _repo.UpdateAsync(id, companyId, a =>
            {
                if (req.Status    != null) a.Status    = req.Status;
                if (req.Equipment != null) a.Equipment = req.Equipment;
            });

        public Task<Applicant?> UpdateEquipmentAsync(int id, string companyId, UpdateEquipmentRequest req)
            => _repo.UpdateAsync(id, companyId, a => a.Equipment = req.Equipment);

        public Task<bool> DeleteAsync(int id, string companyId)
            => _repo.SoftDeleteAsync(id, companyId);

        /// <summary>Promovează applicant → driver și copiază documentele</summary>
        public async Task<Driver?> HireAsync(int id, string companyId)
        {
            var applicant = await _repo.GetByIdAsync(id, companyId);
            if (applicant == null) return null;

            var driver = new Driver
            {
                CompanyId        = companyId,
                Name             = applicant.Name,
                FirstName        = applicant.FirstName,
                LastName         = applicant.LastName,
                Position         = applicant.Position,
                Equipment        = applicant.Equipment == "Unsigned" ? "Van" : applicant.Equipment,
                Status           = "Applied",
                Date             = DateTime.Now.ToString("MM/dd/yyyy"),
                IsEmployee       = true,
                DriverStatus     = "Not Ready",
                PaymentType      = "miles",
                EmploymentStatus = "Working",
            };

            var created = await _drivers.CreateAsync(driver);

            // Copy documents from applicant to new driver
            var applicantDocs = await _docs.GetByDriverAsync(applicant.Id, companyId);
            foreach (var doc in applicantDocs)
            {
                await _docs.CreateAsync(new Document
                {
                    CompanyId  = companyId,
                    DriverId   = created.Id,
                    DocType    = doc.DocType,
                    Name       = doc.Name,
                    FileType   = doc.FileType,
                    UploadDate = doc.UploadDate,
                    Size       = doc.Size,
                    Base64     = doc.Base64,
                });
            }

            // Soft-delete applicant
            await _repo.SoftDeleteAsync(applicant.Id, companyId);

            return created;
        }
    }
}
