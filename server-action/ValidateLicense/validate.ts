'use server';
import { ResponseAction } from '@/types/response-action';

// Kita extend interface bawaan Lemon Squeezy dengan properti custom aplikasi kita
export interface LemonSqueezyValidationResponse {
  valid: boolean;
  error: string | null;
  license_key: {
    id: number;
    status: string;
    key: string;
    expires_at: string | null;
    activation_limit: number;
    activation_usage: number;
  };
  instance: number | string | null;
  meta: {
    store_id: number;
    order_id: number;
    order_item_id: number;
    product_id: number;
    product_name: string;
    variant_id: number;
    variant_name: string;
    customer_id: number;
    customer_name: string;
    customer_email: string;
  };
  // Properti tambahan untuk logic aplikasi (opsional di response asli, tapi kita inject)
  app_tier?: 'pro' | 'free';
  app_plan_type?: 'subscribe' | 'one_time';
}

export async function validateLicenseKey(
  licenseKey: string,
): Promise<ResponseAction<LemonSqueezyValidationResponse>> {
  try {
    const response = await fetch(
      'https://api.lemonsqueezy.com/v1/licenses/validate',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          license_key: licenseKey,
        }),
        cache: 'no-store', // Pastikan tidak di-cache oleh Next.js
      },
    );

    const data: LemonSqueezyValidationResponse = await response.json();
    console.log(data);
    // 1. Validasi Basic dari API
    if (!response.ok || !data.valid) {
      return {
        success: false,
        code: response.status,
        message: data.error || 'Invalid license key.',
      };
    }

    const { status, activation_usage, activation_limit } = data.license_key;

    // ======================================================================
    // 2. Validasi Store, Product & Variant dengan Pesan Spesifik
    // ======================================================================
    const EXPECTED_STORE_ID = 213520;
    const EXPECTED_PRODUCT_ID = 632985;

    // Mapping Variant ID ke Tier dan Plan Type
    // - 993311: Pro (Subscription/Yearly)
    // - 993285: Pro (Subscription/Monthly)
    // - 993308: Pro (One-Time/Lifetime)
    const VARIANT_CONFIG: Record<
      number,
      { tier: 'pro'; planType: 'subscribe' | 'one_time'; name: string }
    > = {
      993285: { tier: 'pro', planType: 'subscribe', name: 'Pro (Yearly)' },
      993311: { tier: 'pro', planType: 'subscribe', name: 'Pro (Monthly)' },
      993308: { tier: 'pro', planType: 'one_time', name: 'Pro (Lifetime)' },
    };

    const EXPECTED_VARIANT_IDS = Object.keys(VARIANT_CONFIG).map(Number);

    // Validasi Store, Product & Variant sekaligus
    const isValidStore = data.meta.store_id === EXPECTED_STORE_ID;
    const isValidProduct = data.meta.product_id === EXPECTED_PRODUCT_ID;
    const isValidVariant = EXPECTED_VARIANT_IDS.includes(data.meta.variant_id);

    if (!isValidStore || !isValidProduct || !isValidVariant) {
      return {
        success: false,
        code: 403,
        message: 'License key ini tidak valid untuk MoonUI Pro. Pastikan Anda menggunakan lisensi yang dibeli dari MoonUI Design.',
      };
    }

    const variantConfig = VARIANT_CONFIG[data.meta.variant_id];

    // ======================================================================
    // 3. Validasi Status & Limit Penggunaan
    // ======================================================================
    if (status !== 'active' && status !== 'inactive') {
      return {
        success: false,
        code: 403,
        message: `License status is "${status}". Only active or unused licenses can be activated.`,
      };
    }

    // Cek apakah limit aktivasi sudah penuh
    if (activation_limit !== null && activation_usage >= activation_limit) {
      return {
        success: false,
        code: 403,
        message: `This license key has reached its activation limit of ${activation_limit}. It has already been used.`,
      };
    }

    // ======================================================================
    // 4. Inject Tier & Plan Type berdasarkan Variant Config
    // ======================================================================
    data.app_tier = variantConfig.tier;
    data.app_plan_type = variantConfig.planType;

    // Pesan sukses yang informatif berdasarkan plan type
    const successMessage = variantConfig.planType === 'one_time'
      ? `License valid! Activating ${variantConfig.name} - Lifetime access.`
      : `License valid! Activating ${variantConfig.name} subscription.`;

    return {
      success: true,
      code: 200,
      message: successMessage,
      data,
    };
  } catch (error) {
    console.error('Lemon Squeezy API Error:', error);
    return {
      success: false,
      code: 500,
      message: 'Failed to validate license key due to server error.',
    };
  }
}
