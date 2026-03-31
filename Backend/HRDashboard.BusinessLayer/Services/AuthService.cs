using HRDashboard.Domain.DTOs;
using HRDashboard.Domain.Interfaces;

namespace HRDashboard.BusinessLayer.Services
{
    public class AuthService
    {
        private readonly IUserRepository _users;
        private readonly TokenService    _tokens;

        public AuthService(IUserRepository users, TokenService tokens)
        {
            _users  = users;
            _tokens = tokens;
        }

        public async Task<LoginResponse?> LoginAsync(LoginRequest req)
        {
            var user = await _users.GetByEmailAsync(req.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
                return null;

            var token = _tokens.GenerateToken(user);
            return new LoginResponse(token, user.Email, user.Name, user.Role, user.CompanyId, user.CompanyName);
        }

        public async Task<RefreshResponse?> RefreshAsync(RefreshRequest req)
        {
            try
            {
                var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
                var jwt     = handler.ReadJwtToken(req.AccessToken);
                var email   = jwt.Claims
                    .FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Email)?.Value;

                if (email == null) return null;

                var user = await _users.GetByEmailAsync(email);
                if (user == null) return null;

                return new RefreshResponse(_tokens.GenerateToken(user));
            }
            catch { return null; }
        }
    }
}
