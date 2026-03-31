namespace HRDashboard.Domain.Entities
{
    public class Application
    {
        public string   Id                   { get; set; } = "";
        public string   CompanyId            { get; set; } = "";
        public DateTime SubmittedAt          { get; set; } = DateTime.UtcNow;
        public string   Status               { get; set; } = "pending";
        public string   Name                 { get; set; } = "";
        public string   Phone                { get; set; } = "";
        public string   Email                { get; set; } = "";
        public string   City                 { get; set; } = "";
        public string   State                { get; set; } = "";
        public string   Zip                  { get; set; } = "";
        public string   FamilyStatus         { get; set; } = "";
        public string   DrivingExperience    { get; set; } = "";
        public string   PreviousCompany      { get; set; } = "";
        public string   ReasonForLeaving     { get; set; } = "";
        public string   Felonies             { get; set; } = "";
        public string   DrivingRecord        { get; set; } = "";
        public string   WorkedReefer         { get; set; } = "";
        public string   Dislike              { get; set; } = "";
        public string   Hos                  { get; set; } = "";
        public string   OvernightPark        { get; set; } = "";
        public string   SpecialConsideration { get; set; } = "";
        public string   OnRoad               { get; set; } = "";
        public string   DrugTest             { get; set; } = "";
        public string   SecuringUnloading    { get; set; } = "";
        public string   SalaryExpectation    { get; set; } = "";
    }
}
