using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HRDashboard.Domain.Entities;
using HRDashboard.Domain.Settings;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace HRDashboard.BusinessLayer.Services
{
    /// <summary>
    /// Serviciu JWT — foloseste IOptions&lt;JwtOptions&gt; in loc de IConfiguration direct.
    /// JwtOptions este populat automat din sectiunea "Jwt" din appsettings.json.
    /// </summary>
    public class TokenService
    {
        private readonly JwtOptions _jwt;

        public TokenService(IOptions<JwtOptions> jwtOptions)
        {
            _jwt = jwtOptions.Value;
        }

        public string GenerateToken(User user)
        {
            var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.Key));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

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
                issuer:             _jwt.Issuer,
                audience:           _jwt.Audience,
                claims:             claims,
                expires:            DateTime.UtcNow.AddHours(_jwt.ExpireHours),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        /// <summary>
        /// Extrage companyId din JWT-ul curent al request-ului.
        /// </summary>
        public static string GetCompanyId(ClaimsPrincipal user)
            => user.FindFirstValue("companyId") ?? "";
    }
}
