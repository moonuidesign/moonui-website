import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { EmailLayout } from '@/components/email/EmailLayout';
import { EmailFooter } from '@/components/email/EmailFooter';
import { EmailAssetCard } from '@/components/email/EmailAssetCard';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://moonui.design';

// Helper to wrap content in layout
const renderEmail = (content: React.ReactNode, preview?: string) => {
  const html = renderToStaticMarkup(<EmailLayout preview={preview}>{content}</EmailLayout>);
  return `<!DOCTYPE html>${html}`;
};

export const renderAssetReleaseEmail = (data: any) => {
  return renderEmail(
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <img
          src={`${APP_URL}/logo.png`}
          alt="MoonUI Logo"
          style={{ width: '40px', height: 'auto', marginBottom: '20px' }}
        />
        <h1
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: '#111827',
            fontSize: '24px',
            fontWeight: 'bold',
            margin: 0,
          }}
        >
          New Release
        </h1>
        <p style={{ color: '#6b7280', fontSize: '16px', marginTop: '8px' }}>
          Check out our latest addition to the library.
        </p>
      </div>

      {/* Main Asset */}
      <EmailAssetCard
        title={data.assetName}
        imageUrl={data.imageUrl}
        tier="pro"
        badge={data.badgeText || 'New'}
        url={data.demoUrl}
        type={data.assetType}
      />

      {/* Description */}
      <div
        style={{
          color: '#374151',
          fontSize: '16px',
          lineHeight: 1.6,
          marginBottom: '30px',
          marginTop: '30px',
        }}
        dangerouslySetInnerHTML={{ __html: data.description.replace(/\n/g, '<br/>') }}
      />

      {/* CTA Button */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <a
          href={data.demoUrl || '#'}
          style={{
            display: 'inline-block',
            backgroundColor: '#111827',
            color: 'white',
            padding: '14px 32px',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '16px',
          }}
        >
          View Asset
        </a>
      </div>

      {/* Related Assets */}
      {data.relatedAssets && data.relatedAssets.length > 0 && (
        <div style={{ marginTop: '40px', borderTop: '1px solid #e5e7eb', paddingTop: '30px' }}>
          <h3
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '18px',
              fontWeight: 600,
              color: '#111827',
              marginBottom: '20px',
            }}
          >
            More like this
          </h3>
          {/* Grid using Table for Email Safety */}
          <table width="100%" cellPadding="0" cellSpacing="0" style={{ tableLayout: 'fixed' }}>
            <tbody>
              <tr>
                {data.relatedAssets.map((asset: any, index: number) => (
                  <td
                    key={index}
                    style={{ width: '33.33%', padding: '0 8px', verticalAlign: 'top' }}
                  >
                    <EmailAssetCard
                      title={asset.title}
                      imageUrl={asset.imageUrl}
                      tier={asset.tier}
                      url={`${APP_URL}/${asset.type || 'assets'}/${asset.id}`}
                      type={asset.type || data.assetType}
                      author={asset.author}
                    />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <EmailFooter />
    </div>,
    data.assetName,
  );
};

export const renderGeneralEmail = (content: string) => {
  return renderEmail(
    <div>
      <div
        dangerouslySetInnerHTML={{ __html: content }}
        style={{ color: '#333', lineHeight: 1.6 }}
      />
      <EmailFooter />
    </div>,
    content.substring(0, 100),
  );
};

export const renderOTPEmail = (
  title: string,
  otp: string,
  buttonText: string,
  buttonUrl: string = '#',
) => {
  return renderEmail(
    <div>
      {/* Top Header */}
      <table role="presentation" width="100%" style={{ width: '100%', marginBottom: '40px' }}>
        <tbody>
          <tr>
            <td style={{ textAlign: 'left' }}>
              <img
                src={`${APP_URL}/logo.png`}
                alt="MoonUI Logo"
                style={{ width: '120px', height: 'auto' }}
              />
            </td>
            <td style={{ textAlign: 'right', verticalAlign: 'middle' }}>
              <span style={{ color: '#111827', fontSize: '14px', fontWeight: 600 }}>
                MoonUI Studio
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Main Card */}
      <div
        style={{
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'left',
          border: '1px solid #e5e7eb',
        }}
      >
        <div style={{ marginBottom: '20px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              background: 'white',
            }}
          >
            <span style={{ fontSize: '24px' }}>***</span>
          </div>
        </div>

        <h1
          style={{ color: '#111827', fontSize: '20px', fontWeight: 'bold', margin: '0 0 10px 0' }}
        >
          {title}
        </h1>

        <p style={{ color: '#374151', fontSize: '14px', margin: '0 0 25px 0' }}>
          Click the button below to {buttonText.toLowerCase()}.
        </p>

        <div style={{ marginBottom: '30px' }}>
          <a
            href={buttonUrl}
            style={{
              display: 'block',
              width: '100%',
              backgroundColor: '#1f2937',
              color: 'white',
              textDecoration: 'none',
              padding: '14px 20px',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '14px',
              textAlign: 'center',
              boxSizing: 'border-box',
            }}
          >
            Click to {buttonText.toLowerCase()}
          </a>
        </div>

        <p style={{ color: '#374151', fontSize: '14px', margin: '0 0 15px 0' }}>
          Or copy and paste the following code:
        </p>

        <div
          style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '12px',
            textAlign: 'center',
            marginBottom: '30px',
          }}
        >
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '24px',
              fontWeight: 600,
              color: '#111827',
              letterSpacing: '8px',
            }}
          >
            {otp}
          </span>
        </div>

        <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>
          If you didn't try to {buttonText.toLowerCase()}, ignore this email.
        </p>
      </div>

      <EmailFooter />
    </div>,
    title,
  );
};
