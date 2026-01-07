import { Metadata } from 'next';
import fs from 'fs';
import path from 'path';

export const metadata: Metadata = {
  title: 'Terms of Use — Guidelines & Policies',
  description:
    'Terms of Use for MoonUI Design services. Read our terms and conditions for using our premium UI components, templates, and design assets.',
  openGraph: {
    title: 'Terms of Use | MoonUI',
    description: 'Terms and conditions for using MoonUI Design services.',
    url: 'https://moonui.design/terms-of-use',
  },
  alternates: {
    canonical: 'https://moonui.design/terms-of-use',
  },
};

const PrivacyPolicy = () => {
  const filePath = path.join(process.cwd(), 'public', 'term-of-use.html');
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
