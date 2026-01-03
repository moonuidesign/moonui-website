import { Resend } from 'resend';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client as s3Client } from './getR2';

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
const LOGO_URL = `${APP_URL}/logo.png`; // Ensure this image exists and is accessible
// const PRIMARY_COLOR = '#111827'; // Dark color like in the image (Unused variable)
// const ACCENT_COLOR = '#4F46E5';
const BG_COLOR = '#f6f6f6';

// --- SHARED COMPONENTS ---

const FOOTER_LINKS = [
  {
    title: 'Products',
    items: [
      { label: 'MoonUI Templates', href: `${APP_URL}/assets?type=templates` },
      { label: 'MoonUI Components', href: `${APP_URL}/assets?type=components` },
      { label: 'MoonUI Assets', href: `${APP_URL}/assets?type=components` },
      { label: 'MoonUI Gradients', href: `${APP_URL}/assets?type=gradients` },
    ],
  },
  {
    title: 'Premium',
    items: [
      { label: 'Upgrade Pro', href: `${APP_URL}/pricing` },
      { label: 'Upgrade Pro Plus', href: `${APP_URL}/pricing` },
      { label: 'Contact Support', href: `${APP_URL}/contact` },
    ],
  },
  {
    title: 'MoonUI Design',
    items: [
      { label: 'Explore Now', href: `${APP_URL}/assets` },
      { label: 'Become an Affiliate', href: `${APP_URL}/about` },
      { label: 'About Us', href: `${APP_URL}/about` },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Active License', href: `${APP_URL}/verify-license` },
      { label: 'Sign In', href: `${APP_URL}/signin` },
      { label: 'Reset Password', href: `${APP_URL}/forgot-password` },
    ],
  },
  {
    title: 'Company',
    items: [
      { label: 'Privacy Policy', href: `${APP_URL}/privacy-policy` },
      { label: 'Terms of Use', href: `${APP_URL}/terms-of-use` },
      { label: 'Contact Us', href: `${APP_URL}/contact` },
    ],
  },
];

const generateFooterHtml = () => `
  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin-bottom: 30px;">
      We are MoonUI Studio and we bring free and premium design resources of the highest quality to the professional community.
    </p>

    <!-- Footer Links Grid -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 30px;">
      <tr>
        ${FOOTER_LINKS.slice(0, 3)
          .map(
            (col) => `
          <td style="vertical-align: top; padding-bottom: 20px; width: 33%;">
            <h4 style="color: #111827; font-size: 14px; font-weight: bold; margin: 0 0 10px 0;">${col.title}</h4>
            <ul style="list-style: none; padding: 0; margin: 0;">
              ${col.items
                .map(
                  (link) => `
                <li style="margin-bottom: 8px;">
                  <a href="${link.href}" style="color: #111827; text-decoration: none; font-size: 13px; font-weight: 500;">
                    ${link.label}
                  </a>
                </li>
              `,
                )
                .join('')}
            </ul>
          </td>
        `,
          )
          .join('')}
      </tr>
      <tr>
        ${FOOTER_LINKS.slice(3)
          .map(
            (col) => `
          <td style="vertical-align: top; padding-bottom: 20px; width: 33%;">
            <h4 style="color: #111827; font-size: 14px; font-weight: bold; margin: 0 0 10px 0;">${col.title}</h4>
            <ul style="list-style: none; padding: 0; margin: 0;">
              ${col.items
                .map(
                  (link) => `
                <li style="margin-bottom: 8px;">
                  <a href="${link.href}" style="color: #111827; text-decoration: none; font-size: 13px; font-weight: 500;">
                    ${link.label}
                  </a>
                </li>
              `,
                )
                .join('')}
            </ul>
          </td>
        `,
          )
          .join('')}
      </tr>
    </table>

    <div style="border-top: 1px solid #e5e7eb; padding-top: 30px;">
      <p style="color: #374151; font-size: 13px; margin: 0 0 15px 0;">
        Copyright © ${new Date().getFullYear()} MoonUI Design, All rights reserved.
      </p>
      
      <!-- Social Icons -->
      <div>
        <a href="https://x.com/moonuidesign" style="text-decoration: none; margin-right: 15px;">
           <img src="${APP_URL}/social/x.png" alt="X" style="width: 20px; height: 20px; opacity: 0.8;">
        </a>
        <a href="https://instagram.com/moonuidesign" style="text-decoration: none; margin-right: 15px;">
           <img src="${APP_URL}/social/instagram.png" alt="Instagram" style="width: 20px; height: 20px; opacity: 0.8;">
        </a>
        <a href="https://linkedin.com/company/moonuidesign" style="text-decoration: none;">
           <img src="${APP_URL}/social/linkedin.png" alt="LinkedIn" style="width: 20px; height: 20px; opacity: 0.8;">
        </a>
      </div>
    </div>
  </div>
`;

