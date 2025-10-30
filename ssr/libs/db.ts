// Lokasi: src/libs/db.ts

import * as schema from '../db/migration/schema';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, { schema });

/**
 * Mengambil data pengguna lengkap dari database berdasarkan email.
 * @param email - Alamat email pengguna.
 * @returns Objek user atau null jika tidak ditemukan.
 */
export const getUserFromDb = async (email: string) => {
  try {
    // PERBAIKAN: Menggunakan schema.users untuk konsistensi.
    const user = await db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });

    // PENJELASAN: Mengembalikan null lebih aman dalam alur otentikasi
    // daripada melempar error yang bisa menghentikan proses jika tidak ditangani.
    return user || null;
  } catch (error) {
    console.error('Database Error: Gagal mengambil data pengguna.', error);
    // Melempar error di sini jika terjadi kesalahan koneksi database, dll.
    throw new Error('Terjadi kesalahan saat berkomunikasi dengan database.');
  }
};
