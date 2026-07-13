using RecruitmentSystemAPI.Models;

namespace RecruitmentSystemAPI.Repositories.Interfaces;

public interface IJobRepository
{
    IEnumerable<Job> GetAll();
    Job? Get(int id);
    Job? GetForUpdate(int id);
    void Add(Job job);
    void UpdateSkillsAndSave(Job job, List<RequiredSkill> newSkills);
    void Delete(Job job);
    
    Task<IEnumerable<Job>> GetAllJobsAsync();
    Task<Job?> GetJobByIdAsync(int id);
    Task<Job?> GetJobByIdWithSkillsAsync(int id);
    Task AddJobAsync(Job job);
    Task UpdateJobAsync(Job job);
    Task<IEnumerable<Job>> GetAllJobsWithSkillsAsync();
}
