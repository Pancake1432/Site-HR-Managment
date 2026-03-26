namespace HRDashboard.API.Models
{
    public class SavedStatement
    {
        public string   Id               { get; set; } = "";
        public string   CompanyId        { get; set; } = "";
        public DateTime SavedAt          { get; set; }
        public int?     DriverId         { get; set; }
        public string   DriverName       { get; set; } = "";
        public string   PaymentType      { get; set; } = "";   // "miles" | "percent"
        public string   Miles            { get; set; } = "";
        public string   RatePerMile      { get; set; } = "";
        public string   Percent          { get; set; } = "";
        public string   GrossAmount      { get; set; } = "";
        public string   AdjustmentType   { get; set; } = "";   // "bonus" | "deduction"
        public string   AdjustmentAmount { get; set; } = "";
        public string   AdjustmentReason { get; set; } = "";
        public string   Subtotal         { get; set; } = "";
        public string   Adjustment       { get; set; } = "";
        public string   Total            { get; set; } = "";
    }
}
