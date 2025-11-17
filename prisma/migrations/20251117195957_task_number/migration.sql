-- AlterTable: Add the taskLastNumber sequence column to Organization
ALTER TABLE "Organization" ADD COLUMN "taskLastNumber" INTEGER NOT NULL DEFAULT 0;

-- AlterTable: Add taskNumber column as NULLABLE
ALTER TABLE "Task" ADD COLUMN "taskNumber" INTEGER;

-- Backfill taskNumber per organization using a window function
UPDATE "Task" t
SET "taskNumber" = x.row_number
FROM (
    SELECT
        "id",
        ROW_NUMBER() OVER (PARTITION BY "organizationId" ORDER BY "createdAt", "id") AS row_number
    FROM "Task"
) x
WHERE t."id" = x."id";

-- Set Organization.taskLastNumber to max(Task.taskNumber) per org
UPDATE "Organization" o
SET "taskLastNumber" = COALESCE(m.max_task, 0)
FROM (
    SELECT "organizationId", MAX("taskNumber") AS max_task
    FROM "Task"
    GROUP BY "organizationId"
) m
WHERE o."id" = m."organizationId";

-- AlterTable: Make taskNumber REQUIRED (NOT NULL)
ALTER TABLE "Task" ALTER COLUMN "taskNumber" SET NOT NULL;

-- CreateIndex: Add unique constraint
CREATE UNIQUE INDEX "Task_organizationId_taskNumber_key" ON "Task"("organizationId", "taskNumber");