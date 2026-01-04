import { Section, Row, Column, Link, Text, Img, Hr } from '@react-email/components';

const FOOTER_LINKS = {
  products: [
    { label: 'MoonUI Templates', href: 'https://moonui.design/assets?type=templates' },
    { label: 'MoonUI Components', href: 'https://moonui.design/assets?type=components' },
    { label: 'MoonUI Assets', href: 'https://moonui.design/assets' },
    { label: 'MoonUI Gradients', href: 'https://moonui.design/assets?type=gradients' },
  ],
  premium: [
    { label: 'Upgrade Pro', href: 'https://moonui.design/pricing' },
    { label: 'Upgrade Pro Plus', href: 'https://moonui.design/pricing' },
    { label: 'Contact Support', href: 'https://moonui.design/contact' },
  ],
  moonui: [
    { label: 'Explore Now', href: 'https://moonui.design/assets' },
    { label: 'Become an Affiliate', href: 'https://moonui.design/about' },
    { label: 'About Us', href: 'https://moonui.design/about' },
  ],
  account: [
    { label: 'Active License', href: 'https://moonui.design/verify-license' },
    { label: 'Sign In', href: 'https://moonui.design/signin' },
    { label: 'Reset Password', href: 'https://moonui.design/forgot-password' },
  ],
  company: [
    { label: 'Privacy Policy', href: 'https://moonui.design/privacy-policy' },
    { label: 'Terms of Use', href: 'https://moonui.design/terms-of-use' },
    { label: 'Contact Us', href: 'https://moonui.design/contact' },
  ],
};

const SOCIAL_LINKS = [
  { icon: 'https://moonui.design/x.png', href: 'https://x.com/moonuidesign', alt: 'X' },
  {
    icon: 'https://moonui.design/instagram.png',
    href: 'https://instagram.com/moonuidesign',
    alt: 'Instagram',
  },
  {
    icon: 'https://moonui.design/linkedin.png',
    href: 'https://linkedin.com/company/moonuidesign',
    alt: 'LinkedIn',
  },
];

const LinkList = ({ title, links }: { title: string; links: typeof FOOTER_LINKS.products }) => (
  <Column style={linkColumnStyle}>
    <Text style={linkTitleStyle}>{title}</Text>
    {links.map((link, index) => (
      <Link key={index} href={link.href} style={linkStyle}>
        {link.label}
      </Link>
    ))}
  </Column>
);

export const EmailFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Section style={footerContainerStyle}>
      <Hr style={hrStyle} />

      <Text style={descriptionStyle}>
        We are MoonUI Studio and we bring free and premium design resources of the highest quality
        to the professional community.
      </Text>

      {/* Links Grid - Row 1 */}
      <Row style={{ marginBottom: '20px' }}>
        <LinkList title="Products" links={FOOTER_LINKS.products} />
        <LinkList title="Premium" links={FOOTER_LINKS.premium} />
        <LinkList title="MoonUI Design" links={FOOTER_LINKS.moonui} />
      </Row>

      {/* Links Grid - Row 2 */}
      <Row style={{ marginBottom: '30px' }}>
        <LinkList title="Account" links={FOOTER_LINKS.account} />
        <LinkList title="Company" links={FOOTER_LINKS.company} />
        <Column style={{ width: '33%' }} />
      </Row>

      <Hr style={hrStyle} />

      {/* Copyright */}
      <Text style={copyrightStyle}>
        Copyright © {currentYear} MoonUI Design, All rights reserved.
      </Text>

      {/* Social Icons */}
      <Row>
        {SOCIAL_LINKS.map((social, index) => (
          <Column key={index} style={{ width: 'auto', paddingRight: '15px' }}>
            <Link href={social.href} style={{ textDecoration: 'none' }}>
              <Img
                src={social.icon}
                alt={social.alt}
                width={20}
                height={20}
                style={{ opacity: 0.8 }}
              />
            </Link>
          </Column>
        ))}
      </Row>
    </Section>
  );
};

// Styles
const footerContainerStyle: React.CSSProperties = {
  marginTop: '40px',
  paddingTop: '20px',
};

const hrStyle: React.CSSProperties = {
  borderColor: '#e5e7eb',
  borderTop: '1px solid #e5e7eb',
  margin: '0 0 20px 0',
};

const descriptionStyle: React.CSSProperties = {
  color: '#4b5563',
  fontFamily: "'Inter', sans-serif",
  fontSize: '14px',
  lineHeight: '1.6',
  marginBottom: '30px',
};

const linkColumnStyle: React.CSSProperties = {
  verticalAlign: 'top',
  width: '33%',
  paddingBottom: '20px',
};

const linkTitleStyle: React.CSSProperties = {
  color: '#111827',
  fontFamily: "'Inter', sans-serif",
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const linkStyle: React.CSSProperties = {
  display: 'block',
  padding: '2px 0',
  color: '#111827',
  textDecoration: 'none',
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  fontWeight: 500,
  marginBottom: '8px',
};

const copyrightStyle: React.CSSProperties = {
  color: '#374151',
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  margin: '0 0 15px 0',
};

export default EmailFooter;
