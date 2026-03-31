namespace HRDashboard.API.Models
{
    public class Driver
    {
        public int    Id               { get; set; }
        public string CompanyId        { get; set; } = "";
        public string Name             { get; set; } = "";
        public string FirstName        { get; set; } = "";
        public string LastName         { get; set; } = "";
        public string Position         { get; set; } = "Company Driver"; // "Owner Operator" | "Company Driver"
        public string Equipment        { get; set; } = "Van";            // "Unsigned" | "Van" | "Reefer" | "Flat Bed"
        public string Status           { get; set; } = "Applied";        // "Applied" | "Contacted" | "Documents Sent"
        public string Date             { get; set; } = "";
        public bool   IsEmployee       { get; set; } = true;
        public string DriverStatus     { get; set; } = "Not Ready";      // "Ready" | "Not Ready"
        public string PaymentType      { get; set; } = "miles";          // "miles" | "percent"
        public string EmploymentStatus { get; set; } = "Working";        // "Working" | "Fired"
    }
}
