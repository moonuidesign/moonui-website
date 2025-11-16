//
// file: libs/signature.ts
// Keterangan: FINAL. Menghilangkan ketergantungan pada `Buffer` untuk encoding/decoding
// dan menggunakan Web API native (atob, btoa) untuk kompatibilitas universal.
//

const SECRET_KEY =
  process.env.SIGNATURE_SECRET || 'your-secret-key-change-this';

if (
  process.env.NODE_ENV === 'production' &&
  SECRET_KEY === 'your-secret-key-change-this'
) {
  console.warn(
    'WARNING: The SIGNATURE_SECRET is not set. Please set it in your environment variables for security.',
  );
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  expiresAt: number;
}

// --- Helper Functions Universal ---

async function getHmacKey(secret: string): Promise<CryptoKey> {
  const keyBuffer = new TextEncoder().encode(secret);
  return crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ==================================================================
// === PERBAIKAN: Mengganti Buffer.from dengan Web API native ===
// ==================================================================
function base64UrlEncode(str: string): string {
  // btoa() meng-encode ke base64 standar
  // Kemudian kita ganti karakter yang tidak aman untuk URL
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  // Tambahkan kembali padding '=' yang mungkin dihilangkan
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  // atob() men-decode dari base64 standar
  return atob(str);
}
// ==================================================================

// --- FUNGSI UTAMA (ASYNC) ---

export async function generateResetPasswordSignature(
  email: string,
  otp: string,
  expiresAt: Date,
): Promise<string> {
  const payload: ResetPasswordPayload = {
    email,
    otp,
    expiresAt: expiresAt.getTime(),
  };

  const payloadString = JSON.stringify(payload);
  // Gunakan helper baru kita
  const encodedPayload = base64UrlEncode(payloadString);

  const key = await getHmacKey(SECRET_KEY);
  const dataBuffer = new TextEncoder().encode(encodedPayload);
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, dataBuffer);
  const signature = bufferToHex(signatureBuffer);

  return `${encodedPayload}.${signature}`;
}

export async function verifyResetPasswordSignature(
  signatureString: string,
): Promise<{
  valid: boolean;
  expired: boolean;
  payload?: ResetPasswordPayload;
}> {
  try {
    const [encodedPayload, signatureHex] = signatureString.split('.');
    if (!encodedPayload || !signatureHex) {
      return { valid: false, expired: false };
    }

    const key = await getHmacKey(SECRET_KEY);
    const dataBuffer = new TextEncoder().encode(encodedPayload);

    const signatureBuffer = new Uint8Array(
      (signatureHex.match(/.{1,2}/g) || []).map((byte) => parseInt(byte, 16)),
    );

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBuffer,
      dataBuffer,
    );

    if (!isValid) {
      return { valid: false, expired: false, payload: undefined }; // Eksplisit undefined
    }

    // Gunakan helper baru kita untuk decoding
    const payloadString = base64UrlDecode(encodedPayload);
    const payload = JSON.parse(payloadString) as ResetPasswordPayload;

    if (Date.now() > payload.expiresAt) {
      return { valid: true, expired: true, payload };
    }

    return { valid: true, expired: false, payload };
  } catch (error) {
    console.error('Error verifying signature:', error);
    return { valid: false, expired: false, payload: undefined };
  }
}

export function extractDataFromSignature(signatureString: string): {
  success: boolean;
  data?: ResetPasswordPayload;
} {
  try {
    const [encodedPayload] = signatureString.split('.');
    if (!encodedPayload) {
      return { success: false };
    }

    // Gunakan helper baru kita untuk decoding
    const payloadString = base64UrlDecode(encodedPayload);
    const data = JSON.parse(payloadString) as ResetPasswordPayload;

    // Tambahkan pengecekan apakah data benar-benar objek
    if (typeof data !== 'object' || data === null) {
      return { success: false };
    }

    return { success: true, data };
  } catch {
    return { success: false };
  }
}

// ==================================================================
// === BAGIAN BARU: KHUSUS UNTUK VERIFIKASI LISENSI ===
// ==================================================================

export interface LicenseVerificationPayload {
  email: string;
  otp: string;
  licenseKey: string; // <-- Kunci lisensi ditambahkan di sini
  expiresAt: number;
}

/**
 * Menghasilkan signature yang mengikat email, OTP, dan kunci lisensi.
 */
export async function generateLicenseSignature(
  email: string,
  otp: string,
  licenseKey: string, // <-- Parameter baru
  expiresAt: Date,
): Promise<string> {
  const payload: LicenseVerificationPayload = {
    email,
    otp,
    licenseKey,
    expiresAt: expiresAt.getTime(),
  };

  const payloadString = JSON.stringify(payload);
  const encodedPayload = base64UrlEncode(payloadString);

  const key = await getHmacKey(SECRET_KEY);
  const dataBuffer = new TextEncoder().encode(encodedPayload);
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, dataBuffer);
  const signature = bufferToHex(signatureBuffer);

  return `${encodedPayload}.${signature}`;
}

/**
 * Memverifikasi signature yang dibuat untuk verifikasi lisensi.
 */
export async function verifyLicenseSignature(signatureString: string): Promise<{
  valid: boolean;
  expired: boolean;
  payload?: LicenseVerificationPayload;
}> {
  try {
    const [encodedPayload, signatureHex] = signatureString.split('.');
    if (!encodedPayload || !signatureHex) {
      return { valid: false, expired: false };
    }

    const key = await getHmacKey(SECRET_KEY);
    const dataBuffer = new TextEncoder().encode(encodedPayload);

    const signatureBuffer = new Uint8Array(
      (signatureHex.match(/.{1,2}/g) || []).map((byte) => parseInt(byte, 16)),
    );

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBuffer,
      dataBuffer,
    );

    if (!isValid) {
      return { valid: false, expired: false, payload: undefined };
    }

    const payloadString = base64UrlDecode(encodedPayload);
    const payload = JSON.parse(payloadString) as LicenseVerificationPayload;

    if (Date.now() > payload.expiresAt) {
      return { valid: true, expired: true, payload };
    }

    return { valid: true, expired: false, payload };
  } catch (error) {
    console.error('Error verifying license signature:', error);
    return { valid: false, expired: false, payload: undefined };
  }
}
