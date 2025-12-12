import React from 'react';
import Navbar from './navbar';
import Footer from './footer';
export * from './footer';
export * from './navbar';
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
      <Footer
        socials={{
          twitter: 'https://twitter.com/moonui',
          github: 'https://github.com/moonui',
        }}
      />
    </>
  );
}
