using HRDashboard.BusinessLayer.Core;
using HRDashboard.BusinessLayer.Interfaces;
using HRDashboard.Domain.Models;

namespace HRDashboard.BusinessLayer.Structure
{
    public class UserAuthActionExecution : UserActions, IUserLoginAction
    {
        public UserLoginResponseDto? UserLoginDataValidation(UserLoginDto udata)
            => UserLoginDataValidationExecution(udata);
    }

    public class DriverActionExecution : DriverActions, IDriverAction
    {
        public List<DriverDto> GetAllDriversAction(string companyId)              => GetAllDriversActionExecution(companyId);
        public DriverDto?      GetDriverByIdAction(int id, string companyId)      => GetDriverByIdActionExecution(id, companyId);
        public ActionResponse  CreateDriverAction(CreateDriverDto d, string cid)  => CreateDriverActionExecution(d, cid);
        public ActionResponse  UpdateDriverAction(int id, UpdateDriverDto d, string cid) => UpdateDriverActionExecution(id, d, cid);
        public ActionResponse  DeleteDriverAction(int id, string companyId)       => DeleteDriverActionExecution(id, companyId);
    }

    public class ApplicantActionExecution : ApplicantActions, IApplicantAction
    {
        public List<ApplicantDto> GetAllApplicantsAction(string companyId)                    => GetAllApplicantsActionExecution(companyId);
        public ApplicantDto?      GetApplicantByIdAction(int id, string companyId)            => GetApplicantByIdActionExecution(id, companyId);
        public ActionResponse     CreateApplicantAction(CreateApplicantDto d, string cid)     => CreateApplicantActionExecution(d, cid);
        public ActionResponse     UpdateApplicantAction(int id, UpdateApplicantDto d, string cid) => UpdateApplicantActionExecution(id, d, cid);
        public ActionResponse     DeleteApplicantAction(int id, string companyId)             => DeleteApplicantActionExecution(id, companyId);
    }

    public class DocumentActionExecution : DocumentActions, IDocumentAction
    {
        public List<DocumentDto> GetDocumentsByDriverAction(int driverId, string companyId) => GetDocumentsByDriverActionExecution(driverId, companyId);
        public ActionResponse    UploadDocumentAction(CreateDocumentDto d, string cid)      => UploadDocumentActionExecution(d, cid);
        public ActionResponse    DeleteDocumentAction(int id, string companyId)             => DeleteDocumentActionExecution(id, companyId);
    }
}

// ── BusinessLogic factory — same pattern as professor ────────────────────────
namespace HRDashboard.BusinessLayer
{
    public class BusinessLogic
    {
        public BusinessLogic() { }

        public Interfaces.IUserLoginAction UserLoginAction()   => new Structure.UserAuthActionExecution();
        public Interfaces.IDriverAction    DriverAction()      => new Structure.DriverActionExecution();
        public Interfaces.IApplicantAction ApplicantAction()   => new Structure.ApplicantActionExecution();
        public Interfaces.IDocumentAction  DocumentAction()    => new Structure.DocumentActionExecution();
    }
}
