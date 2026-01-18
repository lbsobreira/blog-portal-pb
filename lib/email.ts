import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendMagicLinkEmailProps {
  to: string;
  magicLink: string;
}

export async function sendMagicLinkEmail({ to, magicLink }: SendMagicLinkEmailProps) {
  const emailFrom = process.env.EMAIL_FROM || 'noreply@example.com';

  // Fetch site name for email branding
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "default" },
    select: { siteName: true },
  });
  const siteName = settings?.siteName || "IT Blog";

  try {
    await resend.emails.send({
      from: emailFrom,
      to,
      subject: `Sign in to ${siteName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Sign in to ${siteName}</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f7f7f7; border-radius: 8px; padding: 30px; margin: 20px 0;">
              <h1 style="color: #2563eb; margin-top: 0;">Sign in to ${siteName}</h1>
              <p style="font-size: 16px; margin: 20px 0;">Click the button below to sign in to your account. This link will expire in 24 hours.</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${magicLink}"
                   style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
                  Sign In
                </a>
              </div>

              <p style="font-size: 14px; color: #666; margin: 20px 0;">
                If you didn't request this email, you can safely ignore it.
              </p>

              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

              <p style="font-size: 12px; color: #999; margin: 0;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${magicLink}" style="color: #2563eb; word-break: break-all;">${magicLink}</a>
              </p>
            </div>
          </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send magic link email:', error);
    throw new Error('Failed to send verification email');
  }
}
