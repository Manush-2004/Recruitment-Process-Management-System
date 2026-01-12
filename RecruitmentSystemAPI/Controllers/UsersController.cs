using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitmentSystemAPI.Services;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IAdminService _adminService;

    public UsersController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    // GET /api/users?role=Interviewer
    [HttpGet]
    [Authorize]
    public async Task<IActionResult> Get([FromQuery] string? role = null)
    {
        var users = await _adminService.GetUsersAsync();
        if (!string.IsNullOrWhiteSpace(role))
        {
            var filtered = users.Where(u => ((IEnumerable<string>)u.GetType().GetProperty("roles")!.GetValue(u)!).Any(r => string.Equals(r, role, StringComparison.OrdinalIgnoreCase))).ToList();
            return Ok(filtered);
        }
        return Ok(users);
    }
}