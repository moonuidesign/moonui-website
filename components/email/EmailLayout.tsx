import React from 'react';

interface EmailLayoutProps {
  children: React.ReactNode;
  preview?: string;
}

export const EmailLayout: React.FC<EmailLayoutProps> = ({ children, preview }) => {
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="x-apple-disable-message-reformatting" />
        <title>MoonUI</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <style type="text/css">
          {`
            body {
              margin: 0;
              padding: 0;
              font-family: 'Inter', sans-serif;
              background-color: #f6f6f6;
            }
            img {
              border: 0;
              line-height: 100%;
              outline: none;
              text-decoration: none;
            }
            table {
              border-collapse: collapse;
            }
          `}
        </style>
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: '#f6f6f6',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {preview && (
          <div style={{ display: 'none', maxHeight: 0, overflow: 'hidden' }}>{preview}</div>
        )}
        <div
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            padding: '40px 20px',
          }}
        >
          {children}
        </div>
      </body>
    </html>
  );
};
