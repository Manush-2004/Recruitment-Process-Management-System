using RecruitmentSystemAPI.Data;
using RecruitmentSystemAPI.DTOs;
using RecruitmentSystemAPI.Models;
using RecruitmentSystemAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace RecruitmentSystemAPI.Services.Implementations;

public class FeedbackService : IFeedbackService
{
    private readonly AppDbContext _db;

    public FeedbackService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<bool> HasSubmittedAsync(int interviewId, int interviewerUserId)
    {
        return await _db.InterviewFeedbacks
            .AnyAsync(f => f.InterviewId == interviewId &&
                           f.InterviewerUserId == interviewerUserId);
    }

    public async Task<bool> HasSubmittedByEmailAsync(int interviewId, string email)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null) return false;
        return await HasSubmittedAsync(interviewId, user.Id);
    }

    public async Task SubmitFeedbackAsync(FeedbackRequest req)
    {
        if (await HasSubmittedAsync(req.InterviewId, req.InterviewerUserId))
            throw new Exception("Feedback already submitted by this interviewer.");

        var interviewer = await _db.Users.FindAsync(req.InterviewerUserId)
            ?? throw new Exception("Interviewer not found");
        var feedback = new InterviewFeedback
        {
            InterviewId = req.InterviewId,
            InterviewerUserId = interviewer.Id,
            InterviewerName = req.InterviewerName,
            OverallRating = req.OverallRating,
            Comments = req.Comments,
            Skills = req.Skills.Select(s => new FeedbackSkill
            {
                SkillName = s.SkillName,
                Rating = s.Rating
            }).ToList()
        };

        _db.InterviewFeedbacks.Add(feedback);
        await _db.SaveChangesAsync();
    }

    public async Task<InterviewFeedbackSummary> GetInterviewSummaryAsync(int interviewId)
    {
        var feedbacks = await _db.InterviewFeedbacks
            .Where(f => f.InterviewId == interviewId)
            .Include(f => f.Skills)
            .Include(f => f.Interview)
                .ThenInclude(i => i.Candidate)
            .AsNoTracking()
            .ToListAsync();

        if (!feedbacks.Any())
            throw new Exception("No feedback available for this interview");

        var firstInterview = feedbacks.First().Interview;

        var summary = new InterviewFeedbackSummary
        {
            InterviewId = interviewId,
            CandidateId = firstInterview?.CandidateId,
            CandidateName = firstInterview?.Candidate?.FullName,
            JobId = firstInterview?.JobId,
            TotalFeedbacks = feedbacks.Count,
            AverageRating = Math.Round(feedbacks.Average(f => f.OverallRating), 2),
            Feedbacks = feedbacks.Select(f => new InterviewerFeedbackView
            {
                InterviewerName = f.InterviewerName,
                OverallRating = f.OverallRating,
                Comments = f.Comments,
                Skills = f.Skills.Select(s => new FeedbackSkillView
                {
                    SkillName = s.SkillName,
                    Rating = s.Rating
                }).ToList()
            }).ToList()
        };

        return summary;
    }

    // New: aggregate across all interviews for a candidate+job
    public async Task<InterviewFeedbackSummary> GetInterviewSummaryByCandidateJobAsync(int candidateId, int jobId)
    {
        var feedbacks = await _db.InterviewFeedbacks
            .Include(f => f.Skills)
            .Include(f => f.Interview)
                .ThenInclude(i => i.Candidate)
            .Where(f => f.Interview != null && f.Interview.CandidateId == candidateId && f.Interview.JobId == jobId)
            .AsNoTracking()
            .ToListAsync();

        if (!feedbacks.Any())
            throw new Exception("No feedback available for this candidate and job");

        var summary = new InterviewFeedbackSummary
        {
            CandidateId = candidateId,
            JobId = jobId,
            CandidateName = feedbacks.First().Interview?.Candidate?.FullName,
            TotalFeedbacks = feedbacks.Count,
            AverageRating = Math.Round(feedbacks.Average(f => f.OverallRating), 2),
            Feedbacks = feedbacks.Select(f => new InterviewerFeedbackView
            {
                InterviewerName = f.InterviewerName,
                OverallRating = f.OverallRating,
                Comments = f.Comments,
                Skills = f.Skills.Select(s => new FeedbackSkillView
                {
                    SkillName = s.SkillName,
                    Rating = s.Rating
                }).ToList()
            }).ToList()
        };

        return summary;
    }

}
