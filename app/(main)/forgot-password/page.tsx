import ForgotPasswordForm from '@/components/forgot-password';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forgot Password — Reset Your Account',
  description: 'Reset your MoonUI account password.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return (
    <div className="h-screen bg-[#E8E8E8]">
      <div className="container mx-auto flex h-screen max-h-[1024px] w-screen max-w-[1440px] items-center justify-center dark:bg-black">
        <div className="item-center bg-opacity-40 flex h-[80%] min-h-[650px] w-full justify-center rounded-xl p-5 backdrop-blur-xs">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
