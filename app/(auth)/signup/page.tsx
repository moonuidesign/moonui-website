// app/register/page.tsx (atau lokasi file Anda)

import { verifyLicenseSignature } from '@/libs/signature';
import { RegisterForm } from '@/components/signup/formSignUp';
import { redirect } from 'next/navigation'; // Import redirect

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined };
}) {
  const params = await searchParams;
  const signature = params?.signature ?? '';

  // Jika tidak ada signature, langsung redirect dengan pesan error
  if (!signature) {
    redirect(
      '/?error=No signature provided. Please use the link from your email.',
    );
  }

  // Lakukan verifikasi di server
  const verificationResult = await verifyLicenseSignature(signature);

  // Jika signature tidak valid atau sudah kedaluwarsa
  if (!verificationResult.valid) {
    redirect(
      '/?error=The activation link is invalid. Please request a new one.',
    );
  }
  if (verificationResult.expired) {
    redirect(
      '/?error=The activation link has expired. Please request a new one.',
    );
  }
  const { email, licenseKey } = verificationResult.payload!;

  return (
    <div className="dark:bg-black w-screen container mx-auto h-screen max-w-[1440px] max-h-[1024px] flex justify-center items-center">
      <div className="w-full flex h-[80%] min-h-[650px] justify-center item-center backdrop-blur-xs bg-opacity-40 rounded-xl p-5 ">
        <RegisterForm
          signature={signature}
          email={email}
          licenseKey={licenseKey}
        />
      </div>
    </div>
  );
}
