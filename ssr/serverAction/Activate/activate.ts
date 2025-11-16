// serverAction/license/activate.ts

'use server';

interface ResponseActivated {
  activated: true;
  error: null;
  license_key: {
    id: number;
    status: string;
    key: string;
    activation_limit: number;
    activation_usage: number;
    created_at: Date;
    expires_at: null;
    test_mode: true;
  };
  instance: {
    id: '1c4e67f7-284f-496b-94a7-4c4da7570fad';
    name: 'User-fajarfernandi123123@gmail.com';
    created_at: '2025-11-16T11:37:54.000000Z';
  };
  meta: {
    store_id: 213409;
    order_id: 6839816;
    order_item_id: 6780789;
    variant_id: 1090943;
    variant_name: 'Default';
    product_id: 693335;
    product_name: 'dadad';
    customer_id: 7150152;
    customer_name: 'Fajar Fernandi';
    customer_email: 'fajarfernandi123123@gmail.com';
  };
}
// INI ADALAH FUNGSI PLACEHOLDER
// Ganti dengan logika panggilan API Lemon Squeezy Anda yang sebenarnya
export async function activateLicense(
  licenseKey: string,
  customerEmail: string,
  customerId: string,
) {
  console.log(
    `[LICENSE ACTIVATION] Attempting to activate license ${licenseKey} for user ${userId}.`,
  );

  // Langkah 1: Panggil API Lemon Squeezy untuk mengaktifkan lisensi
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
        // Gunakan User ID sebagai nama instansi untuk memastikan keunikan
        instance_name: `User-${userId}`,
      }),
    },
  );

  const data: LemonSqueezyActivationResponse = await response.json();

  // Jika aktivasi di Lemon Squeezy gagal, hentikan proses dan lempar error
  if (!response.ok || !data.activated) {
    const errorMessage = data.error || 'Failed to activate license via API.';
    console.error('Failed to activate Lemon Squeezy license:', errorMessage);
    throw new Error(errorMessage);
  }

  console.log(
    `[LICENSE ACTIVATION] API call successful for ${licenseKey}. Now updating database.`,
  );

  try {
    // Langkah 2: Simpan atau perbarui data lisensi di database Anda
    // Menggunakan `onConflictDoUpdate` (upsert) untuk menangani kasus jika lisensi
    // sudah ada di DB (misalnya, dibuat saat pembelian) tetapi belum aktif.

    const activatedAtDate = new Date(data.license_key.activated_at);
    // Tangani jika expires_at bisa null (untuk lisensi seumur hidup)
    const expiresAtDate = data.license_key.expires_at
      ? new Date(data.license_key.expires_at)
      : null;

    await db
      .insert(licenses)
      .values({
        userId: userId,
        licenseKey: data.license_key.key,
        status: data.license_key.status,
        activatedAt: activatedAtDate,
        expiresAt: expiresAtDate,
        // Anda bisa menambahkan kolom lain seperti `lemonSqueezyId` jika diperlukan
        // lemonSqueezyId: data.license_key.id
      })
      .onConflictDoUpdate({
        // Tentukan kolom mana yang menjadi target konflik (unik)
        target: licenses.licenseKey,
        // Tentukan kolom mana yang akan diperbarui jika terjadi konflik
        set: {
          userId: userId,
          status: data.license_key.status,
          activatedAt: activatedAtDate,
          expiresAt: expiresAtDate,
          updatedAt: new Date(), // Selalu perbarui timestamp updatedAt
        },
      });

    console.log(
      `[LICENSE ACTIVATION] Successfully activated and saved license ${licenseKey} for user ${userId} in the database.`,
    );

    // Anda bisa mengembalikan data yang relevan jika diperlukan
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
