// using RecruitmentSystemAPI.Models;

// namespace RecruitmentSystemAPI.Services;

// public class JobService : IJobService
// {
//     private readonly List<Job> _jobs = new();

//     private int _nextId = 1;

//     public IEnumerable<Job> GetAll() => _jobs.OrderByDescending(j => j.CreatedAt);

//     public Job? Get(int id) => _jobs.FirstOrDefault(j => j.Id == id);

//     public Job Create(CreateJobRequest dto)
//     {
//         var job = new Job
//         {
//             Id = _nextId++,
//             Title = dto.Title,
//             Description = dto.Description,
//             RequiredSkills = dto.RequiredSkills ?? new()
//         };
//         _jobs.Add(job);
//         return job;
//     }

//     public bool Update(int id, UpdateJobRequest dto)
//     {
//         var job = Get(id);
//         if (job is null) return false;

//         job.Title = dto.Title;
//         job.Description = dto.Description;
//         job.RequiredSkills = dto.RequiredSkills ?? new();
//         job.IsOpen = dto.IsOpen;
//         return true;
//     }

//     public bool Delete(int id)
//     {
//         var job = Get(id);
//         if (job is null) return false;
//         _jobs.Remove(job);
//         return true;
//     }
// }

using RecruitmentSystemAPI.DTOs;
using RecruitmentSystemAPI.Models;
using RecruitmentSystemAPI.Repositories.Interfaces;
using RecruitmentSystemAPI.Services.Interfaces;

namespace RecruitmentSystemAPI.Services.Implementations;

public class JobService : IJobService
{
    private readonly IJobRepository _jobRepo;

    public JobService(IJobRepository jobRepo) => _jobRepo = jobRepo;

    public IEnumerable<Job> GetAll() => _jobRepo.GetAll();

    public Job? Get(int id) => _jobRepo.Get(id);

    public Job Create(CreateJobRequest dto)
    {
        var job = new Job
        {
            Title = dto.Title,
            Description = dto.Description,
            RequiredSkills = (dto.RequiredSkills ?? new()).Select(s => new RequiredSkill
            {
                Name = s.Name, MinYears = s.MinYears
            }).ToList()
        };
        _jobRepo.Add(job);
        return job;
    }

    public bool Update(int id, UpdateJobRequest dto)
    {
        var job = _jobRepo.GetForUpdate(id);
        if (job is null) return false;

        job.Title = dto.Title;
        job.Description = dto.Description;
        job.IsOpen = dto.IsOpen;

        var newSkills = (dto.RequiredSkills ?? new()).Select(s => new RequiredSkill
        {
            Name = s.Name, MinYears = s.MinYears, JobId = id
        }).ToList();

        _jobRepo.UpdateSkillsAndSave(job, newSkills);
        return true;
    }

    public bool Delete(int id)
    {
        var job = _jobRepo.GetForUpdate(id);
        if (job is null) return false;
        _jobRepo.Delete(job);
        return true;
    }
}
