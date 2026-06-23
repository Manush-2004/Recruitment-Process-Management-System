using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using RecruitmentSystemAPI.Models;
using RecruitmentSystemAPI.DTOs;
using RecruitmentSystemAPI.Services.Interfaces;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _service;

    public AuthController(IAuthService service)
    {
        _service = service;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest req)
    {
        var token = await _service.RegisterAsync(req);
        return Ok(new { token });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest req)
    {
        var token = await _service.LoginAsync(req);
        return Ok(new { token });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var email = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
        if (string.IsNullOrWhiteSpace(email)) return Unauthorized();
        var user = await _service.GetUserByEmailAsync(email);
        if (user == null) return NotFound();
        var roles = user.UserRoles.Select(ur => ur.Role!.Name).ToList();
        return Ok(new { id = user.Id, fullName = user.FullName, email = user.Email, roles });
    }
}
