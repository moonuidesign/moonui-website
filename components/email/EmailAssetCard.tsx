import React from 'react';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://moonui.design';

interface EmailAssetCardProps {
  title: string;
  imageUrl: string | null;
  tier: string;
  url?: string;
  type?: string;
  badge?: string;
  author?: string;
}

export const EmailAssetCard: React.FC<EmailAssetCardProps> = ({
  title,
  imageUrl,
  tier,
  url = '#',
  type,
  badge,
  author,
}) => {
  const isTemplate = type === 'templates';
  // Aspect Ratio Logic:
  // Templates: 360/480 ~ 0.75 -> Height is 133% of width
  // Components: 360/260 ~ 1.38 -> Height is 72% of width
  const paddingBottom = isTemplate ? '133.33%' : '72.22%';
  const objectPosition = isTemplate ? 'top' : 'center';

  return (
    <div
      style={{
        backgroundColor: 'white',
        border: '1px solid #ffffff',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        width: '100%',
        fontFamily: "'Inter', sans-serif",
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Image Container */}
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        style={{ display: 'block', textDecoration: 'none', width: '100%' }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            paddingBottom: paddingBottom,
            height: 0,
            overflow: 'hidden',
            backgroundColor: '#f3f4f6',
            borderTopLeftRadius: '15px', // slightly less than container to prevent bleed
            borderTopRightRadius: '15px',
          }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: objectPosition,
                border: 'none',
                display: 'block',
              }}
            />
          ) : (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9ca3af',
                fontSize: '14px',
              }}
            >
              No Preview
            </div>
          )}
        </div>
      </a>

      {/* Meta Info */}
      <div style={{ padding: '12px 16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '8px',
            marginBottom: '4px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
            {/* Title */}
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              style={{
                fontFamily: "'Inter', sans-serif",
                color: '#3D3D3D',
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: '1.4',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '120px',
              }}
            >
              {title}
            </a>

            {/* New Badge */}
            {badge && (
              <span
                style={{
                  backgroundColor: '#ea580c',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap',
                  lineHeight: '1.2',
                }}
              >
                {badge}
              </span>
            )}
          </div>

          {/* Tier */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            {tier && tier !== 'free' && (
              <img
                src={`${APP_URL}/ic-diamond-small.svg`}
                width="14"
                height="14"
                alt="Pro"
                style={{ display: 'block' }}
              />
            )}
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                color: '#3D3D3D',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              {tier === 'pro_plus' ? 'Pro+' : tier === 'pro' ? 'Pro' : 'Free'}
            </span>
          </div>
        </div>

        {author && (
          <div style={{ fontFamily: "'Inter', sans-serif", color: '#71717a', fontSize: '12px' }}>
            by {author}
          </div>
        )}
      </div>
    </div>
  );
};
