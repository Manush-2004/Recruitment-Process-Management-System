using RecruitmentSystemAPI.DTOs;
using RecruitmentSystemAPI.Models;

namespace RecruitmentSystemAPI.Services.Interfaces;

public interface IInterviewService
{
    Task<Interview> ScheduleAsync(InterviewRequest request);
    Task<IEnumerable<Interview>> GetAllAsync();
    Task<Interview> UpdateInterviewResultAsync(int interviewId, string result, string actor);
}
