import { Resend } from 'resend';
import { render } from '@react-email/components';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client as s3Client } from './getR2';

// Import React Email templates
import { OTPEmail } from '@/emails/templates/otp-email';
import { GeneralEmail } from '@/emails/templates/general-email';
import { DiscountEmail } from '@/emails/templates/discount-email';
import { AssetReleaseEmail } from '@/emails/templates/asset-release-email';
import { EmailFooter } from '@/emails/components/email-footer';

interface ResendError extends Error {
  statusCode?: number;
  response?: {
    body?: unknown;
  };
}

function isResendError(error: unknown): error is ResendError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'name' in error &&
    typeof (error as Error).message === 'string' &&
    typeof (error as Error).name === 'string'
  );
}

if (!process.env.RESEND_KEY) {
  console.error('RESEND_KEY is not defined in environment variables');
}

const resend = new Resend(process.env.RESEND_KEY);

// Email configuration
const EMAIL_DOMAIN = process.env.EMAIL_DOMAIN || 'fajarfe.me';
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'MoonUI';
const FROM_EMAIL = process.env.EMAIL_FROM_ADDRESS || `noreply@${EMAIL_DOMAIN}`;
const SENDER = `${FROM_NAME} <${FROM_EMAIL}>`;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://moonui.design';
const BG_COLOR = '#f6f6f6';

// --- HELPER FUNCTIONS FOR BACKWARD COMPATIBILITY ---

export async function generateOTPEmailHtml(
  title: string,
  otp: string,
  buttonText: string,
  buttonUrl: string = '#',
) {
  return await render(OTPEmail({ title, otp, buttonText, buttonUrl }));
}

export async function generateFooterHtml() {
  return await render(EmailFooter());
}

export async function generateGeneralEmailHtml(content: string) {
  return await render(GeneralEmail({ content }));
}

export async function generateDiscountEmailHtml(data: {
  title: string;
  discountAmount: string;
  description: string;
  code: string;
  ctaLink: string;
}) {
  return await render(DiscountEmail(data));
}

export async function generateAssetReleaseEmailHtml(data: {
  assetName: string;
  assetId: string;
  assetType: string;
  imageUrl: string;
  description: string;
  badgeText?: string;
  relatedAssets?: Array<{
    id: string;
    title: string;
    imageUrl: string;
    tier?: string;
    type?: string;
    author?: string;
  }>;
}) {
  return await render(AssetReleaseEmail(data));
}

// --- EMAIL SENDING FUNCTIONS ---

export async function sendVerificationEmail(email: string, otp: string) {
  try {
    const html = await generateOTPEmailHtml('MoonUI Verification', otp, 'Verify Email');

    const data = await resend.emails.send({
      from: SENDER,
      to: email,
      subject: 'Verify your email address - MoonUI',
      html: html,
    });
    console.log('Verification email sent successfully:', data);
    return data;
  } catch (error) {
    if (isResendError(error)) {
      console.error('Error sending verification email:', error);
    } else {
      console.error('An unexpected error occurred:', error);
    }
    throw error;
  }
}

export async function sendPasswordResetEmail(email: string, otp: string, resetUrl?: string) {
  try {
    const fullResetUrl = resetUrl ? `${APP_URL}${resetUrl}` : '#';
    const html = await generateOTPEmailHtml(
      'MoonUI Password Reset',
      otp,
      'Reset Password',
      fullResetUrl,
    );

    const data = await resend.emails.send({
      from: SENDER,
      to: email,
      subject: 'Reset your password - MoonUI',
      html: html,
    });
    console.log('Password reset email sent successfully:', data);
    return data;
  } catch (error) {
    if (isResendError(error)) {
      console.error('Error sending password reset email:', error);
    } else {
      console.error('An unexpected error occurred:', error);
    }
    throw error;
  }
}

