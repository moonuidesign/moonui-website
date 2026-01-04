import { Section, Row, Column, Img, Link, Text } from '@react-email/components';

interface EmailAssetCardProps {
  title: string;
  imageUrl: string;
  tier?: string;
  badge?: string;
  url?: string;
  type?: string;
  author?: string;
}

export const EmailAssetCard = ({
  title,
  imageUrl,
  tier = 'free',
  badge,
  url = '#',
  type = 'components',
  author,
}: EmailAssetCardProps) => {
  const isTemplate = type === 'templates';
  // Templates: taller (360/480 = 0.75), Others: wider (360/260 = 1.38)
  const imageHeight = isTemplate ? 200 : 120;
  const objectPosition = isTemplate ? 'top' : 'center';

  const tierLabel = tier === 'pro_plus' ? 'Pro Plus' : tier === 'pro' ? 'Pro' : 'Free';
  const showDiamond = tier !== 'free';

  return (
    <Section style={cardStyle}>
      {/* Image Container */}
      <Link href={url} style={{ textDecoration: 'none' }}>
        <div style={imageContainerStyle}>
          {imageUrl ? (
            <Img
              src={imageUrl}
              alt={title}
              width="100%"
              height={imageHeight}
              style={{
                objectFit: 'cover',
                objectPosition,
                borderRadius: '8px',
                display: 'block',
              }}
            />
          ) : (
            <div style={noPreviewStyle}>No Preview</div>
          )}
        </div>
      </Link>

      {/* Meta Info */}
      <Row style={metaRowStyle}>
        <Column style={{ verticalAlign: 'middle' }}>
          {/* Title and Badge */}
          <Row>
            <Column style={{ verticalAlign: 'middle' }}>
              <Link href={url} style={titleStyle}>
                {title.length > 15 ? `${title.substring(0, 15)}...` : title}
              </Link>
            </Column>
            {badge && (
              <Column style={{ verticalAlign: 'middle', paddingLeft: '8px' }}>
                <span style={badgeStyle}>{badge}</span>
              </Column>
            )}
          </Row>
          {/* Author */}
          {author && <Text style={authorStyle}>by {author}</Text>}
        </Column>

        {/* Tier */}
        <Column style={tierColumnStyle}>
          {showDiamond && (
            <Img
              src="https://moonui.design/ic-diamond-small.png"
              alt="Pro"
              width={14}
              height={14}
              style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}
            />
          )}
          <span style={tierLabelStyle}>{tierLabel}</span>
        </Column>
      </Row>
    </Section>
  );
};

// Styles
const cardStyle: React.CSSProperties = {
  backgroundColor: 'white',
  border: '1px solid #f3f4f6',
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  width: '100%',
  fontFamily: "'Inter', 'Arial', sans-serif",
};

const imageContainerStyle: React.CSSProperties = {
  width: '100%',
  overflow: 'hidden',
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
};

const noPreviewStyle: React.CSSProperties = {
  width: '100%',
  height: '120px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#9ca3af',
  fontSize: '14px',
  backgroundColor: '#f3f4f6',
};

const metaRowStyle: React.CSSProperties = {
  padding: '12px 8px',
};

const titleStyle: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  color: '#3D3D3D',
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: '24px',
  textDecoration: 'none',
  display: 'inline-block',
  maxWidth: '100px',
};

const badgeStyle: React.CSSProperties = {
  backgroundColor: '#ea580c',
  color: 'white',
  fontSize: '10px',
  fontWeight: 600,
  lineHeight: '10px',
  padding: '4px 6px',
  borderRadius: '6px',
  display: 'inline-block',
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
};

const authorStyle: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  color: '#71717a',
  fontSize: '12px',
  fontWeight: 400,
  margin: '2px 0 0 0',
};

const tierColumnStyle: React.CSSProperties = {
  textAlign: 'right',
  verticalAlign: 'middle',
  whiteSpace: 'nowrap',
};

const tierLabelStyle: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  color: '#3D3D3D',
  fontSize: '14px',
  fontWeight: 600,
  lineHeight: '24px',
  verticalAlign: 'middle',
};

export default EmailAssetCard;
