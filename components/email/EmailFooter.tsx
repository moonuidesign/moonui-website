import React from 'react';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://moonui.design';

const FOOTER_LINKS = [
  {
    title: 'Products',
    items: [
      { label: 'MoonUI Templates', href: `${APP_URL}/assets?type=templates` },
      { label: 'MoonUI Components', href: `${APP_URL}/assets?type=components` },
      { label: 'MoonUI Assets', href: `${APP_URL}/assets?type=components` },
      { label: 'MoonUI Gradients', href: `${APP_URL}/assets?type=gradients` },
    ],
  },
  {
    title: 'Premium',
    items: [
      { label: 'Upgrade Pro', href: `${APP_URL}/pricing` },
      { label: 'Upgrade Pro Plus', href: `${APP_URL}/pricing` },
      { label: 'Contact Support', href: `${APP_URL}/contact` },
    ],
  },
  {
    title: 'MoonUI Design',
    items: [
      { label: 'Explore Now', href: `${APP_URL}/assets` },
      { label: 'Become an Affiliate', href: `${APP_URL}/about` },
      { label: 'About Us', href: `${APP_URL}/about` },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Active License', href: `${APP_URL}/verify-license` },
      { label: 'Sign In', href: `${APP_URL}/signin` },
      { label: 'Reset Password', href: `${APP_URL}/forgot-password` },
    ],
  },
  {
    title: 'Company',
    items: [
      { label: 'Privacy Policy', href: `${APP_URL}/privacy-policy` },
      { label: 'Terms of Use', href: `${APP_URL}/terms-of-use` },
      { label: 'Contact Us', href: `${APP_URL}/contact` },
    ],
  },
];

export const EmailFooter: React.FC = () => {
  return (
    <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
      <p
        style={{
          color: '#4b5563',
          fontSize: '14px',
          lineHeight: 1.6,
          marginBottom: '30px',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        We are MoonUI Studio and we bring free and premium design resources of the highest quality
        to the professional community.
      </p>

      {/* Footer Links Grid - Using Table for consistent layout */}
      <table
        role="presentation"
        width="100%"
        style={{
          width: '100%',
          marginBottom: '30px',
          borderCollapse: 'separate',
          borderSpacing: 0,
        }}
      >
        <tbody>
          <tr>
            {FOOTER_LINKS.slice(0, 3).map((col, i) => (
              <td key={i} style={{ verticalAlign: 'top', paddingBottom: '20px', width: '33%' }}>
                <h4
                  style={{
                    color: '#111827',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    margin: '0 0 10px 0',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {col.title}
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {col.items.map((link, j) => (
                    <li key={j} style={{ marginBottom: '8px' }}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'block',
                          padding: '2px 0',
                          color: '#111827',
                          textDecoration: 'none',
                          fontSize: '13px',
                          fontWeight: 500,
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </td>
            ))}
          </tr>
          <tr>
            {FOOTER_LINKS.slice(3).map((col, i) => (
              <td key={i} style={{ verticalAlign: 'top', paddingBottom: '20px', width: '33%' }}>
                <h4
                  style={{
                    color: '#111827',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    margin: '0 0 10px 0',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {col.title}
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {col.items.map((link, j) => (
                    <li key={j} style={{ marginBottom: '8px' }}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'block',
                          padding: '2px 0',
                          color: '#111827',
                          textDecoration: 'none',
                          fontSize: '13px',
                          fontWeight: 500,
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </td>
            ))}
            {/* Empty cell to fill the row if needed, though 2 cols is fine in a 3-col grid structure visually */}
            <td style={{ width: '33%' }}></td>
          </tr>
        </tbody>
      </table>

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '30px' }}>
        <p
          style={{
            color: '#374151',
            fontSize: '13px',
            margin: '0 0 15px 0',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Copyright © {new Date().getFullYear()} MoonUI Design, All rights reserved.
        </p>

        {/* Social Icons */}
        <div>
          <a
            href="https://x.com/moonuidesign"
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: 'none', marginRight: '15px' }}
          >
            <img
              src={`${APP_URL}/social/x.png`}
              alt="X"
              width="20"
              height="20"
              style={{ width: '20px', height: '20px', opacity: 0.8 }}
            />
          </a>
          <a
            href="https://instagram.com/moonuidesign"
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: 'none', marginRight: '15px' }}
          >
            <img
              src={`${APP_URL}/social/instagram.png`}
              alt="Instagram"
              width="20"
              height="20"
              style={{ width: '20px', height: '20px', opacity: 0.8 }}
            />
          </a>
          <a
            href="https://linkedin.com/company/moonuidesign"
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <img
              src={`${APP_URL}/social/linkedin.png`}
              alt="LinkedIn"
              width="20"
              height="20"
              style={{ width: '20px', height: '20px', opacity: 0.8 }}
            />
          </a>
        </div>
      </div>
    </div>
  );
};
