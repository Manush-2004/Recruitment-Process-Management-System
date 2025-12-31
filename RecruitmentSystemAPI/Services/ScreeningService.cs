using RecruitmentSystemAPI.Data;
using RecruitmentSystemAPI.Models;
using Microsoft.EntityFrameworkCore;

public class ScreeningService : IScreeningService
{
    private readonly AppDbContext _db;
    private readonly StatusService _statusService;

    public ScreeningService(AppDbContext db, StatusService statusService)
    {
        _db = db;
        _statusService = statusService;
    }

    public async Task<bool> AlreadyScreenedAsync(int candidateId, int jobId)
    {
        return await _db.Screenings
            .AnyAsync(s => s.CandidateId == candidateId && s.JobId == jobId);
    }

    public async Task<Screening> ScreenCandidateAsync(ScreeningRequest request)
    {
        if (await AlreadyScreenedAsync(request.CandidateId, request.JobId))
            throw new Exception("Candidate already screened for this job.");

        var screening = new Screening
        {
            CandidateId = request.CandidateId,
            JobId = request.JobId,
            ReviewerName = request.ReviewerName,
            Status = request.Status,
            Comments = request.Comments,
            Skills = request.Skills.Select(s => new ScreeningSkill
            {
                SkillName = s.SkillName,
                YearsOfExperience = s.YearsOfExperience,
                IsApproved = s.IsApproved
            }).ToList()
        };

        _db.Screenings.Add(screening);
        await _db.SaveChangesAsync();

        await _statusService.ChangeCandidateStatusAsync(
            request.CandidateId,
            "Applied",
            request.Status,
            request.ReviewerName
        );


        return screening;
    }
}
