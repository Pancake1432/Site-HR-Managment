using Microsoft.AspNetCore.Mvc;

namespace HRDashboard.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get() => Ok(new
        {
            status  = "healthy",
            version = "1.0.0",
            time    = DateTime.UtcNow
        });
    }
}
