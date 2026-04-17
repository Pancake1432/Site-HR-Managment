using HRDashboard.DataAccess.Context;

namespace HRDashboard.API.Services
{
    /// <summary>
    /// Runs once per day. Checks all CDL and Medical Card documents for expiry
    /// and sends a summary email to the admin if any expire within 30 days.
    /// </summary>
    public class ExpiryNotificationService : BackgroundService
    {
        private readonly EmailService _email;
        private readonly ILogger<ExpiryNotificationService> _logger;

        private static readonly TimeSpan CheckInterval = TimeSpan.FromHours(24);

        public ExpiryNotificationService(EmailService email, ILogger<ExpiryNotificationService> logger)
        {
            _email  = email;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("[ExpiryNotifier] Started. Checking every {h}h.", CheckInterval.TotalHours);

            // First check 1 minute after startup, then every 24h
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                try   { await CheckAndNotifyAsync(); }
                catch (Exception ex) { _logger.LogError(ex, "[ExpiryNotifier] Error during check."); }

                await Task.Delay(CheckInterval, stoppingToken);
            }
        }

        private async Task CheckAndNotifyAsync()
        {
            if (!_email.IsEnabled) return;

            var today    = DateTime.UtcNow.Date;
            var warnDate = today.AddDays(30);

            var alerts = new List<(string DriverName, string DocType, DateTime Expiry, int DaysLeft)>();

            using var docDb = new DocumentContext();
            using var drvDb = new DriverContext();

            var docs = docDb.Documents
                .Where(d => (d.DocType == "cdl" || d.DocType == "medicalCard")
                         && d.ExpiryDate != null
                         && d.ExpiryDate <= warnDate)
                .ToList();

            foreach (var doc in docs)
            {
                var driver = drvDb.Drivers.FirstOrDefault(d => d.Id == doc.DriverId);
                if (driver == null) continue;

                var daysLeft = (int)(doc.ExpiryDate!.Value.Date - today).TotalDays;
                var label    = doc.DocType == "cdl" ? "CDL Certificate" : "Medical Card";
                alerts.Add((driver.Name, label, doc.ExpiryDate.Value.Date, daysLeft));
            }

            if (alerts.Count == 0) return;

            var expiredCount = alerts.Count(a => a.DaysLeft < 0);
            var subject      = expiredCount > 0
                ? $"⛔ {expiredCount} Expired Document(s) — {_email.CompanyName}"
                : $"⚠ {alerts.Count} Document(s) Expiring Soon — {_email.CompanyName}";

            var rows = string.Join("\n", alerts
                .OrderBy(a => a.DaysLeft)
                .Select(a =>
                {
                    var status = a.DaysLeft < 0
                        ? $"EXPIRED {Math.Abs(a.DaysLeft)} days ago"
                        : $"Expires in {a.DaysLeft} days ({a.Expiry:MM/dd/yyyy})";
                    return $"  • {a.DriverName} — {a.DocType}: {status}";
                }));

            await _email.SendToAdminAsync(subject, $@"Hello,

The following driver documents require your attention:

{rows}

Please update these documents to ensure compliance.

— {_email.CompanyName} HR System
  Generated: {DateTime.UtcNow:MM/dd/yyyy HH:mm} UTC");
        }
    }
}
