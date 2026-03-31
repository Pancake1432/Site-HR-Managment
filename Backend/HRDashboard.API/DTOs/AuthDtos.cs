namespace HRDashboard.API.DTOs
{
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
}
