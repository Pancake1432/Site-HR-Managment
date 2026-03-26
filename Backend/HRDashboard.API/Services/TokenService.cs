using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HRDashboard.API.Models;
using Microsoft.IdentityModel.Tokens;

namespace HRDashboard.API.Services
{
    public class TokenService
    {
        private readonly IConfiguration _config;

        public TokenService(IConfiguration config)
        {
            _config = config;
        }

        public string GenerateToken(User user)
        {
            var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
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
                issuer:   _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims:   claims,
                expires:  DateTime.UtcNow.AddHours(8),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        /// <summary>
        /// Extrage companyId din token-ul JWT curent al request-ului.
        /// Folosit în fiecare controller pentru izolarea datelor per companie.
        /// </summary>
        public static string GetCompanyId(ClaimsPrincipal user)
            => user.FindFirstValue("companyId") ?? "";
    }
}
