using HRDashboard.DataAccess.Context;
using HRDashboard.Domain.Entities;
using HRDashboard.Domain.Models;

namespace HRDashboard.BusinessLayer.Core
{
    // ── User Actions ──────────────────────────────────────────────────────────
    public class UserActions
    {
        protected UserActions() { }

        protected UserLoginResponseDto? UserLoginDataValidationExecution(UserLoginDto udata)
        {
            UserData? user;
            using (var db = new UserContext())
                user = db.Users.FirstOrDefault(x => x.Email == udata.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(udata.Password, user.PasswordHash))
                return null;

            var miamiTz   = TimeZoneInfo.FindSystemTimeZoneById("Eastern Standard Time");
            var expiresUtc = DateTime.UtcNow.AddHours(14);
            var expiresET  = TimeZoneInfo.ConvertTimeFromUtc(expiresUtc, miamiTz);

            return new UserLoginResponseDto
            {
                Token       = new Structure.TokenService().GenerateToken(user),
                ExpiresAt   = expiresET.ToString("MM/dd/yyyy hh:mm tt") + " ET",
                Email       = user.Email,
                Name        = user.Name,
                Role        = user.Role,
                CompanyId   = user.CompanyId,
                CompanyName = user.CompanyName,
            };
        }
    }

    // ── Driver Actions ────────────────────────────────────────────────────────
    public class DriverActions
    {
        protected DriverActions() { }

        protected List<DriverDto> GetAllDriversActionExecution(string companyId)
        {
            List<DriverData> drivers;
            using (var db = new DriverContext())
                drivers = db.Drivers.Where(x => x.CompanyId == companyId).ToList();
            return drivers.Select(MapDriver).ToList();
        }

        protected DriverDto? GetDriverByIdActionExecution(int id, string companyId)
        {
            DriverData? d;
            using (var db = new DriverContext())
                d = db.Drivers.FirstOrDefault(x => x.Id == id && x.CompanyId == companyId);
            return d == null ? null : MapDriver(d);
        }

        protected ActionResponse CreateDriverActionExecution(CreateDriverDto data, string companyId)
        {
            var d = new DriverData
            {
                Name             = $"{data.FirstName} {data.LastName}".Trim(),
                FirstName        = data.FirstName,
                LastName         = data.LastName,
                CompanyId        = companyId,
                Position         = data.Position,
                Equipment        = data.Equipment,
                DriverStatus     = data.DriverStatus,
                PaymentType      = data.PaymentType,
                EmploymentStatus = data.EmploymentStatus,
                Notes            = data.Notes,
                CreatedAt        = DateTime.Now,
            };
            using (var db = new DriverContext()) { db.Drivers.Add(d); db.SaveChanges(); }
            return new ActionResponse { IsSuccess = true, Message = "Driver created.", Data = MapDriver(d) };
        }

        protected ActionResponse UpdateDriverActionExecution(int id, UpdateDriverDto data, string companyId)
        {
            DriverData? d;
            using (var db = new DriverContext())
            {
                d = db.Drivers.FirstOrDefault(x => x.Id == id && x.CompanyId == companyId);
                if (d == null) return new ActionResponse { IsSuccess = false, Message = "Driver not found." };
                if (data.Name             != null) d.Name             = data.Name;
                if (data.Position         != null) d.Position         = data.Position;
                if (data.Equipment        != null) d.Equipment        = data.Equipment;
                if (data.DriverStatus     != null) d.DriverStatus     = data.DriverStatus;
                if (data.PaymentType      != null) d.PaymentType      = data.PaymentType;
                if (data.EmploymentStatus != null) d.EmploymentStatus = data.EmploymentStatus;
                // Notes can be explicitly set to empty string to clear them
                if (data.Notes != null) d.Notes = data.Notes;
                db.Drivers.Update(d); db.SaveChanges();
            }
            return new ActionResponse { IsSuccess = true, Message = "Driver updated.", Data = MapDriver(d) };
        }

        protected ActionResponse DeleteDriverActionExecution(int id, string companyId)
        {
            using (var db = new DriverContext())
            {
                var d = db.Drivers.FirstOrDefault(x => x.Id == id && x.CompanyId == companyId);
                if (d == null) return new ActionResponse { IsSuccess = false, Message = "Driver not found." };
                db.Drivers.Remove(d); db.SaveChanges();
            }
            return new ActionResponse { IsSuccess = true, Message = "Driver deleted." };
        }

        private static DriverDto MapDriver(DriverData d) => new DriverDto
        {
            Id               = d.Id,
            Name             = d.Name,
            FirstName        = d.FirstName,
            LastName         = d.LastName,
            CompanyId        = d.CompanyId,
            Position         = d.Position,
            Equipment        = d.Equipment,
            DriverStatus     = d.DriverStatus,
            PaymentType      = d.PaymentType,
            EmploymentStatus = d.EmploymentStatus,
            Notes            = d.Notes,
            CreatedAt        = d.CreatedAt,
        };
    }