const generateOTPEmailHtml = (
  title: string,
  otp: string,
  buttonText: string,
  buttonUrl: string = '#',
) => `
<div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px;">
  
  <!-- Top Header -->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 40px;">
    <tr>
      <td style="text-align: left;">
        <img src="${LOGO_URL}" alt="MoonUI Logo" style="width: 120px; height: auto;">
      </td>
      <td style="text-align: right; vertical-align: middle;">
        <span style="color: #111827; font-size: 14px; font-weight: 600;">MoonUI Studio</span>
        <div style="color: #6b7280; font-size: 12px;">Login with magic link</div>
      </td>
    </tr>
  </table>

  <!-- Main Card -->
  <div style="background-color: #f9fafb; border-radius: 12px; padding: 40px; text-align: left; border: 1px solid #e5e7eb;">
    
    <!-- Icon -->
    <div style="margin-bottom: 20px;">
       <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 12px; border: 1px solid #e5e7eb; background: white;">
         <span style="font-size: 24px;">***</span>
       </div>
    </div>

    <!-- Title -->
    <h1 style="color: #111827; font-size: 20px; font-weight: bold; margin: 0 0 10px 0;">${title}</h1>
    
    <p style="color: #374151; font-size: 14px; margin: 0 0 25px 0;">
      Click the button below to ${buttonText.toLowerCase()}.
    </p>

    <!-- Button -->
    <div style="margin-bottom: 30px;">
      <a href="${buttonUrl}" style="display: block; width: 100%; background-color: #1f2937; color: white; text-decoration: none; padding: 14px 20px; border-radius: 6px; font-weight: 600; font-size: 14px; text-align: center; box-sizing: border-box;">
        Click to ${buttonText.toLowerCase()}
      </a>
    </div>

    <p style="color: #374151; font-size: 14px; margin: 0 0 15px 0;">
      Or copy and paste the following code:
    </p>

    <!-- OTP Code -->
    <div style="background-color: white; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; text-align: center; margin-bottom: 30px;">
      <span style="font-family: monospace; font-size: 24px; font-weight: 600; color: #111827; letter-spacing: 8px;">
        ${otp}
      </span>
    </div>

    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
      If you didn't try to ${buttonText.toLowerCase()}, ignore this email.
    </p>

  </div>

  ${generateFooterHtml()}

</div>
`;

// --- EMAIL SENDING FUNCTIONS ---

export async function sendVerificationEmail(email: string, otp: string) {
  try {
    const html = generateOTPEmailHtml('MoonUI Verification', otp, 'Verify Email');

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
    const html = generateOTPEmailHtml('MoonUI Password Reset', otp, 'Reset Password', fullResetUrl);

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
    const data = await resend.emails.send({
      from: SENDER,
      to: email,
      subject: 'Welcome to MoonUI Newsletter!',
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: ${BG_COLOR}; padding: 20px;">
        <div style="background-color: white; border-radius: 8px; padding: 20px;">
          <h2 style="color: #111827; text-align: center;">Welcome Aboard!</h2>
          <p style="text-align: center;">Thank you for subscribing to MoonUI Newsletter.</p>
          ${generateFooterHtml()}
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

export const generateGeneralEmailHtml = (content: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: ${BG_COLOR}; padding: 20px;">
    <div style="background-color: white; border-radius: 8px; padding: 20px;">
      <div style="color: #333; line-height: 1.6;">${content}</div>
      ${generateFooterHtml()}
    </div>
  </div>
`;

export const generateDiscountEmailHtml = (data: any) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: ${BG_COLOR}; padding: 20px;">
    <div style="background-color: white; border-radius: 12px; padding: 20px;">
      <h1 style="color: #111827; text-align: center;">${data.title}</h1>
      <p style="text-align: center; font-size: 24px; font-weight: bold;">${data.discountAmount}</p>
      <p style="text-align: center;">${data.description}</p>
       <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
         <span style="font-weight: bold; font-size: 20px; letter-spacing: 2px;">${data.code}</span>
       </div>
       <div style="text-align: center;">
         <a href="${data.ctaLink}" style="background-color: #111827; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Claim Offer</a>
       </div>
      ${generateFooterHtml()}
    </div>
  </div>
`;

export const generateAssetReleaseEmailHtml = (data: any) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: ${BG_COLOR}; padding: 20px;">
    <div style="background-color: white; border-radius: 12px; padding: 20px;">
      <img src="${data.imageUrl}" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 20px;" />
      <h2 style="color: #111827;">${data.assetName}</h2>
      <p>${data.description}</p>
      <a href="${data.demoUrl || '#'}" style="display:inline-block; background-color: #111827; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Asset</a>
      ${generateFooterHtml()}
    </div>
  </div>
`;

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
          ${generateFooterHtml()}
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
    const html = generateOTPEmailHtml(`Invited as ${role}`, otp, 'Accept Invitation', inviteUrl);
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
