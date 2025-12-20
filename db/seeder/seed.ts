// import { db } from '@/libs/drizzle';
// import bcrypt from 'bcryptjs';
// import {
//   accounts,
//   categoryComponents,
//   categoryDesigns,
//   categoryGradients,
//   categoryTemplates,
//   contentComponents,
//   contentDesigns,
//   contentGradients,
//   contentTemplates,
//   licenses,
//   licenseTransactions,
//   newsletterSubscribers,
//   sessions,
//   users,
// } from '@schema';

// async function seed() {
//   console.log('🚀 Starting Extensive Database Seeding (MoonUI Edition)...');

//   try {
//     // =================================================================
//     // 1. CLEANUP
//     // =================================================================
//     console.log('🗑️  Cleaning up old data...');
//     // Delete in reverse order of dependencies to avoid foreign key constraints
//     await db.delete(licenseTransactions);
//     await db.delete(licenses);
//     await db.delete(contentTemplates);
//     await db.delete(contentComponents);
//     await db.delete(contentGradients);
//     await db.delete(contentDesigns);
//     await db.delete(categoryTemplates);
//     await db.delete(categoryComponents);
//     await db.delete(categoryGradients);
//     await db.delete(categoryDesigns);
//     await db.delete(accounts);
//     await db.delete(sessions);
//     await db.delete(newsletterSubscribers);
//     await db.delete(users);
//     console.log('✅ Database cleaned.');

//     // =================================================================
//     // 2. USERS
//     // =================================================================
//     console.log('👥 Creating Users...');

//     const hashedPassword = await bcrypt.hash('password123', 10);

//     const [superAdmin] = await db
//       .insert(users)
//       .values({
//         name: 'Super Admin',
//         email: 'super@moonui.com',
//         password: hashedPassword,
//         image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=super',
//         roleUser: 'superadmin',
//         emailVerified: new Date(),
//       })
//       .returning();

//     const [admin] = await db
//       .insert(users)
//       .values({
//         name: 'Admin Staff',
//         email: 'admin@moonui.com',
//         password: hashedPassword,
//         image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
//         roleUser: 'admin',
//         emailVerified: new Date(),
//       })
//       .returning();

//     const [userPro] = await db
//       .insert(users)
//       .values({
//         name: 'Pro User',
//         email: 'pro@client.com',
//         password: hashedPassword,
//         image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pro',
//         roleUser: 'user',
//         emailVerified: new Date(),
//       })
//       .returning();

//     const [userFree] = await db
//       .insert(users)
//       .values({
//         name: 'Free User',
//         email: 'free@gmail.com',
//         password: hashedPassword,
//         image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=free',
//         roleUser: 'user',
//         emailVerified: new Date(),
//       })
//       .returning();

//     console.log('✅ Users created with password: password123');

//     // =================================================================
//     // 3. CATEGORIES & SUB-CATEGORIES
//     // =================================================================
//     console.log('📂 Creating Categories & Sub-categories...');

//     const createCategories = async (
//       table: any,
//       names: string[],
//       subNames: string[],
//       userId: string,
//       type: string
//     ) => {
//       const parents = [];
//       for (const name of names) {
//         const [cat] = await db
//           .insert(table)
//           .values({
//             name,
//             description: `Curated collection of ${name.toLowerCase()} ${type}.`,
//             userId,
//           })
//           .returning();
//         parents.push(cat);
//       }

//       // Add sub-categories to ALL parents
//       for (const parent of parents) {
//         const selectedSubs = subNames
//           .sort(() => 0.5 - Math.random())
//           .slice(0, 4); // Pick random 4 subcategories
//         for (const subName of selectedSubs) {
//           await db.insert(table).values({
//             name: `${subName}`,
//             description: `${subName} style for ${parent.name}.`,
//             parentId: parent.id,
//             userId,
//           });
//         }
//       }
//       return parents;
//     };

//     // TEMPLATE CATEGORIES
//     const templateCats = [
//       'Dashboards',
//       'Landing Pages',
//       'E-commerce',
//       'Portfolios',
//       'Blogs',
//       'Marketing',
//       'SaaS Apps',
//     ];
//     const templateSubs = [
//       'Minimal',
//       'Dark Mode',
//       'Corporate',
//       'Creative',
//       'SaaS',
//       'Mobile First',
//       'Web3',
//       'AI Powered',
//     ];
//     const createdTemplateCats = await createCategories(
//       categoryTemplates,
//       templateCats,
//       templateSubs,
//       superAdmin.id,
//       'templates'
//     );

