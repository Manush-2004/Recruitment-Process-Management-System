using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitmentSystemAPI.Models;
using RecruitmentSystemAPI.Services;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InterviewsController : ControllerBase

{
    private readonly IInterviewService _service;
    private readonly IFeedbackService _feedbackService;

    public InterviewsController(IInterviewService service, IFeedbackService feedbackService)
    {
        _service = service;
        _feedbackService = feedbackService;
    }

    [Authorize(Roles = "Recruiter,HR")]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Interview>>> GetAll()
    {
        var list = await _service.GetAllAsync();
        return Ok(list);
    }

    [Authorize(Roles = "Recruiter,HR")]
    [HttpPost]
    public async Task<IActionResult> Schedule(InterviewRequest request)
    {
        var interview = await _service.ScheduleAsync(request);
        return Ok(interview);
    }

        // Interviewer-facing endpoints
        [Authorize(Roles = "Interviewer")]
        [HttpGet("assigned")]
        public async Task<IActionResult> Assigned()
        {
            var fullName = User.FindFirst("FullName")?.Value;
            var email = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
            if (string.IsNullOrWhiteSpace(email) && string.IsNullOrWhiteSpace(fullName)) return Unauthorized();

            var all = await _service.GetAllAsync();
            var assigned = all.Where(i => i.Interviewers.Any(iv => iv.Email == email || iv.Name == fullName));

            var result = new List<object>();
            foreach (var iv in assigned)
            {
                var has = await _feedbackService.HasSubmittedByEmailAsync(iv.Id, email ?? fullName ?? string.Empty);
                result.Add(new {
                    id = iv.Id,
                    candidateId = iv.CandidateId,
                    jobId = iv.JobId,
                    roundType = iv.RoundType,
                    scheduledAt = iv.ScheduledAt,
                    interviewers = iv.Interviewers,
                    candidate = iv.Candidate,
                    job = iv.Job,
                    feedbackSubmitted = has
                });
            }

            return Ok(result);
        }

        [Authorize(Roles = "Interviewer")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var all = await _service.GetAllAsync();
            var interview = all.FirstOrDefault(i => i.Id == id);
            if (interview == null) return NotFound();
            return Ok(interview);
        }

        // Get interviews for a specific candidate (HR + Recruiter)
        [Authorize(Roles = "HR,Recruiter")]
        [HttpGet("for-candidate/{candidateId:int}")]
        public async Task<IActionResult> ForCandidate(int candidateId)
        {
            var all = await _service.GetAllAsync();
            var list = all.Where(i => i.CandidateId == candidateId);
            return Ok(list);
        }
    }
