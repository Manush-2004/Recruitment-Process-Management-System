using RecruitmentSystemAPI.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

public interface IInterviewService
{
    Task<Interview> ScheduleAsync(InterviewRequest request);
    Task<IEnumerable<Interview>> GetAllAsync();
}
