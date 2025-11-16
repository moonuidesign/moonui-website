'use server';
import { ResponseAction } from '@/types/response-action';

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
      },
    );

    const data: LemonSqueezyValidationResponse = await response.json();

    if (!response.ok || !data.valid) {
      return {
        success: false,
        code: response.status,
        message: data.error || 'Invalid license key.',
      };
    }

    const { status } = data.license_key;

    if (status === 'active') {
      return {
        success: false,
        code: 403,
        message: 'Sudah diaktifkan',
      };
    }

    console.log(data);
    return {
      success: true,
      code: 200,
      message: 'License key is valid.',
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
