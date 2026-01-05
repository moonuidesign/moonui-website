import { Section, Row, Column, Img, Link, Text } from '@react-email/components';

interface EmailAssetCardProps {
  title: string;
  imageUrl: string;
  tier?: string;
  badge?: string;
  url?: string;
  type?: string;
  author?: string;
  createdAt?: Date | string | null;
}

export const EmailAssetCard = ({
  title,
  imageUrl,
  tier = 'free',
  badge,
  url = '#',
  type = 'components',
  author,
  createdAt,
}: EmailAssetCardProps) => {
  const isTemplate = type === 'templates';

  // Match ResourceCard: templates use fixed height 420px, others use aspect ratio 360/260
  // For email, we calculate: 360/260 = 1.384... so height = width * 260/360 = 72.22%
  // Using paddingBottom trick for aspect ratio in email won't work well, so we use fixed heights
  // Non-templates: aspect 360/260 means for a ~340px card width, height ~= 245px
  // Templates: fixed 420px height
  const imageHeight = isTemplate ? 420 : 245;
  const objectPosition = isTemplate ? 'top' : 'center';

  const tierLabel = tier === 'pro_plus' ? 'Pro Plus' : tier === 'pro' ? 'Pro' : 'Free';
  const showDiamond = tier !== 'free';

  // Calculate isNew - items created within last 30 days
  const isNew = createdAt
    ? (new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 3600 * 24) < 30
    : false;

  // Use badge prop if provided, otherwise check isNew
  const showBadge = badge || isNew;
  const badgeLabel = badge || (isNew ? 'New' : '');

  return (
    <Section style={cardStyle}>
      {/* Image Container - matches ResourceCard's rounded-2xl border border-white bg-white */}
      <Link href={url} style={{ textDecoration: 'none', display: 'block' }}>
        <div style={{ ...imageContainerStyle, height: `${imageHeight}px` }}>
          {imageUrl ? (
            <Img
              src={imageUrl}
              alt={title}
              width="100%"
              height={imageHeight}
              style={{
                objectFit: 'cover',
                objectPosition,
                borderRadius: '16px',
                display: 'block',
                width: '100%',
                height: `${imageHeight}px`,
              }}
            />
          ) : (
            <div style={{ ...noPreviewStyle, height: `${imageHeight}px` }}>No Preview</div>
          )}
        </div>
      </Link>

      {/* Meta Info - matches ResourceCard's px-2 layout with flex between */}
      <Row style={metaRowStyle}>
        {/* Left side: Title + Badge + Author */}
        <Column style={{ verticalAlign: 'top' }}>
          {/* Title and Badge row */}
          <table cellPadding="0" cellSpacing="0" style={{ border: 0 }}>
            <tr>
              <td style={{ verticalAlign: 'middle' }}>
                <Link href={url} style={titleStyle}>
                  {title.length > 18 ? `${title.substring(0, 18)}...` : title}
                </Link>
              </td>
              {showBadge && (
                <td style={{ verticalAlign: 'middle', paddingLeft: '8px' }}>
                  <span style={badgeStyle}>{badgeLabel}</span>
                </td>
              )}
            </tr>
          </table>
          {/* Author */}
          {author && <Text style={authorStyle}>by {author}</Text>}
        </Column>

        {/* Right side: Tier indicator */}
        <Column style={tierColumnStyle}>
          <table cellPadding="0" cellSpacing="0" style={{ border: 0, marginLeft: 'auto' }}>
            <tr>
              {showDiamond && (
                <td style={{ verticalAlign: 'middle', paddingRight: '4px' }}>
                  <Img
                    src="https://moonui.design/ic-diamond-small.png"
                    alt="Pro"
                    width={14}
                    height={14}
                    style={{ display: 'block' }}
                  />
                </td>
              )}
              <td style={{ verticalAlign: 'middle' }}>
                <span style={tierLabelStyle}>{tierLabel}</span>
              </td>
            </tr>
          </table>
        </Column>
      </Row>
    </Section>
  );
};

// Styles - matching ResourceCard exactly
const cardStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  width: '100%',
  fontFamily: "'Inter', 'Arial', sans-serif",
};

const imageContainerStyle: React.CSSProperties = {
  width: '100%',
  overflow: 'hidden',
  backgroundColor: '#ffffff',
  borderRadius: '16px',
};

const noPreviewStyle: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#9ca3af',
  fontSize: '14px',
  backgroundColor: '#f3f4f6',
  borderRadius: '16px',
};

const metaRowStyle: React.CSSProperties = {
  padding: '12px 8px 8px 8px',
};

const titleStyle: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  color: '#3D3D3D',
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: '24px',
  textDecoration: 'none',
  display: 'inline-block',
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
  lineHeight: '1',
};

const tierColumnStyle: React.CSSProperties = {
  textAlign: 'right',
  verticalAlign: 'top',
  whiteSpace: 'nowrap',
};

const tierLabelStyle: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  color: '#3D3D3D',
  fontSize: '14px',
  fontWeight: 600,
  lineHeight: '24px',
};

export default EmailAssetCard;
