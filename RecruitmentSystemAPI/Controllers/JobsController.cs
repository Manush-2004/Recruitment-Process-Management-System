using Microsoft.AspNetCore.Mvc;
using RecruitmentSystemAPI.Models;
using RecruitmentSystemAPI.Services;

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
        return job is null ? NotFound() : Ok(job);
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
        return ok ? NoContent() : NotFound();
    }

    [HttpDelete("{id:int}")]
    public IActionResult Delete(int id)
    {
        var ok = service.Delete(id);
        return ok ? NoContent() : NotFound();
    }
}