//     // COMPONENT CATEGORIES
//     const componentCats = [
//       'Inputs',
//       'Buttons',
//       'Cards',
//       'Navigation',
//       'Modals',
//       'Forms',
//       'Data Display',
//       'Feedback',
//     ];
//     const componentSubs = [
//       'React',
//       'Vue',
//       'Accessible',
//       'Animated',
//       'Glassmorphism',
//       'Neumorphism',
//       'Radix UI',
//       'Shadcn',
//     ];
//     const createdComponentCats = await createCategories(
//       categoryComponents,
//       componentCats,
//       componentSubs,
//       admin.id,
//       'components'
//     );

//     // DESIGN CATEGORIES
//     const designCats = ['UI Kits', 'Icon Sets', 'Wireframes', 'Mockups', 'Illustrations'];
//     const designSubs = ['Figma', 'Sketch', 'Adobe XD', 'Vector', '3D', 'Abstract'];
//     const createdDesignCats = await createCategories(
//       categoryDesigns,
//       designCats,
//       designSubs,
//       admin.id,
//       'design resources'
//     );

//     // GRADIENT CATEGORIES
//     const gradientCats = ['Warm', 'Cool', 'Pastel', 'Neon', 'Dark', 'Nature'];
//     const gradientSubs = ['Linear', 'Radial', 'Mesh', 'Conic', 'Noise', 'Holographic'];
//     const createdGradientCats = await createCategories(
//       categoryGradients,
//       gradientCats,
//       gradientSubs,
//       superAdmin.id,
//       'gradients'
//     );

//     console.log('✅ Categories created.');

//     // =================================================================
//     // 4. CONTENT (Assets)
//     // =================================================================
//     console.log('📝 Creating Content Assets...');

//     // Helper: Templates (Figma & Framer)
//     const createTemplates = async (count: number, cats: any[]) => {
//         for (let i = 1; i <= count; i++) {
//             const cat = cats[Math.floor(Math.random() * cats.length)];
//             const tool = i % 2 === 0 ? 'framer' : 'figma';
//             const isPro = i % 3 === 0;

//             await db.insert(contentTemplates).values({
//                 title: `${tool === 'figma' ? 'Figma' : 'Framer'} ${cat.name} Template v${i}`,
//                 slug: { current: `${tool}-template-${i}-${Date.now()}` },
//                 description: `A high-quality, responsive ${tool} template for ${cat.name}. Includes 15+ pages and dark mode.`,
//                 assetUrl: [{ file: `https://moonui.com/downloads/${tool}-template-${i}.zip`, type: 'zip' }], // JSONB array
//                 imagesUrl: [{ url: `https://placehold.co/1200x800/png?text=${tool}+Template+${i}`, type: 'preview' }], // JSONB array
//                 urlPreview: `https://moonui.com/preview/${tool}/${i}`,
//                 typeContent: tool,
//                 linkDonwload: `https://moonui.com/api/download/${i}`,
//                 urlBuyOneTime: isPro ? 'https://gumroad.com/l/moonui-template-pro' : null,
//                 tier: isPro ? 'pro_plus' : 'free',
//                 platform: 'web', // Although not in schema sometimes, safe to keep if interface allows
//                 statusContent: 'published',
//                 userId: superAdmin.id,
//                 categoryTemplatesId: cat.id,
//                 number: i,
//                 viewCount: Math.floor(Math.random() * 5000),
//                 downloadCount: Math.floor(Math.random() * 500),
//                 createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
//             });
//         }
//     };

//     // Helper: Components
//     const createComponents = async (count: number, cats: any[]) => {
//         const types = ['react', 'vue', 'html', 'figma'];

//         for (let i = 1; i <= count; i++) {
//             const cat = cats[Math.floor(Math.random() * cats.length)];
//             const type = types[Math.floor(Math.random() * types.length)];
//             const isPro = i % 4 === 0;

//             await db.insert(contentComponents).values({
//                 title: `Modern ${cat.name} ${i}`,
//                 slug: { current: `component-${i}-${Date.now()}` },
//                 imageUrl: `https://placehold.co/800x600/png?text=Component+${i}`,
//                 typeContent: type,
//                 copyComponentTextHTML: { code: `<div class="p-4 bg-white shadow rounded">Component ${i}</div>` },
//                 copyComponentTextPlain: { code: `// Component ${i} Source Code` },
//                 codeSnippets: {
//                     react: `export default function Component${i}() { return <div>Component ${i}</div> }`,
//                     vue: `<template><div>Component ${i}</div></template>`,
//                     angular: `@Component({ template: '<div>Component ${i}</div>' }) class Component${i} {}`,
//                     html: `<div>Component ${i}</div>`
//                 },
//                 urlBuyOneTime: isPro ? 'https://lemonsqueezy.com/checkout/buy/123' : null,
//                 tier: isPro ? 'pro' : 'free',
//                 statusContent: 'published',
//                 userId: admin.id,
//                 categoryComponentsId: cat.id,
//                 number: i,
//                 viewCount: Math.floor(Math.random() * 10000),
//                 copyCount: Math.floor(Math.random() * 2000),
//                 createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
//             });
//         }
//     };

