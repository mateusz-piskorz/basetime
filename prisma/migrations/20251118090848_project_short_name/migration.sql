-- 1. Add new column as nullable
ALTER TABLE "Project" ADD COLUMN "shortName" TEXT;

-- 2. Patch values
WITH numbered_projects AS (
  SELECT
    id,
    'project-' || ROW_NUMBER() OVER (PARTITION BY "organizationId" ORDER BY id) AS generated_short_name
  FROM "Project"
)
UPDATE "Project"
SET "shortName" = np.generated_short_name
FROM numbered_projects np
WHERE "Project".id = np.id;

-- 3. Make column NOT NULL
ALTER TABLE "Project" ALTER COLUMN "shortName" SET NOT NULL;

-- 4. Add composite unique index
CREATE UNIQUE INDEX "Project_organizationId_shortName_key" ON "Project"("organizationId", "shortName");