'use server';
import * as schema from '../db/migration';
import { eq } from 'drizzle-orm';

import bcryptjs from 'bcryptjs';
import { db } from './drizzle';

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

export const generatePasswordHash = async (password: string) => {
  // generates a random salt. A salt is a random value used in the hashing process to ensure
  // that even if two users have the same password, their hashed passwords will be different.
  // The 10 in the function call represents the cost factor, which determines how much
  // computational work is needed to compute the hash.
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(password, salt);
};
