using HRDashboard.Domain.Entities;

namespace HRDashboard.Domain.Interfaces
{
    public interface IDriverRepository
    {
        Task<List<Driver>> GetAllAsync(string companyId);
        Task<Driver?>      GetByIdAsync(int id, string companyId);
        Task<Driver>       CreateAsync(Driver driver);
        Task<Driver?>      UpdateAsync(int id, string companyId, Action<Driver> update);
        Task<bool>         DeleteAsync(int id, string companyId);
    }

    public interface IApplicantRepository
    {
        Task<List<Applicant>> GetAllAsync(string companyId);
        Task<Applicant?>      GetByIdAsync(int id, string companyId);
        Task<Applicant>       CreateAsync(Applicant applicant);
        Task<Applicant?>      UpdateAsync(int id, string companyId, Action<Applicant> update);
        Task<bool>            SoftDeleteAsync(int id, string companyId);
    }

    public interface IDocumentRepository
    {
        Task<List<Document>> GetByDriverAsync(int driverId, string companyId);
        Task<Document>       CreateAsync(Document document);
        Task<Document>       CreatePublicAsync(Document document);
        Task<bool>           DeleteAsync(int id, string companyId);
    }

    public interface IStatementRepository
    {
        Task<List<SavedStatement>> GetAllAsync(string companyId);
        Task<SavedStatement>       CreateAsync(SavedStatement statement);
        Task<bool>                 DeleteAsync(string id, string companyId);
        Task<bool>                 DeleteAllAsync(string companyId);
    }

    public interface IUserRepository
    {
        Task<User?> GetByEmailAsync(string email);
    }
}
