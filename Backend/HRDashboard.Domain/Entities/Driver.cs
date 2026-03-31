namespace HRDashboard.Domain.Entities
{
    public class Driver
    {
        public int    Id               { get; set; }
        public string CompanyId        { get; set; } = "";
        public string Name             { get; set; } = "";
        public string FirstName        { get; set; } = "";
        public string LastName         { get; set; } = "";
        public string Position         { get; set; } = "Company Driver";
        public string Equipment        { get; set; } = "Van";
        public string Status           { get; set; } = "Applied";
        public string Date             { get; set; } = "";
        public bool   IsEmployee       { get; set; } = true;
        public string DriverStatus     { get; set; } = "Not Ready";
        public string PaymentType      { get; set; } = "miles";
        public string EmploymentStatus { get; set; } = "Working";
    }
}
