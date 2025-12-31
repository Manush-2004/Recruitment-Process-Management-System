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

    [Authorize(Roles = "HR")]   // person with both roles can access this route
    [HttpGet("interview/{interviewId}/summary")]
    public async Task<IActionResult> GetSummary(int interviewId)
    {
        var summary = await _service.GetInterviewSummaryAsync(interviewId);
        return Ok(summary);
    }
}



