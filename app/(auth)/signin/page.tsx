import { SignInForm } from '@/components/signin';

export default function SignInPage() {
  return (
    <div className="bg-[#E8E8E8]">
      <div className="container mx-auto flex h-fit max-h-[1024px] w-screen max-w-[1440px] items-center justify-center md:my-16 dark:bg-black">
        <div className="item-center bg-opacity-40 flex h-[80%] min-h-[650px] w-full justify-center rounded-xl p-5 backdrop-blur-xs">
          <SignInForm />
        </div>
      </div>
    </div>
  );
}
