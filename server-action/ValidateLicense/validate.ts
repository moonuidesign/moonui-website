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

    // --- Validation Logic for Store and Product ---
    
    // 1. Validate Store ID (Baggy Studio)
    // Replace with your actual Lemon Squeezy Store ID. 
    // You can find this in your Lemon Squeezy Dashboard URL or API responses.
    const EXPECTED_STORE_ID = 115386; 
    
    if (data.meta.store_id !== EXPECTED_STORE_ID) {
      return {
        success: false,
        code: 403,
        message: 'Invalid license: This license does not belong to Baggy Studio.',
      };
    }

    // 2. Validate Product/Variant for "Pro" or "Pro Plus"
    const variantName = data.meta.variant_name?.toLowerCase() || '';
    const productName = data.meta.product_name?.toLowerCase() || '';
    
    // Define valid keywords for your tiers
    const isPro = variantName.includes('pro') || productName.includes('pro');
    const isProPlus = variantName.includes('pro plus') || variantName.includes('pro+') || variantName.includes('lifetime') || variantName.includes('unlimited') || productName.includes('pro plus');

    // Check if it matches either valid tier
    if (!isPro && !isProPlus) {
       return {
        success: false,
        code: 403,
        message: `Invalid license tier: Your license is for '${data.meta.variant_name}', but only 'Pro' or 'Pro Plus' licenses are accepted.`,
      };
    }

    // --- End Validation Logic ---

    // Mapping Logic based on Variant Name or ID (Mock implementation for now)
    // You should inspect data.meta.variant_name or data.meta.product_name
    let tier: 'pro' | 'pro_plus' = 'pro';
    let planType: 'subscribe' | 'one_time' = 'subscribe';

    if (variantName.includes('lifetime') || variantName.includes('unlimited') || variantName.includes('pro plus') || variantName.includes('pro+')) {
      tier = 'pro_plus';
      planType = 'one_time';
    } else {
      // Default to subscribe pro
      tier = 'pro';
      planType = 'subscribe';
    }

    if (status === 'active') {
      return {
        success: false,
        code: 403,
        message: 'Sudah diaktifkan',
      };
    }

    // Attach inferred types to the returned data structure if needed
    // For now we just return the standard response but we will use this logic in verify/activate too
    // Actually, validateLicenseKey returns LemonSqueezyValidationResponse.
    // We should probably extend the return type or just handle this logic in activateLicense.
    // For simplicity, let's keep it here but we need to pass it out. 
    // Since we can't easily change the return type without breaking other things, 
    // let's just make sure we capture this logic in the activation step.
    
    // Correction: We will implement this logic in `activateLicense` instead 
    // where we actually write to the DB.
    
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
