import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { faker } from '@faker-js/faker';
import * as dotenv from 'dotenv';
import { eq, inArray, sql } from 'drizzle-orm';

// --- [PERBAIKAN] Impor semua tabel yang diperlukan, termasuk untuk ticketing & check-in ---
import {
  users,
  formOwned,
  registeredDomains,
  formHostnames,
  forms,
  formSections,
  formFields,
  submissions,
  submissionAnswers,
  eventOrders,
  orderItems, // Ditambahkan
  ticketTypes, // Ditambahkan
  participantTickets, // Ditambahkan
  eventDailyTokens, // Ditambahkan
  participantDailyCheckIns, // Ditambahkan
  organizerWallets,
  userBankAccounts,
  payoutRequests,
  certificateTemplates,
  generatedCertificates,
  subscriptionPlans,
  userSubscriptions,
  paymentHistory,
  prompts,
  promptVersions,
  evaluationAccessTokens,
} from './schema';

dotenv.config();

// --- KONFIGURASI & KONSTANTA ---
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('Variabel lingkungan DATABASE_URL belum diatur');
}
const PARTICIPANT_COUNT = 50;

// --- HELPERS ---
const log = {
  info: (message: string) => console.log(`\n🔵 ${message}`),
  success: (message: string) => console.log(`✅ ${message}`),
  warn: (message: string) => console.log(`🟠 ${message}`),
  error: (message: string) => console.error(`❌ ${message}`),
  step: (message: string) =>
    console.log(
      `\n\n======================================================\n${message}\n======================================================`,
    ),
  substep: (message: string) => console.log(`\n--- ${message} ---`),
};

const generateAnswerForField = (
  field: typeof schema.formFields.$inferSelect,
) => {
  const options = (field.options as { value: string; label: string }[])?.map(
    (o) => o.label,
  );
  switch (field.fieldType) {
    case 'text':
      return faker.lorem.words(5);
    case 'textarea':
      return faker.lorem.paragraph();
    case 'email':
      return faker.internet.email();
    case 'number':
      return faker.number.int({ min: 1, max: 100 }).toString();
    case 'contact':
      return faker.phone.number();
    case 'date':
      return faker.date.past().toISOString();
    case 'select':
      return faker.helpers.arrayElement(options || ['Option A']);
    case 'radio':
      return faker.helpers.arrayElement(options || ['Option B']);
    case 'checkbox':
      return JSON.stringify(
        faker.helpers.arrayElements(options || ['Option C'], {
          min: 1,
          max: options?.length || 1,
        }),
      );
    case 'image':
      return faker.image.url();
    case 'file':
      return `https://example.com/files/${faker.system.commonFileName('pdf')}`;
    case 'multiFile':
      return JSON.stringify([
        faker.image.url(),
        `https://example.com/files/${faker.system.commonFileName('docx')}`,
      ]);
    default:
      return '';
  }
};

