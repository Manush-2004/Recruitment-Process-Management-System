using Microsoft.EntityFrameworkCore;
using RecruitmentSystemAPI.Data;
using RecruitmentSystemAPI.Models;
using RecruitmentSystemAPI.Repositories.Interfaces;

namespace RecruitmentSystemAPI.Repositories.Implementations;

public class FeedbackRepository : IFeedbackRepository
{
    private readonly AppDbContext _db;

    public FeedbackRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<bool> HasSubmittedAsync(int interviewId, int interviewerUserId)
    {
        return await _db.InterviewFeedbacks
            .AnyAsync(f => f.InterviewId == interviewId && f.InterviewerUserId == interviewerUserId);
    }

    public async Task AddFeedbackAsync(InterviewFeedback feedback)
    {
        _db.InterviewFeedbacks.Add(feedback);
        await _db.SaveChangesAsync();
    }

    public async Task<IEnumerable<InterviewFeedback>> GetFeedbacksByInterviewIdAsync(int interviewId)
    {
        return await _db.InterviewFeedbacks
            .Where(f => f.InterviewId == interviewId)
            .Include(f => f.Skills)
            .Include(f => f.Interview)
                .ThenInclude(i => i.Candidate)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<IEnumerable<InterviewFeedback>> GetFeedbacksByCandidateAndJobAsync(int candidateId, int jobId)
    {
        return await _db.InterviewFeedbacks
            .Include(f => f.Skills)
            .Include(f => f.Interview)
                .ThenInclude(i => i.Candidate)
            .Where(f => f.Interview != null && f.Interview.CandidateId == candidateId && f.Interview.JobId == jobId)
            .AsNoTracking()
            .ToListAsync();
    }
}
