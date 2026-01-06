using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using System.Threading;
using System.Threading.Tasks;

public class StartupProbeHostedService : IHostedService
{
    private readonly IServiceProvider _provider;

    public StartupProbeHostedService(IServiceProvider provider)
    {
        _provider = provider;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        System.Console.WriteLine("StartupProbeHostedService: probing DI and DB connectivity...");
        try
        {
            using (var scope = _provider.CreateScope())
            {
                var db = scope.ServiceProvider.GetService<RecruitmentSystemAPI.Data.AppDbContext>();
                if (db == null)
                {
                    System.Console.WriteLine("StartupProbeHostedService: AppDbContext not resolved");
                }
                else
                {
                    var canConnect = await db.Database.CanConnectAsync(cancellationToken);
                    System.Console.WriteLine($"StartupProbeHostedService: Database.CanConnect returned: {canConnect}");
                }

                // Resolve AuthService to ensure its construction works
                var auth = scope.ServiceProvider.GetService<IAuthService>();
                System.Console.WriteLine($"StartupProbeHostedService: AuthService resolved: {auth != null}");
            }
        }
        catch (System.Exception ex)
        {
            System.Console.WriteLine($"StartupProbeHostedService: Exception during probe: {ex}");
            // If probe fails, request host to stop so we can see logs
            var lifetime = _provider.GetService<IHostApplicationLifetime>();
            lifetime?.StopApplication();
        }
    
        await Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        System.Console.WriteLine("StartupProbeHostedService: stopping");
        return Task.CompletedTask;
    }
}
