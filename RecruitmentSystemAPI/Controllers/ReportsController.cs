using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecruitmentSystemAPI.Data;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/reports")]
public class ReportsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ReportsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("position-wise")]
    public async Task<IActionResult> PositionWise()
    {
        var q = await _db.CandidateJobs
            .Include(cj => cj.Job)
            .GroupBy(cj => cj.Job!.Title)
            .Select(g => new { position = g.Key ?? "(Unspecified)", candidateCount = g.Count() })
            .ToListAsync();
        return Ok(q);
    }

    [HttpGet("technology-wise")]
    public async Task<IActionResult> TechnologyWise()
    {
        var q = await _db.CandidateSkills
            .GroupBy(s => s.Name)
            .Select(g => new { skill = g.Key ?? "(Unspecified)", candidateCount = g.Count() })
            .ToListAsync();
        return Ok(q);
    }

    [HttpGet("candidates/summary")]
    public async Task<IActionResult> CandidateSummary()
    {
        var total = await _db.Candidates.CountAsync();
        var withDocs = await _db.Candidates.Where(c => c.Documents.Any()).CountAsync();
        var byDate = await _db.Candidates
            .GroupBy(c => c.CreatedAt.Date)
            .Select(g => new { date = g.Key, count = g.Count() })
            .OrderBy(x => x.date)
            .ToListAsync();
        return Ok(new { total, withDocs, byDate });
    }

    [HttpGet("interviewer-summary")]
    public async Task<IActionResult> InterviewerSummary()
    {
        // Compute number of interviews per interviewer name
        var interviews = await _db.Interviewers
            .GroupBy(i => i.Name)
            .Select(g => new { interviewer = g.Key ?? "(unknown)", interviewCount = g.Count() })
            .ToListAsync();

        // Average rating per interviewer name (from feedbacks)
        var ratings = await _db.InterviewFeedbacks
            .GroupBy(f => f.InterviewerName)
            .Select(g => new { interviewer = g.Key ?? "(unknown)", averageRating = Math.Round(g.Average(f => f.OverallRating), 2), totalFeedback = g.Count() })
            .ToListAsync();

        return Ok(new { interviews, ratings });
    }
}