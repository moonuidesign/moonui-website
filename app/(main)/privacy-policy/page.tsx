import React from 'react';
import { Metadata } from 'next';
import fs from 'fs';
import path from 'path';

export const metadata: Metadata = {
  title: 'Privacy Policy | MoonUI Design',
  description: 'Privacy Policy for BAGGY.CO LLC and MoonUI Design services.',
};

const PrivacyPolicy = () => {
  const filePath = path.join(process.cwd(), 'public', 'privacy-policy.html');
  const htmlContent = fs.readFileSync(filePath, 'utf8');

  return (
    // 1. Tambahkan break-words untuk memutus URL panjang agar tidak tembus
    // 2. Gunakan w-full agar mengikuti lebar layar mobile
    <div className="max-w-4xl  mx-auto px-4 md:px-6 py-12 font-sans text-gray-700 leading-relaxed break-words overflow-x-hidden">
      <div
        // 3. Tambahkan prose (jika pakai plugin typography) atau class manual
        // 4. Tambahkan [&_table]:display-block dan overflow-x-auto jika ada tabel di dalam HTML
        className="w-full mt-20 overflow-hidden 
                   [&>table]:display-block [&>table]:overflow-x-auto 
                   [&>pre]:overflow-x-auto [&>pre]:whitespace-pre-wrap
                   [&_a]:break-all"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
};

export default PrivacyPolicy;
