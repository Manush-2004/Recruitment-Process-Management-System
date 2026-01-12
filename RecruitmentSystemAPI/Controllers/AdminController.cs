using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitmentSystemAPI.Models;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _service;
    private readonly Microsoft.AspNetCore.SignalR.IHubContext<RecruitmentSystemAPI.Hubs.NotificationHub> _hub;

    public AdminController(IAdminService service, Microsoft.AspNetCore.SignalR.IHubContext<RecruitmentSystemAPI.Hubs.NotificationHub> hub)
    {
        _service = service;
        _hub = hub;
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _service.GetUsersAsync();
        return Ok(users);
    }

    [HttpPost("users")]
    public async Task<IActionResult> CreateUser(CreateUserRequest req)
    {
        var user = await _service.CreateUserAsync(req.FullName, req.Email, req.Password, req.Role, req.Phone);
        return Ok(new { id = user.Id, fullName = user.FullName, email = user.Email, roles = user.UserRoles.Select(ur => ur.Role!.Name) });
    }

    [HttpPut("users/{id}")]
    public async Task<IActionResult> UpdateUser(int id, UpdateUserRequest req)
    {
        var user = await _service.UpdateUserAsync(id, req.FullName, req.IsActive);
        if (user == null) return NotFound();
        return Ok(new { id = user.Id, fullName = user.FullName, email = user.Email });
    }

    [HttpPost("users/{id}/roles")]
    public async Task<IActionResult> AssignRole(int id, AssignRoleRequest req)
    {
        await _service.AssignRoleAsync(id, req.Role);
        return Ok();
    }

    [HttpDelete("users/{id}/roles/{role}")]
    public async Task<IActionResult> RemoveRole(int id, string role)
    {
        await _service.RemoveRoleAsync(id, role);
        return Ok();
    }

    [HttpGet("roles")]
    public async Task<IActionResult> GetRoles()
    {
        var roles = await _service.GetRolesAsync();
        return Ok(roles);
    }

    [HttpPost("roles")]
    public async Task<IActionResult> CreateRole(CreateRoleRequest req)
    {
        var name = await _service.CreateRoleAsync(req.Role);
        return Ok(new { name });
    }

    // Development helper: clear all users (and candidate-related data). Sends notification so clients refresh.
    [HttpPost("clear-users")]
    public async Task<IActionResult> ClearUsers()
    {
        await _service.ClearAllUsersAsync();
        // notify connected clients that users (and candidates) were cleared
        try { await _hub.Clients.All.SendCoreAsync("ReceiveNotification", new object[] { "UsersCleared" }, default); } catch { /* ignore */ }
        return Ok();
    }
}

// DTOs
public class CreateUserRequest { public string FullName { get; set; } = default!; public string Email { get; set; } = default!; public string Password { get; set; } = default!; public string Role { get; set; } = "Recruiter"; public string? Phone { get; set; } }
public class UpdateUserRequest { public string? FullName { get; set; } public bool? IsActive { get; set; } }
public class AssignRoleRequest { public string Role { get; set; } = default!; }
public class CreateRoleRequest { public string Role { get; set; } = default!; }