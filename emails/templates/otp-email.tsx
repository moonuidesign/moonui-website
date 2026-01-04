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
  Button,
  Font,
} from '@react-email/components';
import { EmailFooter } from '../components/email-footer';

const LOGO_URL = 'https://moonui.design/logo.png';

interface OTPEmailProps {
  title: string;
  otp: string;
  buttonText: string;
  buttonUrl?: string;
}

export const OTPEmail = ({
  title = 'MoonUI Verification',
  otp = '123456',
  buttonText = 'Verify Email',
  buttonUrl = '#',
}: OTPEmailProps) => {
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
          {/* Header */}
          <Row style={headerStyle}>
            <Column>
              <Img src={LOGO_URL} alt="MoonUI Logo" width={120} height="auto" />
            </Column>
            <Column style={{ textAlign: 'right', verticalAlign: 'middle' }}>
              <Text style={headerTitleStyle}>MoonUI Studio</Text>
              <Text style={headerSubtitleStyle}>Login with magic link</Text>
            </Column>
          </Row>

          {/* Main Card */}
          <Section style={cardStyle}>
            {/* Icon */}
            <div style={iconContainerStyle}>
              <span style={{ fontSize: '24px' }}>✉️</span>
            </div>

            {/* Title */}
            <Text style={cardTitleStyle}>{title}</Text>

            <Text style={cardDescStyle}>Click the button below to {buttonText.toLowerCase()}.</Text>

            {/* Button */}
            <Button href={buttonUrl} style={buttonStyle}>
              Click to {buttonText.toLowerCase()}
            </Button>

            <Text style={cardDescStyle}>Or copy and paste the following code:</Text>

            {/* OTP Code */}
            <Section style={otpContainerStyle}>
              <Text style={otpStyle}>{otp}</Text>
            </Section>

            <Text style={hintStyle}>
              If you didn&apos;t try to {buttonText.toLowerCase()}, ignore this email.
            </Text>
          </Section>

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
  marginBottom: '40px',
};

const headerTitleStyle: React.CSSProperties = {
  color: '#111827',
  fontSize: '14px',
  fontWeight: 600,
  margin: 0,
  textAlign: 'right',
};

const headerSubtitleStyle: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '12px',
  margin: 0,
  textAlign: 'right',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  borderRadius: '12px',
  padding: '40px',
  textAlign: 'left',
  border: '1px solid #e5e7eb',
};

const iconContainerStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  border: '1px solid #e5e7eb',
  background: 'white',
  marginBottom: '20px',
};

const cardTitleStyle: React.CSSProperties = {
  color: '#111827',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 10px 0',
};

const cardDescStyle: React.CSSProperties = {
  color: '#374151',
  fontSize: '14px',
  margin: '0 0 25px 0',
};

const buttonStyle: React.CSSProperties = {
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
  marginBottom: '30px',
};

const otpContainerStyle: React.CSSProperties = {
  backgroundColor: 'white',
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  padding: '12px',
  textAlign: 'center',
  marginBottom: '30px',
};

const otpStyle: React.CSSProperties = {
  fontFamily: 'monospace',
  fontSize: '24px',
  fontWeight: 600,
  color: '#111827',
  letterSpacing: '8px',
  margin: 0,
};

const hintStyle: React.CSSProperties = {
  color: '#9ca3af',
  fontSize: '12px',
  margin: 0,
};

export default OTPEmail;
