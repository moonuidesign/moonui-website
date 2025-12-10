import { db } from '@/libs/drizzle';
import {
  accounts,
  categoryComponents,
  categoryDesigns,
  categoryGradients,
  categoryTemplates,
  contentComponents,
  contentDesigns,
  contentGradients,
  contentTemplates,
  licenses,
  licenseTransactions,
  newsletterSubscribers,
  sessions,
  users,
} from './migration/schema';

async function seed() {
  console.log('🚀 Memulai Seeding Lengkap (Super Admin, Admin, User)...');

  try {
    // =================================================================
    // 1. BERSIHKAN DATABASE (Reset Total)
    // =================================================================
    console.log('🗑️  Menghapus data lama...');

    // Hapus tabel child
    await db.delete(licenseTransactions);
    await db.delete(licenses);
    await db.delete(contentTemplates);
    await db.delete(contentComponents);
    await db.delete(contentGradients);
    await db.delete(contentDesigns);

    // Hapus tabel parent
    await db.delete(categoryTemplates);
    await db.delete(categoryComponents);
    await db.delete(categoryGradients);
    await db.delete(categoryDesigns);

    // Hapus user
    await db.delete(accounts);
    await db.delete(sessions);
    await db.delete(newsletterSubscribers);
    await db.delete(users);

    console.log('✅ Database bersih.');

    // =================================================================
    // 2. BUAT USERS (3 Tipe Role)
    // =================================================================
    console.log('👥 Membuat Users...');

    // A. SUPER ADMIN (Pemilik Aset Utama)
    const [superAdmin] = await db
      .insert(users)
      .values({
        name: 'The Boss (Super Admin)',
        email: 'super@moonui.com',
        image: 'https://github.com/shadcn.png',
        roleUser: 'superadmin',
        emailVerified: new Date(),
      })
      .returning();

    // B. ADMIN (Staff Pengelola)
    const [adminStaff] = await db
      .insert(users)
      .values({
        name: 'Alex (Staff Admin)',
        email: 'alex@moonui.com',
        image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36',
        roleUser: 'admin',
        emailVerified: new Date(),
      })
      .returning();

    // C. USER PRO (Customer Berbayar)
    const [userPro] = await db
      .insert(users)
      .values({
        name: 'Sarah (Pro User)',
        email: 'sarah@client.com',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
        roleUser: 'user',
        emailVerified: new Date(),
      })
      .returning();

    // D. USER FREE (Customer Gratisan)
    const [userFree] = await db
      .insert(users)
      .values({
        name: 'John (Free User)',
        email: 'john@gmail.com',
        roleUser: 'user', // User biasa
        emailVerified: new Date(),
      })
      .returning();

    console.log(`✅ Users Created: 
      - Super Admin ID: ${superAdmin.id}
      - Admin Staff ID: ${adminStaff.id}
      - User Pro ID: ${userPro.id}
      - User Free ID: ${userFree.id}
    `);

    // =================================================================
    // 3. BUAT KATEGORI (Dimiliki oleh Super Admin & Admin)
    // =================================================================
    console.log('📂 Membuat Kategori...');

    // Kategori Official (Punya Super Admin)
    const [catDash] = await db
      .insert(categoryTemplates)
      .values({
        name: 'Official Dashboards',
        description: 'Template resmi MoonUI',
        userId: superAdmin.id,
      })
      .returning();

    // Kategori Komunitas/Blog (Punya Admin Staff)
    const [catCommunity] = await db
      .insert(categoryDesigns)
      .values({
        name: 'Community Designs',
        description: 'Desain kurasi komunitas',
        userId: adminStaff.id, // <--- Dimiliki oleh Admin biasa
      })
      .returning();

    console.log('✅ Kategori selesai.');

    // =================================================================
    // 4. BUAT KONTEN (Aset Digital)
    // =================================================================
    console.log('📝 Membuat Konten Aset...');

    // A. Konten Premium (Milik Super Admin)
    await db.insert(contentTemplates).values({
      title: 'MoonUI Pro Dashboard',
      slug: { current: 'moon-pro-dash' },
      description: 'Dashboard premium full fitur',
      assetUrl: { file: 'https://cdn.moonui.com/dash-pro.zip' },
      urlPreview: 'https://moonui.com/preview/pro',
      typeContent: 'template',
      linkDonwload: 'https://moonui.com/dl/pro',
      tier: 'pro_plus', // Hanya untuk user berbayar
      platform: 'web',
      statusContent: 'published',
      userId: superAdmin.id,
      categoryTemplatesId: catDash.id,
    });

    // B. Konten Free (Milik Super Admin)
    await db.insert(contentTemplates).values({
      title: 'Simple Landing Page',
      slug: { current: 'simple-landing' },
      description: 'Landing page gratis',
      assetUrl: { file: 'https://cdn.moonui.com/free.zip' },
      urlPreview: 'https://moonui.com/preview/free',
      typeContent: 'template',
      linkDonwload: 'https://moonui.com/dl/free',
      tier: 'free', // Bisa diakses User Free
      platform: 'web',
      statusContent: 'published',
      userId: superAdmin.id,
      categoryTemplatesId: catDash.id,
    });

    // C. Konten Design (Milik Admin Staff)
    await db.insert(contentDesigns).values({
      title: 'Figma Community Kit',
      slug: { current: 'figma-kit' },
      description: 'Kit desain dikelola staff',
      imageUrl: 'https://example.com/figma.png',
      linkDownload: 'https://figma.com/community/file/123',
      tier: 'free',
      number: 1,
      statusContent: 'published',
      userId: adminStaff.id, // <--- Dibuat oleh Admin Staff
      categoryDesignsId: catCommunity.id,
    });

    console.log('✅ Konten selesai.');

    // =================================================================
    // 5. SIMULASI TRANSAKSI & LISENSI (Hanya User Customer)
    // =================================================================
    console.log('💳 Menyiapkan Data User Customer (Lisensi)...');

    // Skenario 1: User Pro MEMBELI Lisensi
    const [licensePro] = await db
      .insert(licenses)
      .values({
        userId: userPro.id, // Lisensi milik Sarah (User Pro)
        licenseKey: 'MOON-PRO-USER-SARAH-2025',
        status: 'active',
        planType: 'subscribe',
        tier: 'pro_plus',
        activatedAt: new Date(),
        expiresAt: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1),
        ),
      })
      .returning();

    // Mencatat Transaksi Pembelian Sarah
    await db.insert(licenseTransactions).values({
      userId: userPro.id,
      licenseId: licensePro.id,
      transactionType: 'activation', // Transaksi Pembelian
      amount: 299000, // Rp 299.000
      status: 'success',
      metadata: { method: 'credit_card', last4: '4242' },
    });

    // Skenario 2: User Free (John) - Tidak punya lisensi aktif
    // Kita tidak insert data ke tabel licenses untuk John,
    // atau bisa insert status 'expired' jika dia mantan user pro.

    console.log('✅ Lisensi & Transaksi User selesai.');
    console.log('🎉 SEEDING LENGKAP SELESAI!');
  } catch (error) {
    console.error('❌ FATAL ERROR:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seed();
