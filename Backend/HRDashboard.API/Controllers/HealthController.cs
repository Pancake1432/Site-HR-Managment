using Microsoft.AspNetCore.Mvc;

namespace HRDashboard.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        // GET /api/health — public, no auth required
        // Used by frontend HealthGuard to check if backend is online
        [HttpGet]
        public IActionResult Get() => Ok(new
        {
            status  = "healthy",
            version = "2.0.0",
            time    = DateTime.UtcNow
        });
    }
}
