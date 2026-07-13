using RecruitmentSystemAPI.DTOs;
using RecruitmentSystemAPI.Models;
using RecruitmentSystemAPI.Repositories.Interfaces;
using RecruitmentSystemAPI.Services.Interfaces;

namespace RecruitmentSystemAPI.Services.Implementations;

public class FeedbackService : IFeedbackService
{
    private readonly IFeedbackRepository _feedbackRepo;
    private readonly IAuthRepository _authRepo;

    public FeedbackService(IFeedbackRepository feedbackRepo, IAuthRepository authRepo)
    {
        _feedbackRepo = feedbackRepo;
        _authRepo = authRepo;
    }

    public async Task<bool> HasSubmittedAsync(int interviewId, int interviewerUserId)
    {
        return await _feedbackRepo.HasSubmittedAsync(interviewId, interviewerUserId);
    }

    public async Task<bool> HasSubmittedByEmailAsync(int interviewId, string email)
    {
        var user = await _authRepo.GetUserByEmailWithRolesAsync(email);
        if (user == null) return false;
        return await HasSubmittedAsync(interviewId, user.Id);
    }

    public async Task SubmitFeedbackAsync(FeedbackRequest req)
    {
        if (await HasSubmittedAsync(req.InterviewId, req.InterviewerUserId))
            throw new Exception("Feedback already submitted by this interviewer.");

        var interviewer = await _authRepo.GetUserByIdAsync(req.InterviewerUserId)
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

        await _feedbackRepo.AddFeedbackAsync(feedback);
    }

    public async Task<InterviewFeedbackSummary> GetInterviewSummaryAsync(int interviewId)
    {
        var feedbacks = (await _feedbackRepo.GetFeedbacksByInterviewIdAsync(interviewId)).ToList();

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
        var feedbacks = (await _feedbackRepo.GetFeedbacksByCandidateAndJobAsync(candidateId, jobId)).ToList();

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
