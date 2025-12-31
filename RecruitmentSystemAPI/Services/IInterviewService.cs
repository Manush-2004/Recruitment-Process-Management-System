using RecruitmentSystemAPI.Models;

public interface IInterviewService
{
    Task<Interview> ScheduleAsync(InterviewRequest request);
}
