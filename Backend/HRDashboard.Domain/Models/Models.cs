namespace HRDashboard.Domain.Models
{
    // ── User ──────────────────────────────────────────────────────────────────
    public class UserLoginDto
    {
        public string Email    { get; set; } = "";
        public string Password { get; set; } = "";
    }

    public class UserLoginResponseDto
    {
        public string Token       { get; set; } = "";
        public string Email       { get; set; } = "";
        public string Name        { get; set; } = "";
        public string Role        { get; set; } = "";
        public string CompanyId   { get; set; } = "";
        public string CompanyName { get; set; } = "";
    }

    // ── Driver ────────────────────────────────────────────────────────────────
    public class DriverDto
    {
        public int     Id               { get; set; }
        public string  Name             { get; set; } = "";
        public string  FirstName        { get; set; } = "";
        public string  LastName         { get; set; } = "";
        public string  CompanyId        { get; set; } = "";
        public string  Position         { get; set; } = "";
        public string  Equipment        { get; set; } = "";
        public string  DriverStatus     { get; set; } = "";
        public string  PaymentType      { get; set; } = "";
        public string  EmploymentStatus { get; set; } = "";
        public string? Notes            { get; set; }
        public DateTime CreatedAt       { get; set; }
    }

    public class CreateDriverDto
    {
        public string  Name             { get; set; } = "";
        public string  FirstName        { get; set; } = "";
        public string  LastName         { get; set; } = "";
        public string  Position         { get; set; } = "Company Driver";
        public string  Equipment        { get; set; } = "Van";
        public string  DriverStatus     { get; set; } = "Not Ready";
        public string  PaymentType      { get; set; } = "miles";
        public string  EmploymentStatus { get; set; } = "Working";
        public string? Notes            { get; set; }
    }

    public class UpdateDriverDto
    {
        public string? Name             { get; set; }
        public string? Position         { get; set; }
        public string? Equipment        { get; set; }
        public string? DriverStatus     { get; set; }
        public string? PaymentType      { get; set; }
        public string? EmploymentStatus { get; set; }
        public string? Notes            { get; set; }
    }

    // ── Applicant ─────────────────────────────────────────────────────────────
    public class ApplicantDto
    {
        public int    Id        { get; set; }
        public string Name      { get; set; } = "";
        public string FirstName { get; set; } = "";
        public string LastName  { get; set; } = "";
        public string CompanyId { get; set; } = "";
        public string Position  { get; set; } = "";
        public string Equipment { get; set; } = "";
        public string Status    { get; set; } = "";
        public DateTime CreatedAt { get; set; }
    }

    public class CreateApplicantDto
    {
        public string Name      { get; set; } = "";
        public string FirstName { get; set; } = "";
        public string LastName  { get; set; } = "";
        public string Position  { get; set; } = "Company Driver";
        public string Equipment { get; set; } = "Unsigned";
        public string Status    { get; set; } = "Applied";
    }

    public class UpdateApplicantDto
    {
        public string? Status    { get; set; }
        public string? Equipment { get; set; }
    }

    // ── Document ──────────────────────────────────────────────────────────────
    public class DocumentDto
    {
        public int    Id         { get; set; }
        public int    DriverId   { get; set; }
        public string DocType    { get; set; } = "";
        public string Name       { get; set; } = "";
        public string FileType   { get; set; } = "";
        public string Size       { get; set; } = "";
        public string Base64     { get; set; } = "";
        public DateTime UploadedAt { get; set; }
        public DateTime? ExpiryDate { get; set; }
    }

    public class CreateDocumentDto
    {
        public int    DriverId { get; set; }
        public string DocType  { get; set; } = "";
        public string Name     { get; set; } = "";
        public string FileType { get; set; } = "PDF";
        public string Size     { get; set; } = "";
        public string Base64     { get; set; } = "";
        public DateTime? ExpiryDate { get; set; }
    }

    // ── Saved Statement ───────────────────────────────────────────────────────
    public class SavedStatementDto
    {
        public string   Id               { get; set; } = "";
        public string   CompanyId        { get; set; } = "";
        public int      DriverId         { get; set; }
        public string   DriverName       { get; set; } = "";
        public string   PaymentType      { get; set; } = "miles";
        public string   Miles            { get; set; } = "0";
        public string   RatePerMile      { get; set; } = "0";
        public string   Percent          { get; set; } = "0";
        public string   GrossAmount      { get; set; } = "0";
        public string   AdjustmentType   { get; set; } = "none";
        public string   AdjustmentAmount { get; set; } = "0";
        public string   AdjustmentReason { get; set; } = "";
        public string   Adjustment       { get; set; } = "0";
        public string   Subtotal         { get; set; } = "0";
        public string   Total            { get; set; } = "0";
        public DateTime SavedAt          { get; set; } = DateTime.UtcNow;
    }

    // ── Application Submit ────────────────────────────────────────────────────
    public class ApplicationSubmitDto
    {
        public string? Name                 { get; set; }
        public string? CompanyId            { get; set; }
        public string? Phone                { get; set; }
        public string? Email                { get; set; }
        public string? City                 { get; set; }
        public string? State                { get; set; }
        public string? Zip                  { get; set; }
        public string? FamilyStatus         { get; set; }
        public string? DrivingExperience    { get; set; }
        public string? PreviousCompany      { get; set; }
        public string? ReasonForLeaving     { get; set; }
        public string? Felonies             { get; set; }
        public string? DrivingRecord        { get; set; }
        public string? WorkedReefer         { get; set; }
        public string? Dislike              { get; set; }
        public string? Hos                  { get; set; }
        public string? OvernightPark        { get; set; }
        public string? SpecialConsideration { get; set; }
        public string? OnRoad               { get; set; }
        public string? DrugTest             { get; set; }
        public string? SecuringUnloading    { get; set; }
        public string? SalaryExpectation    { get; set; }
    }

    // ── Shared Response ───────────────────────────────────────────────────────
    public class ActionResponse
    {
        public bool    IsSuccess { get; set; }
        public string? Message   { get; set; }
        public object? Data      { get; set; }
    }
}
