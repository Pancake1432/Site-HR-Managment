using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HRDashboard.Domain.Entities;
using Microsoft.IdentityModel.Tokens;

namespace HRDashboard.BusinessLayer.Structure
{
    public class TokenService
    {
        // Set once at startup by Program.cs — never hardcoded here
        public static string SecretKey { get; set; } = "";

        private const string Issuer   = "HRDashboard";
        private const string Audience = "HRDashboardClient";

        public TokenService() { }

        public string GenerateToken(UserData user)
        {
            if (string.IsNullOrEmpty(SecretKey))
                throw new InvalidOperationException("TokenService.SecretKey has not been set. Call TokenService.SecretKey = ... in Program.cs.");

            var secKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SecretKey));
            var creds  = new SigningCredentials(secKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email,          user.Email),
                new Claim(ClaimTypes.Name,           user.Name),
                new Claim(ClaimTypes.Role,           user.Role),
                new Claim("companyId",               user.CompanyId),
                new Claim("companyName",             user.CompanyName),
            };

            var token = new JwtSecurityToken(
                issuer:             Issuer,
                audience:           Audience,
                claims:             claims,
                expires:            DateTime.UtcNow.AddHours(14),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public static string GetCompanyId(ClaimsPrincipal user)
            => user.FindFirstValue("companyId") ?? "";
    }
}
