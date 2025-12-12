'use server';

import { licenses, licenseTransactions } from '@/db/migration';
import { db } from '@/libs/drizzle';

type LicenseStatus = 'active' | 'inactive' | 'expired' | 'disabled';

interface ResponseActivated {
  activated: true;
  error: null;
  license_key: {
    id: number;

    status: LicenseStatus;
    key: string;
    activation_limit: number;
    activation_usage: number;
    created_at: Date;
    expires_at: null | string;
    test_mode: true;
  };
  instance: {
    id: string;
    name: string;
    created_at: Date;
  };
  meta: {
    store_id: number;
    order_id: number;
    order_item_id: number;
    variant_id: number;
    variant_name: string;
    product_id: number;
    product_name: string;
    customer_id: number;
    customer_name: string;
    customer_email: string;
  };
}

export async function activateLicense(
  licenseKey: string,
  customerId: string,
  // customerEmail?: string,
) {
  console.log(
    `[LICENSE ACTIVATION] Attempting to activate license ${licenseKey} for user ${customerId}.`,
  );

  const response = await fetch(
    'https://api.lemonsqueezy.com/v1/licenses/activate',
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
      },
      body: new URLSearchParams({
        license_key: licenseKey,
        instance_name: `User-${customerId}`,
      }),
    },
  );

  // --- LANGKAH 2: GUNAKAN TYPE ASSERTION SAAT PARSING JSON ---
  // Kita memberitahu TypeScript untuk mempercayai bahwa data.license_key.status
  // akan sesuai dengan tipe LicenseStatus yang kita definisikan.
  const data = (await response.json()) as ResponseActivated;

  if (!response.ok || !data.activated) {
    const errorMessage = data.error || 'Failed to activate license via API.';
    console.error('Failed to activate Lemon Squeezy license:', errorMessage);
    throw new Error(errorMessage);
  }

  // Determine Tier and Plan Type
  const variantName = data.meta.variant_name?.toLowerCase() || '';
  let tier: 'pro' | 'pro_plus' = 'pro';
  let planType: 'subscribe' | 'one_time' = 'subscribe';

  if (variantName.includes('lifetime') || variantName.includes('unlimited')) {
    tier = 'pro_plus';
    planType = 'one_time';
  } else {
    tier = 'pro';
    planType = 'subscribe';
  }

  console.log(
    `[LICENSE ACTIVATION] API call successful for ${licenseKey}. Now updating database.`,
  );

  try {
    const activatedAtDate = new Date();
    // Use the expiration date from Lemon Squeezy if available, otherwise handle manually?
    // Usually Lemon Squeezy provides expires_at for subscriptions.
    const expiresAtDate = data.license_key.expires_at
      ? new Date(data.license_key.expires_at)
      : null;

    const [savedLicense] = await db
      .insert(licenses)
      .values({
        userId: customerId,
        licenseKey: data.license_key.key,
        status: data.license_key.status,
        planType: planType,
        tier: tier,
        activatedAt: activatedAtDate,
        expiresAt: expiresAtDate,
      })
      .onConflictDoUpdate({
        target: licenses.licenseKey,
        set: {
          userId: customerId,
          status: data.license_key.status,
          planType: planType,
          tier: tier,
          activatedAt: activatedAtDate,
          expiresAt: expiresAtDate,
          updatedAt: new Date(),
        },
      })
      .returning({ id: licenses.id });

    if (savedLicense) {
      // Mock Amount logic:
      // Pro Subscribe = 150000, Pro+ One Time = 500000 (Example)
      // In real app, pass amount from Lemon Squeezy payload (data.meta.total or data.attributes.total)
      const amount = planType === 'one_time' ? 500000 : 150000;

      await db.insert(licenseTransactions).values({
        userId: customerId,
        licenseId: savedLicense.id,
        transactionType: 'activation',
        status: 'success',
        amount: amount, // Assuming amount is determined here or passed
        metadata: null, // No discountCode available in this context
      });
    }

    console.log(
      `[LICENSE ACTIVATION] Successfully activated and saved license ${licenseKey} for user ${customerId} in the database.`,
    );

    return {
      success: true,
      message: 'License activated and recorded successfully.',
      license: data.license_key,
    };
  } catch (dbError) {
    console.error(
      '[DATABASE ERROR] Failed to save license activation data:',
      dbError,
    );
    throw new Error(
      'Failed to save license activation details to the database.',
    );
  }
}
