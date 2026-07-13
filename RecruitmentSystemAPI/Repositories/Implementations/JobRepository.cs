using Microsoft.EntityFrameworkCore;
using RecruitmentSystemAPI.Data;
using RecruitmentSystemAPI.Models;
using RecruitmentSystemAPI.Repositories.Interfaces;

namespace RecruitmentSystemAPI.Repositories.Implementations;

public class JobRepository : IJobRepository
{
    private readonly AppDbContext _db;

    public JobRepository(AppDbContext db)
    {
        _db = db;
    }

    public IEnumerable<Job> GetAll() =>
        _db.Jobs.Include(j => j.RequiredSkills).OrderByDescending(j => j.CreatedAt).AsNoTracking().ToList();

    public Job? Get(int id) =>
        _db.Jobs.Include(j => j.RequiredSkills).AsNoTracking().FirstOrDefault(j => j.Id == id);

    public Job? GetForUpdate(int id) =>
        _db.Jobs.Include(j => j.RequiredSkills).FirstOrDefault(j => j.Id == id);

    public void Add(Job job)
    {
        _db.Jobs.Add(job);
        _db.SaveChanges();
    }

    public void UpdateSkillsAndSave(Job job, List<RequiredSkill> newSkills)
    {
        _db.RequiredSkills.RemoveRange(job.RequiredSkills);
        job.RequiredSkills = newSkills;
        _db.SaveChanges();
    }

    public void Delete(Job job)
    {
        _db.Jobs.Remove(job);
        _db.SaveChanges();
    }

    public async Task<IEnumerable<Job>> GetAllJobsAsync()
    {
        return await _db.Jobs.Include(j => j.RequiredSkills).OrderByDescending(j => j.CreatedAt).AsNoTracking().ToListAsync();
    }

    public async Task<Job?> GetJobByIdAsync(int id)
    {
        return await _db.Jobs.FindAsync(id);
    }

    public async Task<Job?> GetJobByIdWithSkillsAsync(int id)
    {
        return await _db.Jobs.Include(j => j.RequiredSkills).FirstOrDefaultAsync(j => j.Id == id);
    }

    public async Task AddJobAsync(Job job)
    {
        _db.Jobs.Add(job);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateJobAsync(Job job)
    {
        await _db.SaveChangesAsync();
    }

    public async Task<IEnumerable<Job>> GetAllJobsWithSkillsAsync()
    {
        return await _db.Jobs.Include(j => j.RequiredSkills).ToListAsync();
    }
}
