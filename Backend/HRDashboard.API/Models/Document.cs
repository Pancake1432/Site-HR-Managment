namespace HRDashboard.API.Models
{
    public class Document
    {
        public int    Id         { get; set; }
        public string CompanyId  { get; set; } = "";
        public int    DriverId   { get; set; }   // matches Applicant.Id or Driver.Id
        public string DocType    { get; set; } = ""; // "cdl" | "medicalCard" | "applicationPdf" | "workingContract"
        public string Name       { get; set; } = "";
        public string FileType   { get; set; } = "PDF";
        public string UploadDate { get; set; } = "";
        public string Size       { get; set; } = "";
        public string Base64     { get; set; } = ""; // full base64 data URL
    }
}
