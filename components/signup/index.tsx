// app/register/page.tsx

import { verifyLicenseSignature } from '@/libs/signature';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { RegisterForm } from './formSignUp';
import path from 'path';
import fs from 'fs';
interface RegisterPageProps {
  searchParams: {
    signature?: string;
  };
}

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const { signature } = searchParams;

  if (!signature) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Invalid Link</CardTitle>
            <CardDescription>
              The registration link is missing a signature. Please start the
              license validation process again.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const verificationResult = await verifyLicenseSignature(signature);

  if (!verificationResult.valid || verificationResult.expired) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Link Invalid or Expired</CardTitle>
            <CardDescription>
              This registration link is either invalid or has expired. Please
              start the license validation process again.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Ekstrak data yang dibutuhkan untuk formulir
  const { email, licenseKey } = verificationResult.payload!;
  const filePath = path.join(process.cwd(), 'public', 'term-of-use.html');
  const htmlContent = fs.readFileSync(filePath, 'utf8');

  return (
    <div className="flex h-full items-center justify-center">
      <RegisterForm
        signature={signature}
        email={email}
        licenseKey={licenseKey}
        termsContent={htmlContent}
      />
    </div>
  );
}
