using Microsoft.Extensions.Hosting;
using System.Threading;
using System.Threading.Tasks;

public class DiagnosticHostedService : IHostedService
{
    private readonly IHostApplicationLifetime _lifetime;

    public DiagnosticHostedService(IHostApplicationLifetime lifetime)
    {
        _lifetime = lifetime;
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        System.Console.WriteLine("DiagnosticHostedService: StartAsync called");
        _lifetime.ApplicationStopping.Register(() => System.Console.WriteLine("DiagnosticHostedService: ApplicationStopping"));
        _lifetime.ApplicationStopped.Register(() => System.Console.WriteLine("DiagnosticHostedService: ApplicationStopped"));
        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        System.Console.WriteLine("DiagnosticHostedService: StopAsync called");
        return Task.CompletedTask;
    }
}
