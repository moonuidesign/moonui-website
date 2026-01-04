import { Html, Head, Body, Container, Section, Text, Button, Font } from '@react-email/components';
import { EmailFooter } from '../components/email-footer';

interface DiscountEmailProps {
  title: string;
  discountAmount: string;
  description: string;
  code: string;
  ctaLink: string;
}

export const DiscountEmail = ({
  title = 'Special Offer!',
  discountAmount = '50% OFF',
  description = "Limited time offer. Don't miss out!",
  code = 'SAVE50',
  ctaLink = 'https://moonui.design/pricing',
}: DiscountEmailProps) => {
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
      </Head>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section style={cardStyle}>
            <Text style={titleStyle}>{title}</Text>
            <Text style={discountStyle}>{discountAmount}</Text>
            <Text style={descriptionStyle}>{description}</Text>

            {/* Promo Code */}
            <Section style={codeContainerStyle}>
              <Text style={codeStyle}>{code}</Text>
            </Section>

            {/* CTA Button */}
            <Section style={{ textAlign: 'center' }}>
              <Button href={ctaLink} style={buttonStyle}>
                Claim Offer
              </Button>
            </Section>
          </Section>
          <EmailFooter />
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const bodyStyle: React.CSSProperties = {
  backgroundColor: '#f6f6f6',
  fontFamily: "'Inter', Arial, sans-serif",
};

const containerStyle: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '20px',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '12px',
  padding: '20px',
};

const titleStyle: React.CSSProperties = {
  color: '#111827',
  textAlign: 'center',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 10px 0',
};

const discountStyle: React.CSSProperties = {
  textAlign: 'center',
  fontSize: '36px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 10px 0',
};

const descriptionStyle: React.CSSProperties = {
  textAlign: 'center',
  color: '#6b7280',
  fontSize: '16px',
  margin: '0 0 20px 0',
};

const codeContainerStyle: React.CSSProperties = {
  background: '#f3f4f6',
  padding: '20px',
  textAlign: 'center',
  borderRadius: '8px',
  margin: '20px 0',
};

const codeStyle: React.CSSProperties = {
  fontWeight: 'bold',
  fontSize: '20px',
  letterSpacing: '2px',
  color: '#111827',
  margin: 0,
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: '#111827',
  color: 'white',
  padding: '12px 24px',
  textDecoration: 'none',
  borderRadius: '6px',
  fontWeight: 600,
};

export default DiscountEmail;
