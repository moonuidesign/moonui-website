import { db } from '@/libs/drizzle';
import bcrypt from 'bcryptjs';
import { users } from '@schema';

async function seed() {
  console.log('🚀 Starting Extensive Database Seeding (MoonUI Edition)...');

  try {
    const hashedPassword = await bcrypt.hash('password123', 10);
    await db
      .insert(users)
      .values({
        name: 'Super Admin',
        email: 'super@moonui.com',
        password: hashedPassword,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=super',
        roleUser: 'superadmin',
        emailVerified: new Date(),
      })
      .returning();

    await db
      .insert(users)
      .values({
        name: 'Admin Staff',
        email: 'admin@moonui.com',
        password: hashedPassword,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        roleUser: 'admin',
        emailVerified: new Date(),
      })
      .returning();
    console.log('👥 Creating Regular Users...');
    console.log('✅ Users created with password: password123');
    console.log('✅ Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Failed:', error);
    process.exit(1);
  }
}

seed();
