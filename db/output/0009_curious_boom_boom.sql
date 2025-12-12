ALTER TABLE "content_templates" 
ALTER COLUMN "description" 
SET DATA TYPE jsonb 
USING to_jsonb("description");
ALTER TABLE "content_templates" 
ALTER COLUMN "description" 
SET DATA TYPE jsonb 
USING "description"::jsonb;