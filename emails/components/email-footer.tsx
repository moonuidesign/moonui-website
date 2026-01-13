import { Section, Row, Column, Link, Text, Hr } from '@react-email/components';

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

// Social Icons Components
const XIcon = ({ style }: { style?: React.CSSProperties }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 18 18"
    fill="currentcolor"
    style={style}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M13.0512 2.625H15.2112L10.4902 8.025L16.0452 15.375H11.6952L8.28922 10.918L4.39022 15.375H2.22822L7.27822 9.598L1.94922 2.625H6.40922L9.48922 6.699L13.0512 2.625ZM12.2912 14.08H13.4902L5.75822 3.852H4.47422L12.2932 14.08H12.2912Z" />
  </svg>
);

const InstagramIcon = ({ style }: { style?: React.CSSProperties }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 20 20"
    fill="currentcolor"
    style={style}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M13.0314 2.5H6.96858C4.5046 2.5 2.5 4.5046 2.5 6.96858V13.0314C2.5 15.4954 4.5046 17.5 6.96858 17.5H13.0314C15.4954 17.5 17.5 15.4954 17.5 13.0314V6.96858C17.5 4.5046 15.4954 2.5 13.0314 2.5ZM15.991 13.0314C15.991 14.6659 14.6659 15.991 13.0314 15.991H6.96858C5.33406 15.991 4.009 14.6659 4.009 13.0314V6.96858C4.009 5.33404 5.33406 4.009 6.96858 4.009H13.0314C14.6659 4.009 15.991 5.33404 15.991 6.96858V13.0314Z" />
    <path d="M10.0006 6.12012C7.86145 6.12012 6.12109 7.86047 6.12109 9.99962C6.12109 12.1388 7.86145 13.8792 10.0006 13.8792C12.1398 13.8792 13.8802 12.1388 13.8802 9.99962C13.8802 7.86044 12.1398 6.12012 10.0006 6.12012ZM10.0006 12.3702C8.69141 12.3702 7.63009 11.3089 7.63009 9.99965C7.63009 8.69043 8.69143 7.62912 10.0006 7.62912C11.3098 7.62912 12.3712 8.69043 12.3712 9.99965C12.3712 11.3088 11.3098 12.3702 10.0006 12.3702Z" />
    <path d="M13.8866 7.07896C14.4001 7.07896 14.8163 6.66276 14.8163 6.14934C14.8163 5.63593 14.4001 5.21973 13.8866 5.21973C13.3732 5.21973 12.957 5.63593 12.957 6.14934C12.957 6.66276 13.3732 7.07896 13.8866 7.07896Z" />
  </svg>
);

const LinkedInIcon = ({ style }: { style?: React.CSSProperties }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 5 1036 990"
    fill="currentcolor"
    style={style}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M0 120c0-33.334 11.667-60.834 35-82.5C58.333 15.833 88.667 5 126 5c36.667 0 66.333 10.666 89 32 23.333 22 35 50.666 35 86 0 32-11.333 58.666-34 80-23.333 22-54 33-92 33h-1c-36.667 0-66.333-11-89-33S0 153.333 0 120zm13 875V327h222v668H13zm345 0h222V622c0-23.334 2.667-41.334 8-54 9.333-22.667 23.5-41.834 42.5-57.5 19-15.667 42.833-23.5 71.5-23.5 74.667 0 112 50.333 112 151v357h222V612c0-98.667-23.333-173.5-70-224.5S857.667 311 781 311c-86 0-153 37-201 111v2h-1l1-2v-95H358c1.333 21.333 2 87.666 2 199 0 111.333-.667 267.666-2 469z" />
  </svg>
);

const SOCIAL_LINKS = [
  {
    icon: XIcon,
    href: 'https://x.com/moonuidesign',
    alt: 'X',
  },
  {
    icon: InstagramIcon,
    href: 'https://instagram.com/moonuidesign',
    alt: 'Instagram',
  },
  {
    icon: LinkedInIcon,
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
        <Column>
          <div style={{ display: 'flex', gap: '12px' }}>
            {SOCIAL_LINKS.map((social, index) => {
              const Icon = social.icon;
              return (
                <Link key={index} href={social.href} style={socialButtonStyle}>
                  <Icon style={{ color: '#888888' }} />
                </Link>
              );
            })}
          </div>
        </Column>
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

const socialButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  backgroundColor: '#f5f5f5',
  borderRadius: '8px',
  textDecoration: 'none',
  border: '1px solid #eeeeee',
};

export default EmailFooter;
