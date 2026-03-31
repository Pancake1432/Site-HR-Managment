namespace HRDashboard.Domain.Settings
{
    /// <summary>
    /// Configurare JWT — mapată din secțiunea "Jwt" din appsettings.json
    /// Injectată prin IOptions&lt;JwtOptions&gt; în loc de IConfiguration direct
    /// </summary>
    public class JwtOptions
    {
        public const string SectionName = "Jwt";

        public string Key      { get; set; } = "";
        public string Issuer   { get; set; } = "";
        public string Audience { get; set; } = "";
        public int    ExpireHours { get; set; } = 8;
    }
}
