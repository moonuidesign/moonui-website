import React from 'react';
import { Metadata } from 'next';
import fs from 'fs';
import path from 'path';

export const metadata: Metadata = {
  title: 'Privacy Policy — Your Data, Protected',
  description:
    'Privacy Policy for MoonUI Design by BAGGY.CO LLC. Learn how we collect, use, and protect your personal information.',
  openGraph: {
    title: 'Privacy Policy | MoonUI',
    description: 'Learn how MoonUI collects, uses, and protects your personal information.',
    url: 'https://moonui.design/privacy-policy',
  },
  alternates: {
    canonical: 'https://moonui.design/privacy-policy',
  },
};

const PrivacyPolicy = () => {
  const filePath = path.join(process.cwd(), 'public', 'privacy-policy.html');
  const htmlContent = fs.readFileSync(filePath, 'utf8');

  return (
    // 1. Tambahkan break-words untuk memutus URL panjang agar tidak tembus
    // 2. Gunakan w-full agar mengikuti lebar layar mobile
    <div className="mx-auto max-w-4xl overflow-x-hidden px-4 py-12 font-sans leading-relaxed break-words text-gray-700 md:px-6">
      <div
        // 3. Tambahkan prose (jika pakai plugin typography) atau class manual
        // 4. Tambahkan [&_table]:display-block dan overflow-x-auto jika ada tabel di dalam HTML
        className="[&>table]:display-block mt-20 w-full overflow-hidden [&_a]:break-all [&>pre]:overflow-x-auto [&>pre]:whitespace-pre-wrap [&>table]:overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
};

export default PrivacyPolicy;