export async function sendContactForm(formData: {
  name: string;
  email: string;
  topic: string;
  priority: string;
  message: string;
  attachments?: File[];
}) {
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'background-color: #E5E7EB; color: #374151;';
      case 'medium':
        return 'background-color: #DBEAFE; color: #1E40AF;';
      case 'high':
        return 'background-color: #FEF3C7; color: #92400E;';
      case 'urgent':
        return 'background-color: #FEE2E2; color: #B91C1C;';
      default:
        return 'background-color: #DBEAFE; color: #1E40AF;';
    }
  };

  const attachmentLinks = [];
  if (formData.attachments && formData.attachments.length > 0) {
    for (const file of formData.attachments) {
      const fileDataArrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', fileDataArrayBuffer);
      const hashHex = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      const fileExtension = file.name.split('.').pop();
      const key = `${hashHex}.${fileExtension}`;
      const s3UploadBuffer = Buffer.from(fileDataArrayBuffer);

      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.BUCKET_NAME!,
          Key: key,
          Body: s3UploadBuffer,
          ContentType: file.type,
        }),
      );

      const fileUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;
      attachmentLinks.push({ name: file.name, size: file.size, url: fileUrl });
    }
  }

  try {
    const data = await resend.emails.send({
      from: SENDER,
      replyTo: formData.email,
      to: 'fajarfernandi.id@gmail.com',
      subject: `Contact Form: ${formData.topic} - ${formData.priority} Priority`,
      html: `<!DOCTYPE html>
      <html>
      <body style="font-family: sans-serif; padding: 20px;">
        <h2>Contact Form Submission</h2>
        <p><strong>Name:</strong> ${formData.name}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Topic:</strong> ${formData.topic}</p>
        <p><strong>Priority:</strong> <span style="${getPriorityStyle(formData.priority)} padding: 2px 6px; rounded: 4px;">${formData.priority}</span></p>
        <p><strong>Message:</strong><br/>${formData.message}</p>
        ${attachmentLinks.length > 0 ? `<h3>Attachments:</h3><ul>${attachmentLinks.map((l) => `<li><a href="${l.url}">${l.name}</a></li>`).join('')}</ul>` : ''}
      </body>
      </html>`,
    });
    console.log('Contact form email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error sending contact form email:', error);
    throw error;
  }
}

export async function sendNewsletterWelcomeEmail(email: string) {
  try {
    const footerHtml = await generateFooterHtml();
    const data = await resend.emails.send({
      from: SENDER,
      to: email,
      subject: 'Welcome to MoonUI Newsletter!',
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: ${BG_COLOR}; padding: 20px;">
        <div style="background-color: white; border-radius: 8px; padding: 20px;">
          <h2 style="color: #111827; text-align: center;">Welcome Aboard!</h2>
          <p style="text-align: center;">Thank you for subscribing to MoonUI Newsletter.</p>
          ${footerHtml}
        </div>
      </div>
    `,
    });
    console.log('Welcome email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
}

export async function sendBroadcastEmail(
  subject: string,
  htmlContent: string,
  recipients: string[],
) {
  if (recipients.length === 0) return;
  try {
    const data = await resend.emails.send({
      from: SENDER,
      to: SENDER,
      bcc: recipients,
      subject: subject,
      html: htmlContent,
    });
    console.log('Broadcast email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error sending broadcast email:', error);
    throw error;
  }
}

export async function sendExpirationNoticeEmail(email: string, daysLeft: number) {
  try {
    const footerHtml = await generateFooterHtml();
    const data = await resend.emails.send({
      from: SENDER,
      to: email,
      subject: `Your license expires in ${daysLeft} days`,
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: ${BG_COLOR}; padding: 20px;">
        <div style="background-color: white; border-radius: 8px; padding: 20px;">
          <h2 style="color: #111827; text-align: center;">License Expiration Notice</h2>
          <p style="text-align: center;">Your MoonUI license will expire in <strong>${daysLeft} days</strong>.</p>
          <div style="text-align: center; margin-top: 20px;">
             <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings" style="background-color: #111827; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Renew License</a>
          </div>
          ${footerHtml}
        </div>
      </div>
    `,
    });
    return data;
  } catch (error) {
    return null;
  }
}

export async function sendInviteEmail(email: string, otp: string, inviteUrl: string, role: string) {
  try {
    const html = await generateOTPEmailHtml(
      `Invited as ${role}`,
      otp,
      'Accept Invitation',
      inviteUrl,
    );
    const data = await resend.emails.send({
      from: SENDER,
      to: email,
      subject: 'You have been invited to join MoonUI',
      html: html,
    });
    console.log('Invite email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error sending invite email:', error);
    throw error;
  }
}
