using Microsoft.EntityFrameworkCore;
using RecruitmentSystemAPI.Data;
using RecruitmentSystemAPI.Models;
using RecruitmentSystemAPI.Services.Interfaces;
using RecruitmentSystemAPI.Services.Implementations;
using RecruitmentSystemAPI.Repositories.Interfaces;
using RecruitmentSystemAPI.Repositories.Implementations;
using OfficeOpenXml;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using RecruitmentSystemAPI.Hubs;
using RecruitmentSystemAPI.Exceptions;

ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

var builder = WebApplication.CreateBuilder(args);

// Ensure console logging and capture debug logs to diagnose startup failures
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.SetMinimumLevel(Microsoft.Extensions.Logging.LogLevel.Debug);

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

builder.Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        // Prevent System.Text.Json from throwing on object reference cycles (EF navigation properties)
        opts.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddScoped<IJobRepository, JobRepository>();
builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<ICandidateRepository, CandidateRepository>();
builder.Services.AddScoped<IAdminRepository, AdminRepository>();
builder.Services.AddScoped<IInterviewRepository, InterviewRepository>();
builder.Services.AddScoped<IFeedbackRepository, FeedbackRepository>();
builder.Services.AddScoped<IOfferRepository, OfferRepository>();
builder.Services.AddScoped<IScreeningRepository, ScreeningRepository>();
builder.Services.AddScoped<IStatusRepository, StatusRepository>();

builder.Services.AddScoped<IJobService, JobService>();
builder.Services.AddScoped<ICandidateService, CandidateService>();
builder.Services.AddScoped<IScreeningService, ScreeningService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)
            )
        };

        // Allow SignalR to pass the access_token as a query parameter for websocket connections
        opt.Events = new Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"].FirstOrDefault();
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs/notifications"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddScoped<IInterviewService, InterviewService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IFeedbackService, FeedbackService>();
builder.Services.AddScoped<OfferService>();

// Admin services (user & role management, reporting)
builder.Services.AddScoped<AdminService>();
builder.Services.AddScoped<IAdminService, AdminService>();

builder.Services.AddSignalR();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<StatusService>();

// Diagnostic hosted service to help debug lifecycle events
builder.Services.AddHostedService<DiagnosticHostedService>();
// Startup probe: check DI resolution and DB connectivity at startup
builder.Services.AddHostedService<StartupProbeHostedService>();




const string DevCors = "DevCors";
builder.Services.AddCors(opt =>
{
    opt.AddPolicy(DevCors, policy =>
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

var app = builder.Build();

// Add global exception handlers and application lifecycle logs to capture unexpected shutdown causes
AppDomain.CurrentDomain.UnhandledException += (s, e) => Console.WriteLine($"UnhandledException: {e.ExceptionObject}");
TaskScheduler.UnobservedTaskException += (s, e) => Console.WriteLine($"UnobservedTaskException: {e.Exception}");
app.Lifetime.ApplicationStopping.Register(() => {
    Console.WriteLine("Application is stopping (ApplicationStopping event fired). StackTrace:\n" + Environment.StackTrace);
    try
    {
        Console.WriteLine($"Process Id: {System.Diagnostics.Process.GetCurrentProcess().Id}");
    }
    catch {}
});
app.Lifetime.ApplicationStopped.Register(() => Console.WriteLine("Application has stopped (ApplicationStopped event fired)."));

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "RecruitmentSystemAPI v1");
});

app.UseExceptionHandler();
app.UseHttpsRedirection();
app.UseCors(DevCors);
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<NotificationHub>("/hubs/notifications");

try
{
    app.Run();
}
catch (Exception ex)
{
    Console.WriteLine($"Host run exception: {ex}");
    throw;
}
