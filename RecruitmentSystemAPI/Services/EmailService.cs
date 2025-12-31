using System.Net;
using System.Net.Mail;

public class EmailService : IEmailService
{
    public async Task SendAsync(string to, string subject, string body)
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
}
