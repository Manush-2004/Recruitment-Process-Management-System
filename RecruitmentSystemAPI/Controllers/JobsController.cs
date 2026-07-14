using Microsoft.AspNetCore.Mvc;
using RecruitmentSystemAPI.Exceptions;
using RecruitmentSystemAPI.Models;
using RecruitmentSystemAPI.DTOs;
using RecruitmentSystemAPI.Services.Interfaces;

namespace RecruitmentSystemAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JobsController(IJobService service) : ControllerBase
{
    [HttpGet]
    public ActionResult<IEnumerable<Job>> GetAll() => Ok(service.GetAll());

    [HttpGet("{id:int}")]
    public ActionResult<Job> Get(int id)
    {
        var job = service.Get(id);
        if (job is null) throw new NotFoundException("Job not found");
        return Ok(job);
    }

    [HttpPost]
    public ActionResult<Job> Create([FromBody] CreateJobRequest dto)
    {
        var job = service.Create(dto);
        return CreatedAtAction(nameof(Get), new { id = job.Id }, job);
    }

    [HttpPut("{id:int}")]
    public IActionResult Update(int id, [FromBody] UpdateJobRequest dto)
    {
        var ok = service.Update(id, dto);
        if (!ok) throw new NotFoundException("Job not found");
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public IActionResult Delete(int id)
    {
        var ok = service.Delete(id);
        if (!ok) throw new NotFoundException("Job not found");
        return NoContent();
    }
}

