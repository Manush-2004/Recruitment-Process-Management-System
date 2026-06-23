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

using Microsoft.EntityFrameworkCore;
using RecruitmentSystemAPI.Data;
using RecruitmentSystemAPI.DTOs;
using RecruitmentSystemAPI.Models;
using RecruitmentSystemAPI.Services.Interfaces;

namespace RecruitmentSystemAPI.Services.Implementations;

public class JobService : IJobService
{
    private readonly AppDbContext _db;
    public JobService(AppDbContext db) => _db = db;

    public IEnumerable<Job> GetAll() =>
        _db.Jobs.Include(j => j.RequiredSkills).OrderByDescending(j => j.CreatedAt).AsNoTracking().ToList();

    public Job? Get(int id) =>
        _db.Jobs.Include(j => j.RequiredSkills).AsNoTracking().FirstOrDefault(j => j.Id == id);

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
        _db.Jobs.Add(job);
        _db.SaveChanges();
        return job;
    }

    public bool Update(int id, UpdateJobRequest dto)
    {
        var job = _db.Jobs.Include(j => j.RequiredSkills).FirstOrDefault(j => j.Id == id);
        if (job is null) return false;

        job.Title = dto.Title;
        job.Description = dto.Description;
        job.IsOpen = dto.IsOpen;

        // Replace skill list (simple approach)
        _db.RequiredSkills.RemoveRange(job.RequiredSkills);
        job.RequiredSkills = (dto.RequiredSkills ?? new()).Select(s => new RequiredSkill
        {
            Name = s.Name, MinYears = s.MinYears, JobId = id
        }).ToList();

        _db.SaveChanges();
        return true;
    }

    public bool Delete(int id)
    {
        var job = _db.Jobs.Find(id);
        if (job is null) return false;
        _db.Jobs.Remove(job);
        _db.SaveChanges();
        return true;
    }
}
