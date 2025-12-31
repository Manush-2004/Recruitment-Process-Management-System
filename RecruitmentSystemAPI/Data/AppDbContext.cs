using Microsoft.EntityFrameworkCore;
using RecruitmentSystemAPI.Models;

namespace RecruitmentSystemAPI.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Job> Jobs => Set<Job>();
    public DbSet<RequiredSkill> RequiredSkills => Set<RequiredSkill>();

    public DbSet<Candidate> Candidates => Set<Candidate>();
    public DbSet<CandidateDocument> CandidateDocuments => Set<CandidateDocument>();

    public DbSet<CandidateSkill> CandidateSkills => Set<CandidateSkill>();
    public DbSet<CandidateJob> CandidateJobs => Set<CandidateJob>();

    public DbSet<Screening> Screenings => Set<Screening>();
    public DbSet<ScreeningSkill> ScreeningSkills => Set<ScreeningSkill>();

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();

    public DbSet<Interview> Interviews => Set<Interview>();
    public DbSet<Interviewer> Interviewers => Set<Interviewer>();

    public DbSet<InterviewFeedback> InterviewFeedbacks => Set<InterviewFeedback>();
    public DbSet<FeedbackSkill> FeedbackSkills => Set<FeedbackSkill>();
    public DbSet<Offer> Offers => Set<Offer>();

    public DbSet<StatusHistory> StatusHistories => Set<StatusHistory>();





    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Job>(e =>
        {
            e.HasKey(j => j.Id);
            e.Property(j => j.Title).IsRequired().HasMaxLength(120);
            e.Property(j => j.Description).HasMaxLength(2000);
            e.Property(j => j.IsOpen).HasDefaultValue(true);
            e.Property(j => j.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            e.HasMany(j => j.RequiredSkills)
             .WithOne(rs => rs.Job!)
             .HasForeignKey(rs => rs.JobId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<RequiredSkill>(e =>
        {
            e.HasKey(rs => rs.Id);
            e.Property(rs => rs.Name).IsRequired().HasMaxLength(60);
            e.Property(rs => rs.MinYears).HasDefaultValue(0);
        });

        b.Entity<Candidate>(e =>
        {
            e.HasKey(c => c.Id);
            e.Property(c => c.FullName).IsRequired().HasMaxLength(200);
            e.Property(c => c.Email).IsRequired().HasMaxLength(200);
            e.HasMany(c => c.Documents)
             .WithOne(d => d.Candidate!)
             .HasForeignKey(d => d.CandidateId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<CandidateDocument>(e =>
        {
           e.HasKey(d => d.Id);
           e.Property(d => d.FileName).IsRequired().HasMaxLength(255);
           e.Property(d => d.FilePath).IsRequired().HasMaxLength(1000);
           e.Property(d => d.ContentType).IsRequired().HasMaxLength(200);
           e.Property(d => d.Size).IsRequired();
        });
        
        b.Entity<CandidateSkill>(e =>
        {
            e.HasKey(s => s.Id);
            e.Property(s => s.Name).IsRequired().HasMaxLength(100);
            e.Property(s => s.Years).HasDefaultValue(0);
            e.HasOne(s => s.Candidate).WithMany(c => c.Skills).HasForeignKey(s => s.CandidateId);
        });

        b.Entity<CandidateJob>(e =>
        {
            e.HasKey(cj => cj.Id);
            e.HasOne(cj => cj.Candidate).WithMany(c => c.CandidateJobs).HasForeignKey(cj => cj.CandidateId);
            e.HasOne(cj => cj.Job).WithMany(j => j.CandidateJobs).HasForeignKey(cj => cj.JobId);
            e.Property(cj => cj.LinkedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        b.Entity<Screening>(e =>
        {
            e.HasKey(s => s.Id);
            e.Property(s => s.Status).IsRequired();
            e.HasOne(s => s.Candidate)
            .WithMany()
            .HasForeignKey(s => s.CandidateId);

            e.HasOne(s => s.Job)
            .WithMany()
            .HasForeignKey(s => s.JobId);
        });

        b.Entity<ScreeningSkill>(e =>
        {
            e.HasKey(ss => ss.Id);
            e.Property(ss => ss.SkillName).IsRequired();
            e.HasOne(ss => ss.Screening)
            .WithMany(s => s.Skills)
            .HasForeignKey(ss => ss.ScreeningId)
            .OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<User>(e =>
        {
            e.HasKey(u => u.Id);

            e.Property(u => u.FullName)
            .IsRequired()
            .HasMaxLength(150);

            e.Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(200);

            e.HasIndex(u => u.Email)
            .IsUnique(); // no duplicate users

            e.Property(u => u.PasswordHash)
            .IsRequired();
        });

        b.Entity<Role>(e =>
        {
            e.HasKey(r => r.Id);

            e.Property(r => r.Name)
            .IsRequired()
            .HasMaxLength(50);

            e.HasIndex(r => r.Name)
            .IsUnique(); // no duplicate roles
        });

        b.Entity<UserRole>(e =>
        {
            // Composite Primary Key
            e.HasKey(ur => new { ur.UserId, ur.RoleId });

            // FK → User
            e.HasOne(ur => ur.User)
            .WithMany(u => u.UserRoles)
            .HasForeignKey(ur => ur.UserId)
            .OnDelete(DeleteBehavior.Cascade);

            // FK → Role
            e.HasOne(ur => ur.Role)
            .WithMany(r => r.UserRoles)
            .HasForeignKey(ur => ur.RoleId)
            .OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<Interview>(e =>
        {
            e.HasKey(i => i.Id);
            e.Property(i => i.RoundType).IsRequired().HasMaxLength(50);
            e.Property(i => i.Status).IsRequired().HasMaxLength(30);
            e.HasMany(i => i.Interviewers)
            .WithOne(iv => iv.Interview)
            .HasForeignKey(iv => iv.InterviewId)
            .OnDelete(DeleteBehavior.Cascade);
        });
    
        b.Entity<Interviewer>(e =>
        {
            e.HasKey(iv => iv.Id);

            e.Property(iv => iv.Name).IsRequired().HasMaxLength(150);

            e.Property(iv => iv.Email).IsRequired().HasMaxLength(200);
        });

        b.Entity<InterviewFeedback>(e =>
        {
            e.HasKey(f => f.Id);
           
            // One interview → many feedbacks
            e.HasOne(f => f.Interview)
            .WithMany()
            .HasForeignKey(f => f.InterviewId)
            .OnDelete(DeleteBehavior.Cascade);

            // One user → many feedbacks
            e.HasOne(f => f.Interviewer)
            .WithMany()
            .HasForeignKey(f => f.InterviewerUserId)
            .OnDelete(DeleteBehavior.Restrict);

            // Prevent duplicate feedback by same interviewer
            e.HasIndex(f => new { f.InterviewId, f.InterviewerUserId })
            .IsUnique(); 
        });

        b.Entity<FeedbackSkill>(e =>
        {
            e.HasKey(fs => fs.Id);
            e.HasOne(fs => fs.InterviewFeedback)
            .WithMany(f => f.Skills)
            .HasForeignKey(fs => fs.InterviewFeedbackId)
            .OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<Offer>(e =>
        {
            e.HasKey(o => o.Id);
            e.HasOne(o => o.Candidate)
            .WithMany()
            .HasForeignKey(o => o.CandidateId);
        });

        b.Entity<StatusHistory>(e =>
        {
            e.HasKey(s => s.Id);
            e.Property(s => s.OldStatus).IsRequired();
            e.Property(s => s.NewStatus).IsRequired();
            e.Property(s => s.ChangedBy).IsRequired();
        });
    }
}
