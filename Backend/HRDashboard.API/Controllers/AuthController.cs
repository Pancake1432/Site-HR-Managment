using HRDashboard.API.Data;
using HRDashboard.API.DTOs;
using HRDashboard.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HRDashboard.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext  _db;
        private readonly TokenService  _tokens;

        public AuthController(AppDbContext db, TokenService tokens)
        {
            _db     = db;
            _tokens = tokens;
        }

        // POST /api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req)
        {
            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.Email == req.Email.ToLower());

            if (user == null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
                return Unauthorized(new { message = "Invalid email or password." });

            var token = _tokens.GenerateToken(user);

            return Ok(new LoginResponse(
                Token:       token,
                Email:       user.Email,
                Name:        user.Name,
                Role:        user.Role,
                CompanyId:   user.CompanyId,
                CompanyName: user.CompanyName
            ));
        }

        // POST /api/auth/refresh
        // react-axios-provider-kit apelează acest endpoint automat când token-ul expiră
        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] RefreshRequest req)
        {
            // Simplu pentru moment: validăm că token-ul e al unui user valid
            // și emitem unul nou. Într-un proiect real ai stoca refresh tokens.
            try
            {
                var handler  = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
                var jwt      = handler.ReadJwtToken(req.AccessToken);
                var email    = jwt.Claims.FirstOrDefault(c => c.Type == "email")?.Value
                            ?? jwt.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Email)?.Value;

                if (email == null) return Unauthorized();

                var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
                if (user == null) return Unauthorized();

                var newToken = _tokens.GenerateToken(user);
                return Ok(new RefreshResponse(newToken));
            }
            catch
            {
                return Unauthorized();
            }
        }
    }
}
