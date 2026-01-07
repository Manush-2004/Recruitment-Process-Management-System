using System.Net;
using System.Net.Mail;

public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;

    public EmailService(ILogger<EmailService> logger)
    {
        _logger = logger;
    }

    public async Task SendAsync(string to, string subject, string body)
    {
        try
        {
            var smtp = new SmtpClient("smtp.gmail.com")
            {
                Port = 587,
                Credentials = new NetworkCredential("your_email@gmail.com", "app_password"),
                EnableSsl = true
            };

            var msg = new MailMessage("your_email@gmail.com", to, subject, body);
            await smtp.SendMailAsync(msg);
        }
        catch (SmtpException ex)
        {
            _logger.LogWarning(ex, "Email send failed for {to}: {message}", to, ex.Message);
            // swallow exception in development so that non-critical email failures don't block API flows
        }
    }
}