    // ── Applicant Actions ─────────────────────────────────────────────────────
    public class ApplicantActions
    {
        protected ApplicantActions() { }

        protected List<ApplicantDto> GetAllApplicantsActionExecution(string companyId)
        {
            List<ApplicantData> list;
            using (var db = new ApplicantContext())
                list = db.Applicants.Where(x => x.CompanyId == companyId && !x.IsDeleted).ToList();
            return list.Select(MapApplicant).ToList();
        }

        protected ApplicantDto? GetApplicantByIdActionExecution(int id, string companyId)
        {
            ApplicantData? a;
            using (var db = new ApplicantContext())
                a = db.Applicants.FirstOrDefault(x => x.Id == id && x.CompanyId == companyId && !x.IsDeleted);
            return a == null ? null : MapApplicant(a);
        }

        protected ActionResponse CreateApplicantActionExecution(CreateApplicantDto data, string companyId)
        {
            var a = new ApplicantData
            {
                Name      = data.Name,
                FirstName = data.FirstName,
                LastName  = data.LastName,
                CompanyId = companyId,
                Position  = data.Position,
                Equipment = data.Equipment,
                Status    = data.Status,
                CreatedAt = DateTime.Now,
            };
            using (var db = new ApplicantContext()) { db.Applicants.Add(a); db.SaveChanges(); }
            return new ActionResponse { IsSuccess = true, Message = "Applicant created.", Data = MapApplicant(a) };
        }

        protected ActionResponse UpdateApplicantActionExecution(int id, UpdateApplicantDto data, string companyId)
        {
            ApplicantData? a;
            using (var db = new ApplicantContext())
            {
                a = db.Applicants.FirstOrDefault(x => x.Id == id && x.CompanyId == companyId && !x.IsDeleted);
                if (a == null) return new ActionResponse { IsSuccess = false, Message = "Applicant not found." };
                if (data.Status    != null) a.Status    = data.Status;
                if (data.Equipment != null) a.Equipment = data.Equipment;
                db.Applicants.Update(a); db.SaveChanges();
            }
            return new ActionResponse { IsSuccess = true, Message = "Applicant updated.", Data = MapApplicant(a) };
        }

        protected ActionResponse DeleteApplicantActionExecution(int id, string companyId)
        {
            using (var db = new ApplicantContext())
            {
                var a = db.Applicants.FirstOrDefault(x => x.Id == id && x.CompanyId == companyId);
                if (a == null) return new ActionResponse { IsSuccess = false, Message = "Applicant not found." };
                a.IsDeleted = true; db.Applicants.Update(a); db.SaveChanges();
            }
            return new ActionResponse { IsSuccess = true, Message = "Applicant removed." };
        }

        private static ApplicantDto MapApplicant(ApplicantData a) => new ApplicantDto
        {
            Id        = a.Id,
            Name      = a.Name,
            FirstName = a.FirstName,
            LastName  = a.LastName,
            CompanyId = a.CompanyId,
            Position  = a.Position,
            Equipment = a.Equipment,
            Status    = a.Status,
            CreatedAt = a.CreatedAt,
        };
    }

    // ── Document Actions ──────────────────────────────────────────────────────
    public class DocumentActions
    {
        protected DocumentActions() { }

        protected List<DocumentDto> GetDocumentsByDriverActionExecution(int driverId, string companyId)
        {
            List<DocumentData> docs;
            using (var db = new DocumentContext())
                docs = db.Documents.Where(x => x.DriverId == driverId && x.CompanyId == companyId).ToList();
            return docs.Select(MapDocument).ToList();
        }

        protected ActionResponse UploadDocumentActionExecution(CreateDocumentDto data, string companyId)
        {
            var doc = new DocumentData
            {
                CompanyId  = companyId,
                DriverId   = data.DriverId,
                DocType    = data.DocType,
                Name       = data.Name,
                FileType   = data.FileType,
                Size       = data.Size,
                Base64     = data.Base64,
                UploadedAt = DateTime.Now,
            };
            using (var db = new DocumentContext()) { db.Documents.Add(doc); db.SaveChanges(); }
            return new ActionResponse { IsSuccess = true, Message = "Document uploaded.", Data = MapDocument(doc) };
        }

        protected ActionResponse DeleteDocumentActionExecution(int id, string companyId)
        {
            using (var db = new DocumentContext())
            {
                var doc = db.Documents.FirstOrDefault(x => x.Id == id && x.CompanyId == companyId);
                if (doc == null) return new ActionResponse { IsSuccess = false, Message = "Document not found." };
                db.Documents.Remove(doc); db.SaveChanges();
            }
            return new ActionResponse { IsSuccess = true, Message = "Document deleted." };
        }

        private static DocumentDto MapDocument(DocumentData d) => new DocumentDto
        {
            Id         = d.Id,
            DriverId   = d.DriverId,
            DocType    = d.DocType,
            Name       = d.Name,
            FileType   = d.FileType,
            Size       = d.Size,
            Base64     = d.Base64,
            UploadedAt = d.UploadedAt,
            ExpiryDate = d.ExpiryDate,
        };
    }
}
