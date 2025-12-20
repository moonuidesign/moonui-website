-- ==========================================
-- 1. TABLE: CONTENT_COMPONENTS
-- ==========================================

-- Hapus kolom yang tidak dipakai (sesuai log kamu)
ALTER TABLE "content_components" DROP COLUMN IF EXISTS "size";
ALTER TABLE "content_components" DROP COLUMN IF EXISTS "format";

-- Ubah 'number' menjadi Serial (Auto Increment) secara manual
CREATE SEQUENCE IF NOT EXISTS content_components_number_seq;
ALTER TABLE "content_components" ALTER COLUMN "number" SET DEFAULT nextval('content_components_number_seq');
ALTER TABLE "content_components" ALTER COLUMN "number" SET NOT NULL;
ALTER SEQUENCE content_components_number_seq OWNED BY "content_components"."number";

-- SINKRONISASI: Set sequence ke angka terbesar yang ada sekarang
SELECT setval('content_components_number_seq', COALESCE((SELECT MAX("number") FROM "content_components"), 0));


-- ==========================================
-- 2. TABLE: CONTENT_TEMPLATES
-- ==========================================

CREATE SEQUENCE IF NOT EXISTS content_templates_number_seq;
ALTER TABLE "content_templates" ALTER COLUMN "number" SET DEFAULT nextval('content_templates_number_seq');
ALTER TABLE "content_templates" ALTER COLUMN "number" SET NOT NULL;
ALTER SEQUENCE content_templates_number_seq OWNED BY "content_templates"."number";

-- SINKRONISASI
SELECT setval('content_templates_number_seq', COALESCE((SELECT MAX("number") FROM "content_templates"), 0));


-- ==========================================
-- 3. TABLE: CONTENT_GRADIENTS
-- ==========================================

CREATE SEQUENCE IF NOT EXISTS content_gradients_number_seq;
ALTER TABLE "content_gradients" ALTER COLUMN "number" SET DEFAULT nextval('content_gradients_number_seq');
ALTER TABLE "content_gradients" ALTER COLUMN "number" SET NOT NULL;
ALTER SEQUENCE content_gradients_number_seq OWNED BY "content_gradients"."number";

-- SINKRONISASI
SELECT setval('content_gradients_number_seq', COALESCE((SELECT MAX("number") FROM "content_gradients"), 0));


-- ==========================================
-- 4. TABLE: CONTENT_DESIGNS
-- ==========================================

CREATE SEQUENCE IF NOT EXISTS content_designs_number_seq;
ALTER TABLE "content_designs" ALTER COLUMN "number" SET DEFAULT nextval('content_designs_number_seq');
ALTER TABLE "content_designs" ALTER COLUMN "number" SET NOT NULL;
ALTER SEQUENCE content_designs_number_seq OWNED BY "content_designs"."number";

-- SINKRONISASI
SELECT setval('content_designs_number_seq', COALESCE((SELECT MAX("number") FROM "content_designs"), 0));