//     // Helper: Designs
//     const createDesigns = async (count: number, cats: any[]) => {
//         for (let i = 1; i <= count; i++) {
//             const cat = cats[Math.floor(Math.random() * cats.length)];
//             const isPro = i % 2 === 0;

//             await db.insert(contentDesigns).values({
//                 title: `UI Kit Volume ${i} - ${cat.name}`,
//                 slug: { current: `design-kit-${i}-${Date.now()}` },
//                 description: `Comprehensive UI Kit for ${cat.name} with over 100+ elements.`,
//                 imagesUrl: [{ url: `https://placehold.co/1000x600/png?text=UI+Kit+${i}` }], // JSONB
//                 linkDownload: 'https://moonui.com/downloads/design-kit.fig',
//                 urlBuyOneTime: isPro ? 'https://gumroad.com/l/ui-kit-pro' : null,
//                 tier: isPro ? 'pro_plus' : 'free',
//                 statusContent: 'published',
//                 userId: admin.id,
//                 categoryDesignsId: cat.id,
//                 number: i,
//                 viewCount: Math.floor(Math.random() * 8000),
//                 downloadCount: Math.floor(Math.random() * 1000),
//                 createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
//             });
//         }
//     };

//     // Helper: Gradients
//     const createGradients = async (count: number, cats: any[]) => {
//         const types = ['linear', 'radial', 'conic'];
//         for (let i = 1; i <= count; i++) {
//             const cat = cats[Math.floor(Math.random() * cats.length)];
//             const gType = types[Math.floor(Math.random() * types.length)];
//             const isPro = i % 5 === 0;
//             const c1 = Math.floor(Math.random()*16777215).toString(16);
//             const c2 = Math.floor(Math.random()*16777215).toString(16);

//             await db.insert(contentGradients).values({
//                 name: `${cat.name} Mesh Gradient ${i}`,
//                 slug: { current: `gradient-${i}-${Date.now()}` },
//                 colors: [{ value: `#${c1}` }, { value: `#${c2}` }], // JSONB array of objects
//                 typeGradient: gType as any,
//                 image: `https://placehold.co/600x400/${c1}/${c2}?text=Gradient+${i}`,
//                 linkDownload: `https://moonui.com/download/gradient-${i}.png`,
//                 urlBuyOneTime: isPro ? 'https://moonui.com/buy/gradient-pack' : null,
//                 tier: isPro ? 'pro' : 'free',
//                 userId: superAdmin.id,
//                 categoryGradientsId: cat.id,
//                 number: i,
//                 downloadCount: Math.floor(Math.random() * 5000),
//                 createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
//             });
//         }
//     };

//     // Execute Generation
//     // 50 Templates (Mixed Figma/Framer)
//     await createTemplates(50, createdTemplateCats);

//     // 50 Components (React, Vue, etc)
//     await createComponents(50, createdComponentCats);

//     // 30 Designs (UI Kits)
//     await createDesigns(30, createdDesignCats);

//     // 40 Gradients
//     await createGradients(40, createdGradientCats);

//     console.log('✅ Content assets created.');

//     // =================================================================
//     // 5. LICENSES & TRANSACTIONS
//     // =================================================================
//     console.log('💳 Creating Licenses...');
//     const [license] = await db
//       .insert(licenses)
//       .values({
//         userId: userPro.id,
//         licenseKey: 'LICENSE-PRO-123',
//         status: 'active',
//         planType: 'subscribe',
//         tier: 'pro_plus',
//         activatedAt: new Date(),
//         expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
//       })
//       .returning();

//     await db.insert(licenseTransactions).values({
//       userId: userPro.id,
//       licenseId: license.id,
//       transactionType: 'activation',
//       amount: 49000,
//       status: 'success',
//       metadata: { method: 'stripe' },
//     });

//     // =================================================================
//     // 6. NEWSLETTER
//     // =================================================================
//     await db.insert(newsletterSubscribers).values([
//         { email: 'fan@moonui.com', isActive: true },
//         { email: 'subscriber@test.com', isActive: true },
//         { email: 'earlyaccess@moonui.com', isActive: false },
//     ]);

//     console.log('✅ Seeding Complete!');
//     process.exit(0);
//   } catch (error) {
//     console.error('❌ Seeding Failed:', error);
//     process.exit(1);
//   }
// }

// seed();