// --- FUNGSI SEEDING UTAMA ---
const seedForUser = async (userId: string) => {
  log.info(
    `🌱 Memulai proses seeding SUPER LENGKAP untuk user ID: ${userId}...`,
  );

  const client = postgres(DATABASE_URL, { max: 1 });
  const db = drizzle(client, { schema });

  try {
    // LANGKAH 0: VALIDASI PENGGUNA TARGET
    log.step(`LANGKAH 0: VALIDASI PENGGUNA TARGET`);
    const mainOrganizer = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    if (!mainOrganizer) {
      throw new Error(`Pengguna dengan ID "${userId}" tidak ditemukan.`);
    }
    log.success(
      `Pengguna Organizer ditemukan: ${mainOrganizer.name} (${mainOrganizer.email})`,
    );

    // LANGKAH 1: PEMBERSIHAN DATA LAMA
    log.step(`LANGKAH 1: PEMBERSIHAN DATA LAMA SECARA MENYELURUH`);
    log.substep(`Menghapus data yang dimiliki oleh ${mainOrganizer.email}`);

    // Menghapus semua form dan data turunannya adalah cara paling aman
    // Drizzle akan menghapus secara berantai (cascade) sesuai definisi skema
    const userForms = await db
      .delete(forms)
      .where(eq(forms.authorId, userId))
      .returning({ id: forms.id });

    if (userForms.length > 0) {
      log.success(
        `${userForms.length} formulir lama dan semua data terkaitnya berhasil dihapus (via cascade).`,
      );
    } else {
      log.warn(`Tidak ada formulir lama yang ditemukan untuk pengguna ini.`);
    }

    // Menghapus sisa data yang mungkin tidak ter-cascade
    await db
      .delete(payoutRequests)
      .where(eq(payoutRequests.organizerId, userId));
    await db
      .delete(userBankAccounts)
      .where(eq(userBankAccounts.userId, userId));
    await db
      .delete(organizerWallets)
      .where(eq(organizerWallets.userId, userId));
    await db
      .delete(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId));
    await db.delete(paymentHistory).where(eq(paymentHistory.userId, userId));
    await db
      .delete(registeredDomains)
      .where(eq(registeredDomains.ownerId, userId));
    log.success(`Data keuangan & domain lama pengguna berhasil dihapus.`);

    // LANGKAH 2: PERSIAPAN DATA DASAR & PENGGUNA PENDUKUNG
    log.step(`LANGKAH 2: PERSIAPAN DATA DASAR & PENGGUNA PENDUKUNG`);

    await db
      .insert(subscriptionPlans)
      .values([
        {
          id: 'plan_free_001',
          name: 'Free',
          price: 0,
          billingCycle: 'monthly',
          features: { maxForms: 3 },
        },
        {
          id: 'plan_pro_001',
          name: 'Pro',
          price: 150000,
          billingCycle: 'monthly',
          features: {
            maxForms: null,
            customDomain: true,
            hasCertificate: true,
          },
        },
      ])
      .onConflictDoUpdate({
        target: subscriptionPlans.id,
        set: { name: sql`EXCLUDED.name`, price: sql`EXCLUDED.price` },
      });
    log.success('Memastikan plan langganan [Free, Pro] ada.');

    const [collaboratorUser] = await db
      .insert(users)
      .values({
        name: 'Alex Johnson (Editor)',
        email: `editor-${faker.string.alphanumeric(8)}@example.com`,
        emailVerified: new Date(),
      })
      .returning();
    const [validatorUser] = await db
      .insert(users)
      .values({
        name: 'Bob Williams (Validator)',
        email: `validator-${faker.string.alphanumeric(8)}@example.com`,
        emailVerified: new Date(),
      })
      .returning();
    log.success(
      `Dibuat pengguna pendukung: ${collaboratorUser.name} & ${validatorUser.name}`,
    );

    const participantUsersData = Array.from(
      { length: PARTICIPANT_COUNT },
      () => ({
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        emailVerified: new Date(),
      }),
    );
    const participantUsers = await db
      .insert(users)
      .values(participantUsersData)
      .onConflictDoNothing()
      .returning();
    log.success(
      `Dibuat ${participantUsers.length} pengguna peserta baru untuk disimulasikan.`,
    );

    // LANGKAH 3: SETUP KEUANGAN & LANGGANAN UNTUK ORGANIZER
    log.step(`LANGKAH 3: SETUP KEUANGAN & LANGGANAN UNTUK ORGANIZER`);
    const proPlan = await db.query.subscriptionPlans.findFirst({
      where: eq(subscriptionPlans.name, 'Pro'),
    });
    if (!proPlan) throw new Error("Subscription plan 'Pro' tidak ditemukan.");

    await db.insert(userSubscriptions).values({
      userId: mainOrganizer.id,
      planId: proPlan.id,
      status: 'active',
      currentPeriodStart: faker.date.past(),
      currentPeriodEnd: faker.date.future(),
    });
    await db
      .insert(organizerWallets)
      .values({ userId: mainOrganizer.id, balance: 2850000, currency: 'IDR' });
    const [bankBCA, bankMandiri] = await db
      .insert(userBankAccounts)
      .values([
        {
          userId: mainOrganizer.id,
          bankName: 'BCA',
          accountHolderName: mainOrganizer.name!,
          accountNumber: faker.finance.accountNumber(),
          isDefault: true,
        },
        {
          userId: mainOrganizer.id,
          bankName: 'Mandiri',
          accountHolderName: mainOrganizer.name!,
          accountNumber: faker.finance.accountNumber(),
          isDefault: false,
        },
      ])
      .returning();
    await db.insert(payoutRequests).values([
      {
        organizerId: mainOrganizer.id,
        amount: 1500000,
        status: 'completed',
        bankAccountId: bankBCA.id,
        processedAt: faker.date.past(),
      },
      {
        organizerId: mainOrganizer.id,
        amount: 750000,
        status: 'pending',
        bankAccountId: bankBCA.id,
      },
    ]);
    log.success('Setup keuangan lengkap (Langganan, Dompet, Bank, Penarikan).');

    // LANGKAH 4: SETUP DOMAIN KUSTOM
    log.step(`LANGKAH 4: SETUP DOMAIN KUSTOM`);
    const randomString = faker.string.alphanumeric(6).toLowerCase();
    const [domain1] = await db
      .insert(registeredDomains)
      .values({
        ownerId: mainOrganizer.id,
        domainName: `event-series-${randomString}.com`,
        verified: true,
      })
      .returning();
    log.success(`Dibuat domain kustom: ${domain1.domainName} (Verified)`);

    // LANGKAH 5-7: TRANSAKSI PEMBUATAN DATA INTI
    await db.transaction(async (tx) => {
      log.step(
        `LANGKAH 5: [TRANSAKSI DIMULAI] PEMBUATAN FORMULIR & ASET TERKAIT`,
      );

      // --- Form 1: Workshop Online Berbayar ---
      const [workshopForm] = await tx
        .insert(forms)
        .values({
          authorId: mainOrganizer.id,
          title: 'Advanced Full-Stack TypeScript Workshop',
          subdomain: `ts-workshop-${faker.string.alphanumeric(6)}`,
          published: true,
          hasCertificate: true,
          startAt: faker.date.soon({ days: 45 }),
        })
        .returning();
      const [workshopTicket] = await tx
        .insert(ticketTypes)
        .values({
          formId: workshopForm.id,
          name: 'Regular Access',
          price: 750000,
          quantity: 100,
        })
        .returning();
      await tx.insert(formOwned).values([
        { userId: mainOrganizer.id, formId: workshopForm.id, role: 'admin' },
        {
          userId: collaboratorUser.id,
          formId: workshopForm.id,
          role: 'editor',
        },
      ]);
      const [wsSection1] = await tx
        .insert(formSections)
        .values({
          formId: workshopForm.id,
          title: 'Personal Details for Certificate',
          order: 1,
        })
        .returning();
      const workshopFormFields = await tx
        .insert(formFields)
        .values([
          {
            sectionId: wsSection1.id,
            label: 'Full Name',
            fieldType: 'text',
            required: true,
            order: 1,
          },
          {
            sectionId: wsSection1.id,
            label: 'Job Title',
            fieldType: 'text',
            required: true,
            order: 2,
          },
        ])
        .returning();
      const [certTemplate] = await tx
        .insert(certificateTemplates)
        .values({
          formId: workshopForm.id,
          name: 'TypeScript Workshop Certificate',
          imageUrl: faker.image.urlLoremFlickr({ category: 'abstract' }),
          layoutConfig: [
            {
              key: 'participant_name',
              type: 'dynamic',
              fieldId: workshopFormFields[0].id,
              x: 100,
              y: 400,
              fontSize: 80,
            },
          ],
        })
        .returning();
      const [prompt] = await tx
        .insert(prompts)
        .values({ formId: workshopForm.id, authorId: mainOrganizer.id })
        .returning();
      await tx.insert(promptVersions).values({
        promptId: prompt.id,
        promptText: 'Create a detailed form for a tech workshop.',
        isActive: true,
      });
      log.success(
        'Dibuat: Form 1 - Workshop Berbayar (Tiket, Kolaborator, Sertifikat, AI).',
      );

      // --- Form 2: Webinar Online Gratis ---
      const [webinarForm] = await tx
        .insert(forms)
        .values({
          authorId: mainOrganizer.id,
          title: 'Intro to Drizzle ORM',
          subdomain: `drizzle-intro-${faker.string.alphanumeric(6)}`,
          published: true,
          hasCertificate: false,
          startAt: faker.date.soon({ days: 15 }),
        })
        .returning();
      const [webinarSection] = await tx
        .insert(formSections)
        .values({ formId: webinarForm.id, title: 'Registration', order: 1 })
        .returning();
      const webinarFormFields = await tx
        .insert(formFields)
        .values([
          {
            sectionId: webinarSection.id,
            label: 'Email',
            fieldType: 'email',
            required: true,
            order: 1,
          },
        ])
        .returning();
      log.success('Dibuat: Form 2 - Webinar Gratis.');

      // --- Form 3 & 4: Meetup Fisik dengan Evaluasi ---
      const [evaluationForm] = await tx
        .insert(forms)
        .values({
          authorId: mainOrganizer.id,
          title: 'Meetup Feedback',
          subdomain: `meetup-feedback-${faker.string.alphanumeric(6)}`,
          published: true,
        })
        .returning();
      const [evalSection] = await tx
        .insert(formSections)
        .values({
          formId: evaluationForm.id,
          title: 'Your Valuable Feedback',
          order: 1,
        })
        .returning();
      const evaluationFormFields = await tx
        .insert(formFields)
        .values([
          {
            sectionId: evalSection.id,
            label: 'Overall Rating (1-5)',
            fieldType: 'number',
            required: true,
            order: 1,
          },
        ])
        .returning();

      const meetupStartDate = faker.date.soon({ days: 7 });
      const [meetupForm] = await tx
        .insert(forms)
        .values({
          authorId: mainOrganizer.id,
          title: 'Jakarta Developer Meetup',
          subdomain: `jkt-dev-meetup-${faker.string.alphanumeric(6)}`,
          published: true,
          evaluationFormId: evaluationForm.id,
          startAt: meetupStartDate,
        })
        .returning();
      const [meetupTicket] = await tx
        .insert(ticketTypes)
        .values({
          formId: meetupForm.id,
          name: 'Meetup Pass',
          price: 100000,
          quantity: 200,
        })
        .returning();
      const [meetupSection] = await tx
        .insert(formSections)
        .values({ formId: meetupForm.id, title: 'Registration', order: 1 })
        .returning();
      const meetupFormFields = await tx
        .insert(formFields)
        .values([
          {
            sectionId: meetupSection.id,
            label: 'Full Name',
            fieldType: 'text',
            required: true,
            order: 1,
          },
        ])
        .returning();
      // [PERBAIKAN] Buat token check-in harian untuk acara meetup
      const [meetupDailyToken] = await tx
        .insert(eventDailyTokens)
        .values({
          formId: meetupForm.id,
          eventDate: meetupStartDate.toISOString().split('T')[0], // YYYY-MM-DD
          token: crypto.randomUUID(),
          validFrom: meetupStartDate,
          validUntil: new Date(meetupStartDate.getTime() + 8 * 60 * 60 * 1000), // Valid for 8 hours
        })
        .returning();
      log.success(
        'Dibuat: Form 3 & 4 - Meetup Fisik (Tiket, Evaluasi, Token Check-in).',
      );

      log.step(`LANGKAH 6: [DALAM TRANSAKSI] SIMULASI INTERAKSI PENGGUNA`);

      // --- Simulasi Pendaftaran Workshop ---
      for (let i = 0; i < 25; i++) {
        const participant = faker.helpers.arrayElement(participantUsers);
        const [submission] = await tx
          .insert(submissions)
          .values({
            formId: workshopForm.id,
            status: 'completed',
            userId: participant.id,
          })
          .returning();
        await tx.insert(submissionAnswers).values(
          workshopFormFields.map((f) => ({
            submissionId: submission.id,
            fieldId: f.id,
            value: generateAnswerForField(f),
          })),
        );
        let orderStatus: 'paid' | 'expired' = i > 18 ? 'expired' : 'paid';
        const [order] = await tx
          .insert(eventOrders)
          .values({
            formId: workshopForm.id,
            userId: participant.id,
            submissionId: submission.id,
            status: orderStatus,
            totalAmount: workshopTicket.price,
            currency: 'IDR',
            paidAt: orderStatus === 'paid' ? faker.date.past() : null,
          })
          .returning();
        if (orderStatus === 'paid') {
          await tx.insert(orderItems).values({
            orderId: order.id,
            ticketTypeId: workshopTicket.id,
            quantity: 1,
            unitPrice: workshopTicket.price,
          });
          await tx.insert(participantTickets).values({
            orderId: order.id,
            ticketTypeId: workshopTicket.id,
            userId: participant.id,
            qrCodeToken: crypto.randomUUID(),
          });
          await tx.insert(generatedCertificates).values({
            submissionId: submission.id,
            certificateTemplateId: certTemplate.id,
            generatedImageUrl: faker.image.urlLoremFlickr({
              category: 'technology',
            }),
          });
        }
      }
      log.success('25 pendaftaran workshop disimulasikan (paid/expired).');

      // --- Simulasi Pendaftaran Webinar Gratis ---
      for (let i = 0; i < 30; i++) {
        const participant = faker.helpers.arrayElement(participantUsers);
        const [submission] = await tx
          .insert(submissions)
          .values({
            formId: webinarForm.id,
            status: 'completed',
            userId: participant.id,
          })
          .returning();
        await tx.insert(submissionAnswers).values(
          webinarFormFields.map((f) => ({
            submissionId: submission.id,
            fieldId: f.id,
            value: generateAnswerForField(f),
          })),
        );
      }
      log.success('30 pendaftaran webinar gratis disimulasikan.');

      // --- Simulasi Pendaftaran, Check-in, & Evaluasi Meetup ---
      for (let i = 0; i < 35; i++) {
        const participant = faker.helpers.arrayElement(participantUsers);
        const [submission] = await tx
          .insert(submissions)
          .values({
            formId: meetupForm.id,
            status: 'completed',
            userId: participant.id,
          })
          .returning();
        await tx.insert(submissionAnswers).values(
          meetupFormFields.map((f) => ({
            submissionId: submission.id,
            fieldId: f.id,
            value: generateAnswerForField(f),
          })),
        );
        const [order] = await tx
          .insert(eventOrders)
          .values({
            formId: meetupForm.id,
            userId: participant.id,
            submissionId: submission.id,
            status: 'paid',
            totalAmount: meetupTicket.price,
            currency: 'IDR',
            paidAt: new Date(),
          })
          .returning();
        await tx.insert(orderItems).values({
          orderId: order.id,
          ticketTypeId: meetupTicket.id,
          quantity: 1,
          unitPrice: meetupTicket.price,
        });
        const [ticket] = await tx
          .insert(participantTickets)
          .values({
            orderId: order.id,
            ticketTypeId: meetupTicket.id,
            userId: participant.id,
            qrCodeToken: crypto.randomUUID(),
          })
          .returning();

        // 25 dari 35 peserta akan check-in
        if (i < 25) {
          await tx.insert(participantDailyCheckIns).values({
            participantTicketId: ticket.id,
            eventDate: meetupDailyToken.eventDate,
            checkedInByUserId: validatorUser.id,
            dailyTokenId: meetupDailyToken.id,
          });

          const [accessToken] = await tx
            .insert(evaluationAccessTokens)
            .values({
              orderId: order.id,
              userId: participant.id,
              token: crypto.randomUUID(),
              is_activated: true, // Diaktifkan setelah check-in
            })
            .returning();

          // 10 dari 25 yang check-in akan mengisi evaluasi
          if (i < 10) {
            await tx
              .update(evaluationAccessTokens)
              .set({ isUsed: true })
              .where(eq(evaluationAccessTokens.id, accessToken.id));
            const [evalSubmission] = await tx
              .insert(submissions)
              .values({
                formId: evaluationForm.id,
                status: 'completed',
                userId: participant.id,
              })
              .returning();
            await tx.insert(submissionAnswers).values(
              evaluationFormFields.map((f) => ({
                submissionId: evalSubmission.id,
                fieldId: f.id,
                value: generateAnswerForField(f),
              })),
            );
          }
        }
      }
      log.success(
        '35 pendaftaran meetup disimulasikan: 25 check-in, 10 mengisi evaluasi.',
      );

      log.step(`LANGKAH 7: [TRANSAKSI SELESAI] MENYIMPAN SEMUA DATA BARU`);
    });
  } catch (err) {
    log.error('Seeding gagal total:');
    console.error(err);
    process.exit(1);
  } finally {
    await client.end();
    log.info('🌱 Seeding database SUPER LENGKAP telah selesai!');
  }
};

// --- EKSEKUSI SCRIPT ---
const run = async () => {
  const userId = process.argv[2];
  if (!userId) {
    log.error('Error: Harap sediakan ID pengguna sebagai argumen.');
    console.log('   Contoh: pnpm drizzle:seed <user_id_anda>');
    process.exit(1);
  }
  await seedForUser(userId);
};

run();
