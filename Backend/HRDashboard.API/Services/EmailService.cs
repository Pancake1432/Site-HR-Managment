using System.Net;
using System.Net.Mail;

namespace HRDashboard.API.Services
{
    /// <summary>
    /// Thin wrapper around SmtpClient. Reads all config from IConfiguration.
    /// Other services and controllers inject this instead of building SmtpClient themselves.
    /// </summary>
    public class EmailService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration config, ILogger<EmailService> logger)
        {
            _config = config;
            _logger = logger;
        }

        public bool IsEnabled =>
            _config.GetValue<bool>("Email:Enabled") &&
            !string.IsNullOrWhiteSpace(_config["Email:SmtpHost"]) &&
            !string.IsNullOrWhiteSpace(_config["Email:AdminAddress"]);

        public string AdminAddress  => _config["Email:AdminAddress"]  ?? "";
        public string CompanyName   => _config["Email:CompanyName"]   ?? "Paks Logistic LLC";
        public string FromAddress   => _config["Email:FromAddress"]   ?? _config["Email:SmtpUser"] ?? "";

        /// <summary>
        /// Sends an email. Logs and swallows exceptions so a mail failure never
        /// crashes the request that triggered it.
        /// </summary>
        public async Task SendAsync(string to, string subject, string body)
        {
            if (!IsEnabled)
            {
                _logger.LogInformation("[Email] Notifications disabled — skipping '{subject}'.", subject);
                return;
            }

            var smtpHost     = _config["Email:SmtpHost"]!;
            var smtpPort     = _config.GetValue<int>("Email:SmtpPort");
            var smtpUser     = _config["Email:SmtpUser"]!;
            var smtpPassword = _config["Email:SmtpPassword"]!;

            try
            {
                using var client = new SmtpClient(smtpHost, smtpPort)
                {
                    EnableSsl   = true,
                    Credentials = new NetworkCredential(smtpUser, smtpPassword),
                };
                var message = new MailMessage(FromAddress, to, subject, body);
                await client.SendMailAsync(message);
                _logger.LogInformation("[Email] Sent '{subject}' → {to}.", subject, to);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[Email] Failed to send '{subject}' → {to}.", subject, to);
            }
        }

        /// <summary>Convenience: send to the configured admin address.</summary>
        public Task SendToAdminAsync(string subject, string body)
            => SendAsync(AdminAddress, subject, body);
    }
}
