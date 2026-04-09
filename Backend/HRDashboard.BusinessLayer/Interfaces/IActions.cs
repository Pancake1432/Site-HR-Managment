using HRDashboard.Domain.Models;

namespace HRDashboard.BusinessLayer.Interfaces
{
    public interface IUserLoginAction
    {
        UserLoginResponseDto? UserLoginDataValidation(UserLoginDto udata);
    }

    public interface IDriverAction
    {
        List<DriverDto> GetAllDriversAction(string companyId);
        DriverDto?      GetDriverByIdAction(int id, string companyId);
        ActionResponse  CreateDriverAction(CreateDriverDto data, string companyId);
        ActionResponse  UpdateDriverAction(int id, UpdateDriverDto data, string companyId);
        ActionResponse  DeleteDriverAction(int id, string companyId);
    }

    public interface IApplicantAction
    {
        List<ApplicantDto> GetAllApplicantsAction(string companyId);
        ApplicantDto?      GetApplicantByIdAction(int id, string companyId);
        ActionResponse     CreateApplicantAction(CreateApplicantDto data, string companyId);
        ActionResponse     UpdateApplicantAction(int id, UpdateApplicantDto data, string companyId);
        ActionResponse     DeleteApplicantAction(int id, string companyId);
    }

    public interface IDocumentAction
    {
        List<DocumentDto> GetDocumentsByDriverAction(int driverId, string companyId);
        ActionResponse    UploadDocumentAction(CreateDocumentDto data, string companyId);
        ActionResponse    DeleteDocumentAction(int id, string companyId);
    }
}
