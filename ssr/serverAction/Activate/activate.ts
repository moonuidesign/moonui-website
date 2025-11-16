// serverAction/license/activate.ts

'use server';

// INI ADALAH FUNGSI PLACEHOLDER
// Ganti dengan logika panggilan API Lemon Squeezy Anda yang sebenarnya
export async function activateLicense(
  licenseKey: string,
  customerEmail: string,
  customerId: string,
) {
  console.log(
    `[LICENSE ACTIVATION] Activating license ${licenseKey} for user ${customerId} (${customerEmail}).`,
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
        instance_name: `User-${customerId}`, // atau nama unik lainnya
      }),
    },
  );

  const data = await response.json();

  if (!response.ok || !data.activated) {
    console.error('Failed to activate Lemon Squeezy license:', data.error);
    throw new Error(data.error || 'Failed to activate license.');
  }

  console.log(`License ${licenseKey} successfully activated.`);

  return { success: true };
}
