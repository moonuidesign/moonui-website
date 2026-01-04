import { Html, Head, Body, Container, Section, Text, Font } from '@react-email/components';
import { EmailFooter } from '../components/email-footer';

interface GeneralEmailProps {
  content: string;
}

export const GeneralEmail = ({
  content = 'This is a general email content.',
}: GeneralEmailProps) => {
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
            <div style={contentStyle} dangerouslySetInnerHTML={{ __html: content }} />
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
  borderRadius: '8px',
  padding: '20px',
};

const contentStyle: React.CSSProperties = {
  color: '#333',
  lineHeight: '1.6',
};

export default GeneralEmail;
