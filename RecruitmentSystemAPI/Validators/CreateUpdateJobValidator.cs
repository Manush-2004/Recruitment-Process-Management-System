using FluentValidation;
using RecruitmentSystemAPI.Models;
using RecruitmentSystemAPI.DTOs;

namespace RecruitmentSystemAPI.Validators;

public class CreateJobRequestValidator : AbstractValidator<CreateJobRequest>
{
    public CreateJobRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(120);
        RuleForEach(x => x.RequiredSkills).ChildRules(skill =>
        {
            skill.RuleFor(s => s.Name).NotEmpty().MaximumLength(60);
            skill.RuleFor(s => s.MinYears).GreaterThanOrEqualTo(0).LessThanOrEqualTo(40);
        });
    }
}

public class UpdateJobRequestValidator : AbstractValidator<UpdateJobRequest>
{
    public UpdateJobRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(120);
        RuleForEach(x => x.RequiredSkills).ChildRules(skill =>
        {
            skill.RuleFor(s => s.Name).NotEmpty().MaximumLength(60);
            skill.RuleFor(s => s.MinYears).GreaterThanOrEqualTo(0).LessThanOrEqualTo(40);
        });
    }
}
