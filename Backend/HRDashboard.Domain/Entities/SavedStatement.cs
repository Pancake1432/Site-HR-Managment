namespace HRDashboard.Domain.Entities
{
    public class SavedStatement
    {
        public string   Id               { get; set; } = Guid.NewGuid().ToString();
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
}
