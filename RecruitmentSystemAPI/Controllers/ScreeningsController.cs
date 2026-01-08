using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitmentSystemAPI.Models;
using RecruitmentSystemAPI.Services;
using System.Security.Claims;

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

    [HttpGet("assigned")]
    public async Task<IActionResult> Assigned()
    {
        var fullName = User.FindFirst("FullName")?.Value;
        var reviewer = fullName ?? User.FindFirst(ClaimTypes.Name)?.Value;
        if (string.IsNullOrWhiteSpace(reviewer)) return Unauthorized();
        var list = await _service.GetAssignedForReviewerAsync(reviewer);
        return Ok(list);
    }

    [HttpGet("history")]
    public async Task<IActionResult> History()
    {
        var fullName = User.FindFirst("FullName")?.Value;
        var reviewer = fullName ?? User.FindFirst(ClaimTypes.Name)?.Value;
        if (string.IsNullOrWhiteSpace(reviewer)) return Unauthorized();
        var list = await _service.GetHistoryForReviewerAsync(reviewer);
        return Ok(list);
    }

    [HttpGet("for-candidate/{candidateId:int}")]
    public async Task<IActionResult> ForCandidate(int candidateId)
    {
        var list = await _service.GetForCandidateAsync(candidateId);
        return Ok(list);
    }

    [HttpGet("check")]
    public async Task<IActionResult> Check([FromQuery] int candidateId, [FromQuery] int jobId)
    {
        var already = await _service.AlreadyScreenedAsync(candidateId, jobId);
        return Ok(new { already });
    }

    [HttpPost]
    public async Task<IActionResult> Screen(ScreeningRequest request)
    {
        // Ensure reviewer name comes from authenticated user (trust server-side identity)
        var fullName = User.FindFirst("FullName")?.Value;
        var emailName = User.FindFirst(ClaimTypes.Name)?.Value;
        request.ReviewerName = fullName ?? emailName ?? request.ReviewerName;

        var result = await _service.ScreenCandidateAsync(request);
        return Ok(result);
    }
}
