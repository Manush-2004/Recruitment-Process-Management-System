using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitmentSystemAPI.Models;
using RecruitmentSystemAPI.Services;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
[Authorize]

public class ScreeningsController : ControllerBase
{
    private readonly IScreeningService _service;

    public ScreeningsController(IScreeningService service)
    {
        _service = service;
    }

    [HttpGet("assigned")]
    [Authorize(Roles = "Reviewer")]
    public async Task<IActionResult> Assigned()
    {
        var fullName = User.FindFirst("FullName")?.Value;
        var reviewer = fullName ?? User.FindFirst(ClaimTypes.Name)?.Value;
        if (string.IsNullOrWhiteSpace(reviewer)) return Unauthorized();
        var list = await _service.GetAssignedForReviewerAsync(reviewer);
        return Ok(list);
    }

    [HttpGet("history")]
    [Authorize(Roles = "Reviewer")]
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
    [Authorize(Roles = "Reviewer")]
    public async Task<IActionResult> Screen(ScreeningRequest request)
    {
        // This endpoint is for Reviewers submitting screening results; ensure reviewer name comes from authenticated user
        var fullName = User.FindFirst("FullName")?.Value;
        var emailName = User.FindFirst(ClaimTypes.Name)?.Value;
        request.ReviewerName = fullName ?? emailName ?? request.ReviewerName;

        var result = await _service.ScreenCandidateAsync(request);
        return Ok(result);
    }

    // Recruiter-facing assign endpoint: assign a candidate to a reviewer (status defaults to Pending)
    [HttpPost("assign")]
    [Authorize(Roles = "Recruiter,Admin")]
    public async Task<IActionResult> Assign(ScreeningRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.ReviewerName)) return BadRequest("ReviewerName is required");
        request.Status = request.Status ?? "Pending";
        var result = await _service.ScreenCandidateAsync(request);
        return Ok(result);
    }

    [HttpPatch("{id:int}")]
    [Authorize(Roles = "Reviewer,Recruiter,Admin")]
    public async Task<IActionResult> Update(int id, UpdateScreeningRequest request)
    {
        var fullName = User.FindFirst("FullName")?.Value;
        var emailName = User.FindFirst(ClaimTypes.Name)?.Value;
        var caller = fullName ?? emailName;
        var asReviewer = User.IsInRole("Reviewer");

        var result = await _service.UpdateScreeningAsync(id, request, caller, asReviewer);
        return Ok(result);
    }
}
