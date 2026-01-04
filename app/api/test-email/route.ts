'use server';

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { render } from '@react-email/components';
import { OTPEmail } from '@/emails/templates/otp-email';
import { AssetReleaseEmail } from '@/emails/templates/asset-release-email';
import { DiscountEmail } from '@/emails/templates/discount-email';
import { GeneralEmail } from '@/emails/templates/general-email';

const resend = new Resend(process.env.RESEND_KEY);

// Email configuration
const EMAIL_DOMAIN = process.env.EMAIL_DOMAIN || 'fajarfe.me';
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'MoonUI';
const FROM_EMAIL = process.env.EMAIL_FROM_ADDRESS || `noreply@${EMAIL_DOMAIN}`;
const SENDER = `${FROM_NAME} <${FROM_EMAIL}>`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, email, data } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    let html = '';
    let subject = '';

    switch (type) {
      case 'otp':
        subject = data?.subject || 'Test OTP Email - MoonUI';
        html = await render(
          OTPEmail({
            title: data?.title || 'MoonUI Verification',
            otp: data?.otp || '123456',
            buttonText: data?.buttonText || 'Verify Email',
            buttonUrl: data?.buttonUrl || 'https://moonui.design',
          }),
        );
        break;

      case 'asset-release':
        subject = data?.subject || 'New Asset Release - MoonUI';
        html = await render(
          AssetReleaseEmail({
            assetName: data?.assetName || 'Sample Template',
            assetId: data?.assetId || '1',
            assetType: data?.assetType || 'templates',
            imageUrl: data?.imageUrl || 'https://moonui.design/placeholder.png',
            description: data?.description || 'Check out our latest addition to the library.',
            badgeText: data?.badgeText || 'New',
            relatedAssets: data?.relatedAssets || [],
          }),
        );
        break;

      case 'discount':
        subject = data?.subject || 'Special Discount - MoonUI';
        html = await render(
          DiscountEmail({
            title: data?.title || 'Special Offer!',
            discountAmount: data?.discountAmount || '50%',
            description: data?.description || 'Get this amazing discount on all MoonUI products.',
            code: data?.code || 'MOONUI50',
            ctaLink: data?.ctaLink || 'https://moonui.design/pricing',
          }),
        );
        break;

      case 'general':
        subject = data?.subject || 'Message from MoonUI';
        html = await render(
          GeneralEmail({
            content: data?.content || 'This is a test email from MoonUI.',
          }),
        );
        break;

      default:
        return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
    }

    const result = await resend.emails.send({
      from: SENDER,
      to: email,
      subject: subject,
      html: html,
    });

    console.log('Test email sent successfully:', result);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send email' },
      { status: 500 },
    );
  }
}

// GET handler for previewing email HTML
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'otp';
  const preview = searchParams.get('preview') === 'true';

  let html = '';

  switch (type) {
    case 'otp':
      html = await render(
        OTPEmail({
          title: 'MoonUI Verification',
          otp: '123456',
          buttonText: 'Verify Email',
          buttonUrl: 'https://moonui.design',
        }),
      );
      break;

    case 'asset-release':
      html = await render(
        AssetReleaseEmail({
          assetName: 'Premium Dashboard Template',
          assetId: '123',
          assetType: 'templates',
          imageUrl: 'https://moonui.design/placeholder.png',
          description: 'A beautiful and modern dashboard template with dark mode support.',
          badgeText: 'New',
          relatedAssets: [
            {
              id: '1',
              title: 'Landing Page',
              imageUrl: 'https://moonui.design/placeholder.png',
              tier: 'pro',
              type: 'templates',
              author: 'MoonUI',
            },
            {
              id: '2',
              title: 'Button Component',
              imageUrl: 'https://moonui.design/placeholder.png',
              tier: 'free',
              type: 'components',
              author: 'MoonUI',
            },
          ],
        }),
      );
      break;

    case 'discount':
      html = await render(
        DiscountEmail({
          title: 'Black Friday Sale!',
          discountAmount: '50%',
          description: 'Get 50% off on all MoonUI Pro products. Limited time offer!',
          code: 'BLACKFRIDAY50',
          ctaLink: 'https://moonui.design/pricing',
        }),
      );
      break;

    case 'general':
      html = await render(
        GeneralEmail({
          content:
            'This is a test general email from MoonUI. You can use this template for any general announcements.',
        }),
      );
      break;

    default:
      return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
  }

  if (preview) {
    // Return HTML directly for preview
    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  return NextResponse.json({ html });
}
