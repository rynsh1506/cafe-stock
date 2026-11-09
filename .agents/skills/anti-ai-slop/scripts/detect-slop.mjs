import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const TARGET_DIR = join(process.cwd(), "frontend/src");

const BANNED_PATTERNS = [
  {
    id: "RAINBOW_PASTEL_BADGE",
    regex:
      /\b(bg-emerald-100|bg-amber-100|bg-sky-100|bg-red-100|bg-purple-100|bg-indigo-100)\b/,
    reason: "Banned 1st-order AI rainbow pastel badge class",
  },
  {
    id: "DECORATIVE_INDEX_NUMBERS",
    regex: /code:\s*"0[1-9]"|Stage 0[1-9]|01 \/|02 \//,
    reason: "Banned 2nd-order AI decorative numbering (01, 02, Stage 01)",
  },
  {
    id: "AI_EYEBROW_SLOP_COPY",
    regex:
      /Immutable Compliance|Separated Balance Snapshot|ATOMIC TX|Create an aggregate requisition draft|Verify incoming quantities against/,
    reason: "Banned AI filler eyebrow/explanatory copywriting",
  },
  {
    id: "BLOATED_ROUNDED_CARDS",
    regex: /\brounded-3xl\b|\bshadow-2xl\b/,
    reason: "Banned bloated rounded-3xl / shadow-2xl AI card styling",
  },
];

function walkFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...walkFiles(fullPath));
    } else if (
      fullPath.endsWith(".svelte") ||
      fullPath.endsWith(".ts") ||
      fullPath.endsWith(".css")
    ) {
      results.push(fullPath);
    }
  }
  return results;
}

let violations = 0;
for (const file of walkFiles(TARGET_DIR)) {
  const content = readFileSync(file, "utf8");
  for (const rule of BANNED_PATTERNS) {
    if (rule.regex.test(content)) {
      console.error(`[SLOP VIOLATION] ${rule.id} in ${file}: ${rule.reason}`);
      violations++;
    }
  }
}

if (violations > 0) {
  console.error(`\nFailed: ${violations} AI slop violation(s) detected.`);
  process.exit(1);
} else {
  console.log("Anti-AI-Slop scan passed: 0 violations found.");
}
