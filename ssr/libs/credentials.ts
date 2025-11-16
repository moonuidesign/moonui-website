'use server';
import { db } from '@/libs/db';
import bcryptjs from 'bcryptjs';

export const generatePasswordHash = async (password: string) => {
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
