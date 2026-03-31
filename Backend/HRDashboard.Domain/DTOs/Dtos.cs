namespace HRDashboard.Domain.DTOs
{
    // ── Auth ──────────────────────────────────────────────────────────────────
    public record LoginRequest(string Email, string Password);

    public record LoginResponse(
        string Token,
        string Email,
        string Name,
        string Role,
        string CompanyId,
        string CompanyName
    );

    public record RefreshRequest(string AccessToken);
    public record RefreshResponse(string AccessToken);

    // ── Driver ────────────────────────────────────────────────────────────────
    public record UpdateDriverDto(
        string? Name,
        string? FirstName,
        string? LastName,
        string? Position,
        string? Equipment,
        string? Status,
        string? DriverStatus,
        string? PaymentType,
        string? EmploymentStatus
    );

    // ── Applicant ─────────────────────────────────────────────────────────────
    public record UpdateStatusRequest(string? Status, string? Equipment);
    public record UpdateEquipmentRequest(string Equipment);

    // ── Document ──────────────────────────────────────────────────────────────
    public record PublicDocumentRequest(
        int    DriverId,
        string DocType,
        string Name,
        string Base64,
        string? FileType,
        string? Size
    );
}
