using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitmentSystemAPI.Models;
using RecruitmentSystemAPI.Services;

[Authorize(Roles = "Interviewer")]
[ApiController]
[Route("api/feedback")]
public class FeedbackController : ControllerBase
{
    private readonly IFeedbackService _service;

    public FeedbackController(IFeedbackService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> Submit(FeedbackRequest req)
    {
        await _service.SubmitFeedbackAsync(req);
        return Ok();
    }

        // Returns whether the current authenticated interviewer has already submitted feedback for the interview
        [HttpGet("interview/{interviewId}/has-submitted")]
        public async Task<IActionResult> HasSubmitted(int interviewId)
        {
            var email = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
            if (string.IsNullOrWhiteSpace(email)) return Unauthorized();
            var has = await _service.HasSubmittedByEmailAsync(interviewId, email);
            return Ok(new { hasSubmitted = has });
        }

        [Authorize(Roles = "HR")]   // person with both roles can access this route
        [HttpGet("interview/{interviewId}/summary")]
        public async Task<IActionResult> GetSummary(int interviewId)
        {
            var summary = await _service.GetInterviewSummaryAsync(interviewId);
            return Ok(summary);
        }
    }

