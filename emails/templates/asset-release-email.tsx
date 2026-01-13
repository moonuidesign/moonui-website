import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Img,
  Text,
  Link,
  Hr,
  Font,
} from '@react-email/components';
import { EmailAssetCard } from '../components/email-asset-card';
import { EmailFooter } from '../components/email-footer';

const LOGO_URL = 'https://moonui.design/logo-moonui.png';

interface RelatedAsset {
  id: string;
  title: string;
  imageUrl: string;
  tier?: string;
  type?: string;
  author?: string;
}

interface AssetReleaseEmailProps {
  assetName: string;
  assetId: string;
  assetType: string;
  imageUrl: string;
  description: string;
  badgeText?: string;
  relatedAssets?: RelatedAsset[];
}

export const AssetReleaseEmail = ({
  assetName = 'New Template',
  assetId = '1',
  assetType = 'templates',
  imageUrl = 'https://moonui.design/placeholder.png',
  description = 'Check out our latest addition to the library.',
  badgeText = 'New',
  relatedAssets = [],
}: AssetReleaseEmailProps) => {
  const assetUrl = `https://moonui.design/${assetType}/${assetId}`;

  return (
    <Html>
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Arial"
          webFont={{
            url: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <Font
          fontFamily="Plus Jakarta Sans"
          fallbackFontFamily="Arial"
          webFont={{
            url: 'https://fonts.gstatic.com/s/plusjakartasans/v8/LDIbaomQNQcsA88c7O9yZ4KMCoOg4IA6-91aHEjcWuA_qU79S35Z.woff2',
            format: 'woff2',
          }}
          fontWeight={600}
          fontStyle="normal"
        />
      </Head>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerStyle}>
            <Link href="https://moonui.design" style={{ textDecoration: 'none' }}>
              <Img
                src={LOGO_URL}
                alt="MoonUI Logo"
                width={40}
                height="auto"
                style={{ margin: '0 auto 20px' }}
              />
            </Link>
            <Text style={headerTitleStyle}>New Release</Text>
            <Text style={headerSubtitleStyle}>Check out our latest addition to the library.</Text>
          </Section>

          {/* Main Asset Card */}
          <EmailAssetCard
            title={assetName}
            imageUrl={imageUrl}
            tier="pro"
            badge={badgeText}
            url={assetUrl}
            type={assetType}
          />

          {/* Description */}
          <Section style={descriptionStyle}>
            <Text style={descriptionTextStyle}>{description}</Text>
          </Section>

          {/* Related Assets */}
          {relatedAssets && relatedAssets.length > 0 && (
            <Section style={relatedSectionStyle}>
              <Hr style={hrStyle} />
              <Text style={relatedTitleStyle}>More like this</Text>

              <Row>
                {relatedAssets.slice(0, 3).map((asset, index) => (
                  <Column key={index} style={relatedColumnStyle}>
                    <EmailAssetCard
                      title={asset.title}
                      imageUrl={asset.imageUrl}
                      tier={asset.tier}
                      url={`https://moonui.design/${asset.type || assetType}/${asset.id}`}
                      type={asset.type || assetType}
                      author={asset.author}
                    />
                  </Column>
                ))}
                {/* Fill empty columns if less than 3 */}
                {Array.from({ length: 3 - Math.min(relatedAssets.length, 3) }).map((_, index) => (
                  <Column key={`empty-${index}`} style={relatedColumnStyle} />
                ))}
              </Row>
            </Section>
          )}

          <EmailFooter />
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const bodyStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  fontFamily: "'Inter', Arial, sans-serif",
};

const containerStyle: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '40px 20px',
};

const headerStyle: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '40px',
};

const headerTitleStyle: React.CSSProperties = {
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  color: '#111827',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: 0,
};

const headerSubtitleStyle: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '16px',
  marginTop: '8px',
};

const descriptionStyle: React.CSSProperties = {
  marginTop: '30px',
  marginBottom: '30px',
};

const descriptionTextStyle: React.CSSProperties = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: 0,
};

const relatedSectionStyle: React.CSSProperties = {
  marginTop: '40px',
  paddingTop: '30px',
};

const hrStyle: React.CSSProperties = {
  margin: '0 0 20px 0',
};

const relatedTitleStyle: React.CSSProperties = {
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: '18px',
  fontWeight: 600,
  color: '#111827',
  marginBottom: '20px',
};

const relatedColumnStyle: React.CSSProperties = {
  width: '32%',
  verticalAlign: 'top',
  padding: '0 4px',
};

export default AssetReleaseEmail;
