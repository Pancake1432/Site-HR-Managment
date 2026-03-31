namespace HRDashboard.Domain.Entities
{
    public class Document
    {
        public int    Id         { get; set; }
        public string CompanyId  { get; set; } = "";
        public int    DriverId   { get; set; }
        public string DocType    { get; set; } = "";
        public string Name       { get; set; } = "";
        public string FileType   { get; set; } = "PDF";
        public string UploadDate { get; set; } = "";
        public string Size       { get; set; } = "";
        public string Base64     { get; set; } = "";
    }
}
