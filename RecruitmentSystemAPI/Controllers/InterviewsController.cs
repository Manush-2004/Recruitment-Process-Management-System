using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitmentSystemAPI.Models;
using RecruitmentSystemAPI.Services;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Recruiter,HR")]
public class InterviewsController : ControllerBase
{
    private readonly IInterviewService _service;

    public InterviewsController(IInterviewService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Interview>>> GetAll()
    {
        var list = await _service.GetAllAsync();
        return Ok(list);
    }

    [HttpPost]
    public async Task<IActionResult> Schedule(InterviewRequest request)
    {
        var interview = await _service.ScheduleAsync(request);
        return Ok(interview);
    }
}
