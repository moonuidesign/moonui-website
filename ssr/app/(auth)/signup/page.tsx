import { verifyLicenseSignature } from '@/libs/signature';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { RegisterForm } from '@/components/signUp/formSignUp';
import { toast } from 'react-toastify';

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined };
}) {
  const params = await searchParams;
  // const signature = params?.signature ?? '';
  // console.log(signature);
  // if (!signature) {
  //   console.log('awdawdad');
  // }

  // const verificationResult = await verifyLicenseSignature(signature);

  // if (!verificationResult.valid || verificationResult.expired) {
  //   console.log('awdawdad');
  // }

  // const { email, licenseKey } = verificationResult.payload!;

  return (
    <div className="dark:bg-black w-screen container mx-auto h-screen max-w-[1440px] max-h-[1024px] flex justify-center items-center">
      <div className="w-full flex h-[80%] min-h-[650px] justify-center item-center backdrop-blur-xs bg-opacity-40 rounded-xl p-5 ">
        <RegisterForm
        // signature={signature}
        // email={email}
        // licenseKey={licenseKey}
        />
      </div>
    </div>
  );
}
