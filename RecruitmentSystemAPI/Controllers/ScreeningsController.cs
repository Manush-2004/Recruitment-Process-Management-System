using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitmentSystemAPI.Models;
using RecruitmentSystemAPI.Services;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Reviewer")]
public class ScreeningsController : ControllerBase
{
    private readonly IScreeningService _service;

    public ScreeningsController(IScreeningService service)
    {
        _service = service;
    }

    
    [HttpPost]
    public async Task<IActionResult> Screen(ScreeningRequest request)
    {
        var result = await _service.ScreenCandidateAsync(request);
        return Ok(result);
    }
}
