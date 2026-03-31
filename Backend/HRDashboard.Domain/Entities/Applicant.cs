namespace HRDashboard.Domain.Entities
{
    public class Applicant
    {
        public int    Id        { get; set; }
        public string CompanyId { get; set; } = "";
        public string Name      { get; set; } = "";
        public string FirstName { get; set; } = "";
        public string LastName  { get; set; } = "";
        public string Position  { get; set; } = "Company Driver";
        public string Equipment { get; set; } = "Unsigned";
        public string Status    { get; set; } = "Applied";
        public string Date      { get; set; } = "";
        public bool   IsDeleted { get; set; } = false;
    }
}
