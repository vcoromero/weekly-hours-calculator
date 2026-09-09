// Backfill daySavedAt on WorkRecord rows belonging to saved weeks.
// Run after merging the daySavedAt fix (issue #35).
// Idempotent — only updates rows where daySavedAt IS NULL.
//
// Note: week.createdAt is used as an approximation of the save moment.
// For weeks created as draft and saved later, createdAt predates the actual
// save timestamp. This is fine for the presence-based UI split but worth
// knowing — the value will be slightly earlier than reality.
//
// Usage:
//   npx tsx prisma/backfill-day-saved-at.ts          # dry-run (default)
//   npx tsx prisma/backfill-day-saved-at.ts --apply  # actually mutate DB

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// --- Env guard -----------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env"), override: true });

if (!process.env.DATABASE_URL) {
  console.error(
    "DATABASE_URL is not set. Source apps/backend/.env or export it before running."
  );
  process.exit(1);
}

// --- Prisma client -------------------------------------------------------
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// --- CLI flags -----------------------------------------------------------
const apply = process.argv.includes("--apply");

async function main() {
  const start = Date.now();
  const mode = apply ? "APPLY" : "DRY-RUN";
  console.log(`Starting backfill: daySavedAt on saved-week records (${mode})\n`);

  // 1. Find all weeks with status "saved"
  const savedWeeks = await prisma.week.findMany({
    where: { status: "saved" },
    select: { id: true, label: true, createdAt: true },
  });

  // 2. Check each week for pending NULL records
  const pendingWeeks: {
    id: string;
    label: string;
    createdAt: Date;
    pendingCount: number;
  }[] = [];

  for (const week of savedWeeks) {
    const count = await prisma.workRecord.count({
      where: { weekId: week.id, daySavedAt: null },
    });
    if (count > 0) {
      pendingWeeks.push({ ...week, pendingCount: count });
    }
  }

  const totalPending = pendingWeeks.reduce((sum, w) => sum + w.pendingCount, 0);

  console.log(
    `Found ${savedWeeks.length} saved week(s), ` +
      `${pendingWeeks.length} with pending NULL records ` +
      `(${totalPending} record(s) total).\n`
  );

  if (pendingWeeks.length === 0) {
    console.log("Nothing to update — exiting.");
    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`\nDuration: ${duration}s`);
    return;
  }

  if (!apply) {
    console.log("Dry-run mode — no changes written. Re-run with --apply to mutate.\n");
    for (const week of pendingWeeks) {
      console.log(
        `  Week "${week.label}" — would update ${week.pendingCount} record(s)`
      );
    }
    console.log(`\nTotal records that would be updated: ${totalPending}`);
    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`Duration: ${duration}s`);
    return;
  }

  // 3. Apply — wrap each week in a transaction for per-week atomicity
  let weeksUpdated = 0;
  let weeksSkipped = 0;
  let totalUpdated = 0;

  for (const week of pendingWeeks) {
    const result = await prisma.$transaction(async (tx) => {
      return tx.workRecord.updateMany({
        where: {
          weekId: week.id,
          daySavedAt: null,
        },
        data: {
          daySavedAt: week.createdAt,
        },
      });
    });

    if (result.count > 0) {
      console.log(`  Week "${week.label}" — updated ${result.count} record(s)`);
      totalUpdated += result.count;
      weeksUpdated++;
    } else {
      weeksSkipped++;
    }
  }

  const duration = ((Date.now() - start) / 1000).toFixed(2);

  console.log("\n--- Backfill complete ---");
  console.log(`  Weeks updated : ${weeksUpdated}`);
  console.log(`  Weeks skipped : ${weeksSkipped} (no NULL records)`);
  console.log(`  Records updated: ${totalUpdated}`);
  console.log(`  Duration       : ${duration}s`);
}

main()
  .catch((e) => {
    console.error("Backfill failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
