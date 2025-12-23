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

interface LemonSqueezyOrder {
  data: {
    attributes: {
      total: number;
      subtotal: number;
      tax: number;
      discount_total: number;
      currency: string;
    };
  };
}


async function getOrderTotal(
  orderId: number,
  planType: 'subscribe' | 'one_time',
): Promise<number> {

  const FALLBACK_PRICES: Record<string, number> = {
    subscribe: 15000,
    one_time: 50000,
  };

  try {
    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    if (!apiKey) {
      console.warn('[getOrderTotal] LEMONSQUEEZY_API_KEY not set, using fallback price');
      return FALLBACK_PRICES[planType] || 0;
    }

    const response = await fetch(
      `https://api.lemonsqueezy.com/v1/orders/${orderId}`,
      {
        headers: {
          Accept: 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json',
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );

    if (!response.ok) {
      console.error(
        `[getOrderTotal] Failed to fetch order ${orderId}: ${response.status} ${response.statusText}`,
      );
      console.warn(`[getOrderTotal] Using fallback price for ${planType}`);
      return FALLBACK_PRICES[planType] || 0;
    }

    const data = (await response.json()) as LemonSqueezyOrder;
    const total = data.data.attributes.total;
    console.log(`[getOrderTotal] Order ${orderId} total: ${total} cents`);
    return total;
  } catch (error) {
    console.error(`[getOrderTotal] Error fetching order ${orderId}:`, error);
    return FALLBACK_PRICES[planType] || 0;
  }
}

export async function activateLicense(
  licenseKey: string,
  customerId: string,
  tier: 'pro' | 'free',
  planType: 'subscribe' | 'one_time',
  orderId: number,
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

  const data = (await response.json()) as ResponseActivated;

  if (!response.ok || !data.activated) {
    const errorMessage = data.error || 'Failed to activate license via API.';
    console.error('Failed to activate Lemon Squeezy license:', errorMessage);
    throw new Error(errorMessage);
  }

  console.log(
    `[LICENSE ACTIVATION] API call successful for ${licenseKey}. Now updating database.`,
  );

  try {
    const activatedAtDate = new Date();
    const expiresAtDate = data.license_key.expires_at
      ? new Date(data.license_key.expires_at)
      : null;

    // Ambil harga langsung dari Lemon Squeezy Order API (dengan fallback)
    const amount = await getOrderTotal(orderId, planType);

    const [savedLicense] = await db
      .insert(licenses)
      .values({
        userId: customerId,
        licenseKey: data.license_key.key,
        status: data.license_key.status,
        planType: planType,
        tier: 'pro',
        activatedAt: activatedAtDate,
        expiresAt: expiresAtDate,
      })
      .onConflictDoUpdate({
        target: licenses.licenseKey,
        set: {
          userId: customerId,
          status: data.license_key.status,
          planType: planType,
          tier: 'pro',
          activatedAt: activatedAtDate,
          expiresAt: expiresAtDate,
          updatedAt: new Date(),
        },
      })
      .returning({ id: licenses.id });

    if (savedLicense) {
      await db.insert(licenseTransactions).values({
        userId: customerId,
        licenseId: savedLicense.id,
        transactionType: 'activation',
        status: 'success',
        amount: amount,
        metadata: { orderId },
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
