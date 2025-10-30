import { Resend } from 'resend';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from './getR2 copy';

interface ResendError extends Error {
  statusCode?: number;
  response?: {
    body?: unknown;
  };
}

/**
 * Type guard to check if an unknown error is a ResendError.
 * This function safely checks for the existence of properties on the error object.
 * @param error The error object of unknown type.
 * @returns True if the error matches the ResendError structure.
 */
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
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Kangsan System';
const FROM_EMAIL = process.env.EMAIL_FROM_ADDRESS || `noreply@${EMAIL_DOMAIN}`;
const SENDER = `${FROM_NAME} <${FROM_EMAIL}>`;

const LOGO_URL = `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`;
const PRIMARY_COLOR = '#4F46E5';
const BG_COLOR = '#f6f6f6';

export async function sendVerificationEmail(email: string, otp: string) {
  try {
    const data = await resend.emails.send({
      from: SENDER,
      to: email,
      subject: 'Verify your email address',
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: ${BG_COLOR}; padding: 20px;">
        <div style="background-color: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          <!-- Header with Logo -->
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="${LOGO_URL}" alt="Waterm Logo" style="width: 120px; height: auto;">
          </div>

          <h2 style="color: ${PRIMARY_COLOR}; text-align: center; font-size: 24px; margin-bottom: 20px;">Email Verification</h2>
          
          <p style="color: #666; line-height: 1.5; margin-bottom: 25px; text-align: center;">
            Thank you for registering with Waterm. Please use the following OTP code to verify your email address:
          </p>

          <div style="background-color: #f8fafc; border: 2px dashed ${PRIMARY_COLOR}; padding: 20px; font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 8px; margin: 30px 0; color: ${PRIMARY_COLOR}; border-radius: 8px;">
            ${otp}
          </div>

          <p style="color: #666; line-height: 1.5; margin-bottom: 15px; text-align: center;">
            This code will expire in <strong>10 minutes</strong>.
          </p>

          <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              If you didn't request this verification, please ignore this email.
            </p>
          </div>
        </div>
      </div>
    `,
    });
    console.log('Email sent successfully:', data);
    return data;
  } catch (error) {
    // Changed from 'unknown' to implicit any
    if (isResendError(error)) {
      if (error.statusCode === 403) {
        console.error('Domain verification error:', error.message);
      }
      console.error('Error sending verification email:', {
        statusCode: error.statusCode,
        message: error.message,
        name: error.name,
        body: error.response?.body,
      });
    } else {
      console.error('An unexpected non-object error occurred:', error);
    }
    throw error;
  }
}

export async function sendPasswordResetEmail(
  email: string,
  otp: string,
  resetUrl?: string,
) {
  try {
    const data = await resend.emails.send({
      from: SENDER,
      to: email,
      subject: 'Reset your password',
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: ${BG_COLOR}; padding: 20px;">
        <div style="background-color: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          <!-- Header with Logo -->
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="${LOGO_URL}" alt="Waterm Logo" style="width: 120px; height: auto;">
          </div>

          <h2 style="color: ${PRIMARY_COLOR}; text-align: center; font-size: 24px; margin-bottom: 20px;">Password Reset</h2>
          
          <p style="color: #666; line-height: 1.5; margin-bottom: 25px; text-align: center;">
            We received a request to reset your password. Use the following OTP code:
          </p>

          <div style="background-color: #f8fafc; border: 2px dashed ${PRIMARY_COLOR}; padding: 20px; font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 8px; margin: 30px 0; color: ${PRIMARY_COLOR}; border-radius: 8px;">
            ${otp}
          </div>

          ${
            resetUrl
              ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}${resetUrl}" 
               style="background-color: ${PRIMARY_COLOR}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 500; display: inline-block; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              Reset Password
            </a>
          </div>
          `
              : ''
          }

          <p style="color: #666; line-height: 1.5; margin-bottom: 15px; text-align: center;">
            This code will expire in <strong>10 minutes</strong>.
          </p>

          <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              If you didn't request this password reset, please ignore this email.
            </p>
          </div>
        </div>
      </div>
    `,
    });
    console.log('Password reset email sent successfully:', data);
    return data;
  } catch (error: unknown) {
    // Changed from 'any' to 'unknown'
    if (isResendError(error)) {
      if (error.statusCode === 403) {
        console.error('Domain verification error:', error.message);
      }
      console.error('Error sending verification email:', {
        statusCode: error.statusCode,
        message: error.message,
        name: error.name,
        body: error.response?.body,
      });
    } else {
      console.error('An unexpected non-object error occurred:', error);
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

  // Process attachments if they exist
  const attachmentLinks = [];
  if (formData.attachments && formData.attachments.length > 0) {
    for (const file of formData.attachments) {
      // Convert File object to ArrayBuffer for S3 upload
      const fileDataArrayBuffer = await file.arrayBuffer();

      // Generate a unique filename using hash
      const hashBuffer = await crypto.subtle.digest(
        'SHA-256',
        fileDataArrayBuffer,
      );
      const hashHex = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      // Use original filename extension
      const fileExtension = file.name.split('.').pop();
      const key = `${hashHex}.${fileExtension}`;

      // Create Node.js Buffer for S3 upload
      const s3UploadBuffer = Buffer.from(fileDataArrayBuffer);

      // Upload to R2
      const s3Params = {
        Bucket: process.env.BUCKET_NAME!,
        Key: key,
        Body: s3UploadBuffer, // Use the Node.js Buffer for S3
        ContentType: file.type,
      };

      await s3Client.send(new PutObjectCommand(s3Params));

      // Generate public URL for the file
      const fileUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;

      attachmentLinks.push({
        name: file.name,
        size: file.size,
        url: fileUrl,
      });
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
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Contact Form Submission</title>
        <style>
          @media only screen and (max-width: 620px) {
            table.body h1 {
              font-size: 28px !important;
              margin-bottom: 10px !important;
            }
            table.body p,
            table.body ul,
            table.body ol,
            table.body td,
            table.body span,
            table.body a {
              font-size: 16px !important;
            }
            table.body .wrapper,
            table.body .article {
              padding: 10px !important;
            }
            table.body .content {
              padding: 0 !important;
            }
            table.body .container {
              padding: 0 !important;
              width: 100% !important;
            }
            table.body .main {
              border-left-width: 0 !important;
              border-radius: 0 !important;
              border-right-width: 0 !important;
            }
            table.body .btn table {
              width: 100% !important;
            }
            table.body .btn a {
              width: 100% !important;
            }
            table.body .img-responsive {
              height: auto !important;
              max-width: 100% !important;
              width: auto !important;
            }
          }
          @media all {
            .ExternalClass {
              width: 100%;
            }
            .ExternalClass,
            .ExternalClass p,
            .ExternalClass span,
            .ExternalClass font,
            .ExternalClass td,
            .ExternalClass div {
              line-height: 100%;
            }
            .apple-link a {
              color: inherit !important;
              font-family: inherit !important;
              font-size: inherit !important;
              font-weight: inherit !important;
              line-height: inherit !important;
              text-decoration: none !important;
            }
            #MessageViewBody a {
              color: inherit;
              text-decoration: none;
              font-size: inherit;
              font-family: inherit;
              font-weight: inherit;
              line-height: inherit;
            }
            .btn-primary table td:hover {
              background-color: #3498db !important;
            }
            .btn-primary a:hover {
              background-color: #3498db !important;
              border-color: #3498db !important;
            }
          }
        </style>
      </head>
      <body style="background-color: ${BG_COLOR}; font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.4; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          <!-- Header with Logo -->
          <div style="text-align: center; padding: 20px; background-color: white; border-bottom: 1px solid #eee;">
            <img src="${LOGO_URL}" alt="Waterm Logo" style="width: 120px; height: auto;">
          </div>

          <!-- Content -->
          <div style="padding: 30px;">
            <h1 style="color: ${PRIMARY_COLOR}; font-size: 24px; font-weight: bold; margin: 0 0 20px 0; text-align: center;">New Contact Form Submission</h1>
            
            <p style="color: #666; line-height: 1.5; margin-bottom: 25px;">
              You have received a new contact form submission with the following details:
            </p>
            
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; margin-bottom: 20px;" width="100%">
              <tr>
                <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding: 10px; background-color: #f8f9fa; border-bottom: 1px solid #e9e9e9; font-weight: bold; width: 30%;" valign="top">Name</td>
                <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding: 10px; background-color: #f8f9fa; border-bottom: 1px solid #e9e9e9;" valign="top">${
                  formData.name
                }</td>
              </tr>
              <tr>
                <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding: 10px; border-bottom: 1px solid #e9e9e9; font-weight: bold;" valign="top">Email</td>
                <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding: 10px; border-bottom: 1px solid #e9e9e9;" valign="top"><a href="mailto:${
                  formData.email
                }" style="color: ${PRIMARY_COLOR}; text-decoration: underline;">${
        formData.email
      }</a></td>
              </tr>
              <tr>
                <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding: 10px; background-color: #f8f9fa; border-bottom: 1px solid #e9e9e9; font-weight: bold;" valign="top">Topic</td>
                <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding: 10px; background-color: #f8f9fa; border-bottom: 1px solid #e9e9e9;" valign="top">${
                  formData.topic
                }</td>
              </tr>
              <tr>
                <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding: 10px; border-bottom: 1px solid #e9e9e9; font-weight: bold;" valign="top">Priority</td>
                <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding: 10px; border-bottom: 1px solid #e9e9e9;" valign="top">
                  <span style="display: inline-block; padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold; text-transform: uppercase; ${getPriorityStyle(
                    formData.priority,
                  )}">
                    ${formData.priority}
                  </span>
                </td>
              </tr>
              ${
                attachmentLinks.length > 0
                  ? `
              <tr>
                <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding: 10px; background-color: #f8f9fa; border-bottom: 1px solid #e9e9e9; font-weight: bold;" valign="top">Attachments</td>
                <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding: 10px; background-color: #f8f9fa; border-bottom: 1px solid #e9e9e9;" valign="top">
                  ${attachmentLinks
                    .map(
                      (file) =>
                        `<div><a href="${
                          file.url
                        }" target="_blank" style="color: ${PRIMARY_COLOR};">${
                          file.name
                        }</a> (${(file.size / 1024).toFixed(2)} KB)</div>`,
                    )
                    .join('')}
                </td>
              </tr>
              `
                  : ''
              }
            </table>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <h3 style="color: ${PRIMARY_COLOR}; font-size: 16px; font-weight: bold; margin: 0 0 10px 0;">Message</h3>
              <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; line-height: 1.6; white-space: pre-wrap;">${
                formData.message
              }</p>
            </div>
            
            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">You can reply directly to this email to respond to ${
              formData.name
            }.</p>
          </div>
        </div>
      </body>
      </html>`,
    });
    console.log('Contact form email sent successfully:', data);
    return data;
  } catch (error: unknown) {
    // Changed from 'any' to 'unknown'
    if (isResendError(error)) {
      if (error.statusCode === 403) {
        console.error('Domain verification error:', error.message);
      }
      console.error('Error sending contact form email:', {
        statusCode: error.statusCode,
        message: error.message,
        name: error.name,
        body: error.response?.body,
      });
    } else {
      console.error('An unexpected non-object error occurred:', error);
    }
    throw error;
  }
}
