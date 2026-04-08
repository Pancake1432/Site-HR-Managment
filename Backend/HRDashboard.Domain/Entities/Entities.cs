using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

// ── All entities in ONE namespace — avoids folder/class name conflicts ─────────

namespace HRDashboard.Domain.Entities
{
    public class UserData
    {
        [Key][DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required][StringLength(100)][DataType(DataType.EmailAddress)]
        public string Email { get; set; } = "";

        [Required]
        public string PasswordHash { get; set; } = "";

        [StringLength(100)]
        public string Name { get; set; } = "";

        [StringLength(20)]
        public string Role { get; set; } = "admin";

        [Required][StringLength(50)]
        public string CompanyId { get; set; } = "";

        [StringLength(100)]
        public string CompanyName { get; set; } = "";
    }

    public class DriverData
    {
        [Key][DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required][StringLength(100)]
        public string Name { get; set; } = "";

        [StringLength(50)]
        public string FirstName { get; set; } = "";

        [StringLength(50)]
        public string LastName { get; set; } = "";

        [Required][StringLength(50)]
        public string CompanyId { get; set; } = "";

        [StringLength(30)]
        public string Position { get; set; } = "Company Driver";

        [StringLength(20)]
        public string Equipment { get; set; } = "Van";

        [StringLength(20)]
        public string DriverStatus { get; set; } = "Not Ready";

        [StringLength(20)]
        public string PaymentType { get; set; } = "miles";

        [StringLength(20)]
        public string EmploymentStatus { get; set; } = "Working";

        public bool IsEmployee { get; set; } = true;

        [DataType(DataType.Date)]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Free-text notes visible only to dispatchers / admins in the Employees tab
        public string? Notes { get; set; }
    }

    public class ApplicantData
    {
        [Key][DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required][StringLength(100)]
        public string Name { get; set; } = "";

        [StringLength(50)]
        public string FirstName { get; set; } = "";

        [StringLength(50)]
        public string LastName { get; set; } = "";

        [Required][StringLength(50)]
        public string CompanyId { get; set; } = "";

        [StringLength(30)]
        public string Position { get; set; } = "Company Driver";

        [StringLength(20)]
        public string Equipment { get; set; } = "Unsigned";

        [StringLength(30)]
        public string Status { get; set; } = "Applied";

        public bool IsDeleted { get; set; } = false;

        [DataType(DataType.Date)]
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }

    public class DocumentData
    {
        [Key][DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required][StringLength(50)]
        public string CompanyId { get; set; } = "";

        public int DriverId { get; set; }

        [Required][StringLength(30)]
        public string DocType { get; set; } = "";

        [Required][StringLength(200)]
        public string Name { get; set; } = "";

        [StringLength(10)]
        public string FileType { get; set; } = "PDF";

        [StringLength(20)]
        public string Size { get; set; } = "";

        public string Base64 { get; set; } = "";

        [DataType(DataType.Date)]
        public DateTime UploadedAt { get; set; } = DateTime.Now;
    }
}

// ── SavedStatement ────────────────────────────────────────────────────────────
namespace HRDashboard.Domain.Entities
{
    public partial class SavedStatementData
    {
        [System.ComponentModel.DataAnnotations.Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string CompanyId { get; set; } = "";
        public int    DriverId  { get; set; }
        public string DriverName { get; set; } = "";
        public string PaymentType { get; set; } = "miles";
        public string Miles { get; set; } = "0";
        public string RatePerMile { get; set; } = "0";
        public string Percent { get; set; } = "0";
        public string GrossAmount { get; set; } = "0";
        public string AdjustmentType { get; set; } = "none";
        public string AdjustmentAmount { get; set; } = "0";
        public string AdjustmentReason { get; set; } = "";
        public string Adjustment { get; set; } = "0";
        public string Subtotal { get; set; } = "0";
        public string Total { get; set; } = "0";
        public DateTime SavedAt { get; set; } = DateTime.UtcNow;
    }
}
