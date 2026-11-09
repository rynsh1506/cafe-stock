#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(process.cwd(), "frontend", "src");

function walk(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      results.push(...walk(full));
    } else if (full.endsWith(".svelte") || full.endsWith(".css")) {
      results.push(full);
    }
  }
  return results;
}

const RULES = [
  {
    id: "NO_AI_SLOP_STAGE_SUBTITLE",
    regex: /Stage\s+0[1-9]\s*·/g,
    message: "Forbidden AI-slop eyebrow text ('Stage 01 · ...')",
  },
  {
    id: "NO_FAKE_COMPLIANCE_SLOP",
    regex:
      /Immutable Compliance & Security Event Log|Separated Balance Snapshot/g,
    message: "Forbidden AI-slop pseudo-technical subtitle",
  },
  {
    id: "NO_FLAG_EMOJIS",
    regex: /[\u{1F1E6}-\u{1F1FF}]{2}/gu,
    message: "Forbidden country flag emoji slop",
  },
];

let violations = 0;
for (const file of walk(ROOT)) {
  const content = readFileSync(file, "utf8");
  for (const rule of RULES) {
    const matches = content.match(rule.regex);
    if (matches) {
      console.error(`[SLOP VIOLATION] ${rule.id} in ${file}: ${rule.message}`);
      violations += matches.length;
    }
  }
}

const loginContent = readFileSync(
  join(ROOT, "routes", "login", "+page.svelte"),
  "utf8",
);
if (
  !loginContent.includes("md:flex-row") ||
  !loginContent.includes("#231712")
) {
  console.error(
    "[SLOP VIOLATION] LOGIN_MUST_BE_SPLIT_SCREEN_ESPRESSO: Login page must use the Figma split-screen espresso layout, not a plain centered box.",
  );
  violations += 1;
}

if (violations > 0) {
  console.error(`\nAnti-AI-Slop scan failed with ${violations} violation(s).`);
  process.exit(1);
} else {
  console.log("Anti-AI-Slop scan passed: 0 violations found.");
}
