using RecruitmentSystemAPI.DTOs;
using RecruitmentSystemAPI.Models;

namespace RecruitmentSystemAPI.Services.Interfaces;

public interface IJobService
{
    IEnumerable<Job> GetAll();
    Job? Get(int id);
    Job Create(CreateJobRequest dto);
    bool Update(int id, UpdateJobRequest dto);
    bool Delete(int id);
}
