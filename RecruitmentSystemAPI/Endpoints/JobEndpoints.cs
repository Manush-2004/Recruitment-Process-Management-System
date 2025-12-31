// using Microsoft.AspNetCore.Builder;
// using Microsoft.AspNetCore.Http;
using RecruitmentSystemAPI.Models;
using RecruitmentSystemAPI.Services;

// var builder = WebApplication.CreateBuilder(args);
// builder.Services.AddSingleton<IJobService, JobService>(); // Register your service
// var app = builder.Build();

public static class JobEndpoints
{
    public static WebApplication JobEndpointsList(this WebApplication app)
    {
        app.MapGet("/api/jobs", (IJobService service) =>
        {
            return Results.Ok(service.GetAll());
        }            
        );

        app.MapGet("/api/jobs/{id:int}", (int id, IJobService service) =>
        {
            var job = service.Get(id);
            return job is null ? Results.NotFound() : Results.Ok(job);
        });

        app.MapPost("/api/jobs", (CreateJobRequest dto, IJobService service) =>
        {
            var job = service.Create(dto);
            return Results.Created($"/api/jobs/{job.Id}", job);
        });

        app.MapPut("/api/jobs/{id:int}", (int id, UpdateJobRequest dto, IJobService service) =>
        {
            var ok = service.Update(id, dto);
            return ok ? Results.NoContent() : Results.NotFound();
        });

        app.MapDelete("/api/jobs/{id:int}", (int id, IJobService service) =>
        {
            var ok = service.Delete(id);
            return ok ? Results.NoContent() : Results.NotFound();
        });

        return app;
        }    
}
