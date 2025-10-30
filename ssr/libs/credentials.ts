'use server';
import { db } from '@/libs/db';
import bcryptjs from 'bcryptjs';

export const generatePasswordHash = async (password: string) => {
  // generates a random salt. A salt is a random value used in the hashing process to ensure
  // that even if two users have the same password, their hashed passwords will be different.
  // The 10 in the function call represents the cost factor, which determines how much
  // computational work is needed to compute the hash.
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(password, salt);
};

export const getUserFromDb = async (email: string) => {
  return await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email),
  });
};

export const getUserById = async (id: string) => {
  return await db.query.users.findMany({
    where: (users, { eq }) => eq(users.id, id),
  });
};
