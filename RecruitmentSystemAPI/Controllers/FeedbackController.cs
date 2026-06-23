using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecruitmentSystemAPI.Models;
using RecruitmentSystemAPI.DTOs;
using RecruitmentSystemAPI.Services.Interfaces;

[Authorize]
[ApiController]
[Route("api/feedback")]
public class FeedbackController : ControllerBase
{
    private readonly IFeedbackService _service;
    private readonly RecruitmentSystemAPI.Data.AppDbContext _db;

    public FeedbackController(IFeedbackService service, RecruitmentSystemAPI.Data.AppDbContext db)
    {
        _service = service;
        _db = db;
    }

    [Authorize(Roles = "Interviewer")]
    [HttpPost]
    public async Task<IActionResult> Submit(FeedbackRequest req)
    {
        try
        {
            // Derive interviewer identity from authenticated user to avoid client side spoofing
            var email = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
            if (string.IsNullOrWhiteSpace(email)) return Unauthorized();
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Unauthorized();

            req.InterviewerUserId = user.Id;
            req.InterviewerName = user.FullName ?? user.Email;

            await _service.SubmitFeedbackAsync(req);
            return Ok();
        }
        catch (Exception ex)
        {
            // Return 400 with the error message where appropriate
            return BadRequest(new { message = ex.Message });
        }
    }

    // Returns whether the current authenticated interviewer has already submitted feedback for the interview
    [Authorize(Roles = "Interviewer")]
    [HttpGet("interview/{interviewId}/has-submitted")]
    public async Task<IActionResult> HasSubmitted(int interviewId)
    {
        var email = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
        if (string.IsNullOrWhiteSpace(email)) return Unauthorized();
        var has = await _service.HasSubmittedByEmailAsync(interviewId, email);
        return Ok(new { hasSubmitted = has });
    }   

    [Authorize(Roles = "HR,Recruiter")]
    [HttpGet("interview/{interviewId}/summary")]
    public async Task<IActionResult> GetSummary(int interviewId)
    {
        var summary = await _service.GetInterviewSummaryAsync(interviewId);
        return Ok(summary);
    }

    // New: allow recruiter/hr to fetch aggregated feedback by candidate+job
    [Authorize(Roles = "HR,Recruiter")]
    [HttpGet("summary")]
    public async Task<IActionResult> GetSummaryByCandidateJob([FromQuery] int candidateId, [FromQuery] int jobId)
    {
        if (candidateId <= 0 || jobId <= 0) return BadRequest("candidateId and jobId are required");
        var summary = await _service.GetInterviewSummaryByCandidateJobAsync(candidateId, jobId);
        return Ok(summary);
    }
}

