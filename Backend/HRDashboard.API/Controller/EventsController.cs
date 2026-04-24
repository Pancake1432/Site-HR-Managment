using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Concurrent;

namespace HRDashboard.API.Controller
{
    /// <summary>
    /// Server-Sent Events endpoint. Clients connect and keep the connection open.
    /// When any mutation happens (driver added, applicant hired, etc.) the backend
    /// calls EventsController.BroadcastAsync("refresh") and all connected clients
    /// silently re-fetch their data.
    /// </summary>
    [Route("api/events")]
    [ApiController]
    [Authorize]
    public class EventsController : ControllerBase
    {
        // Thread-safe set of all currently connected client response streams
        private static readonly ConcurrentDictionary<string, HttpResponse> _clients = new();
        private static readonly SemaphoreSlim _lock = new(1, 1);

        /// <summary>
        /// Broadcast a message to all connected clients. Called by other controllers
        /// after any data mutation. Fire-and-forget: _ = BroadcastAsync("refresh");
        /// </summary>
        public static async Task BroadcastAsync(string message)
        {
            await _lock.WaitAsync();
            try
            {
                var dead = new List<string>();
                foreach (var (key, response) in _clients)
                {
                    try
                    {
                        await response.WriteAsync($"data: {message}\n\n");
                        await response.Body.FlushAsync();
                    }
                    catch
                    {
                        // Client disconnected — mark for removal
                        dead.Add(key);
                    }
                }
                foreach (var key in dead) _clients.TryRemove(key, out _);
            }
            finally
            {
                _lock.Release();
            }
        }

        /// <summary>
        /// SSE stream endpoint. Each authenticated user connects here on login
        /// and keeps the connection open to receive real-time push notifications.
        /// </summary>
        [HttpGet]
        public async Task Stream(CancellationToken ct)
        {
            Response.Headers["Content-Type"]                = "text/event-stream";
            Response.Headers["Cache-Control"]               = "no-cache";
            Response.Headers["Connection"]                  = "keep-alive";
            Response.Headers["X-Accel-Buffering"]           = "no"; // Nginx: disable buffering

            var clientId = Guid.NewGuid().ToString();
            _clients.TryAdd(clientId, Response);

            try
            {
                // Send an initial ping so the client knows the connection is live
                await Response.WriteAsync("data: connected\n\n");
                await Response.Body.FlushAsync();

                // Keep-alive loop — send a comment every 25s so load balancers
                // and proxies don't close the idle connection
                while (!ct.IsCancellationRequested)
                {
                    await Task.Delay(25_000, ct);
                    await Response.WriteAsync(": keepalive\n\n");
                    await Response.Body.FlushAsync();
                }
            }
            catch (OperationCanceledException)
            {
                // Normal disconnection — do nothing
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[SSE] Client {clientId} disconnected: {ex.Message}");
            }
            finally
            {
                _clients.TryRemove(clientId, out _);
            }
        }

        /// <summary>Returns how many clients are currently connected (for debugging).</summary>
        [HttpGet("count")]
        public IActionResult Count() => Ok(new { connected = _clients.Count });
    }
}
