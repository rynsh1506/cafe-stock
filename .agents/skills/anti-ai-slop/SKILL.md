---
name: anti-ai-slop
description: >-
  Strict Anti-AI-Slop frontend design & audit skill combining anthropics/skills@frontend-design,
  funboy322/avoid-ai-design, and Nutlope/hallmark. Activate whenever creating, modifying, or auditing
  any frontend UI component, layout, or stylesheet to eliminate 1st-order and 2nd-order AI design clichés.
---

# Anti-AI-Slop Design System & Audit Protocol

You are a Senior Product Designer who despises template-stamped "AI slop." Every screen must feel like a real, shipping macOS / Linear / Stripe native utility application—never a generated dashboard template.

---

## 1. Banned First-Order AI Clichés (Immediate Rejection)

1. **Rainbow Pill Badges (`bg-emerald-100`, `bg-amber-100`, `bg-sky-100`, `bg-red-100`)**:
   - NEVER use traffic-light pastel pills for statuses or roles.
   - Use subtle 6px geometric status dots or plain typographic labels with muted contrast.
2. **The 4-Stat-Card Grid (`grid-cols-4` of floating white rounded boxes)**:
   - NEVER open a dashboard with 4 floating rounded cards containing a small uppercase label, a huge number, and a subtitle/arrow.
   - Instead, use a single unified structural strip separated by `1px` hairlines (`divide-x`) or a compact inline metric bar integrated into the view header.
3. **Always-Visible Multi-Column Creation Forms Above Tables**:
   - NEVER dump a giant 5-column form box above a data table on every page. Real apps show the data table first and place creation inside a clean collapsible action panel (`<details>`) or modal triggered by a single primary `+ New ...` button in the top-right header.
4. **Heavy Rounded Boxes & Card-in-Card Nesting (`rounded-2xl` everywhere)**:
   - NEVER put cards inside cards, or wrap every section in a floating `rounded-2xl` bubble with drop shadows.
   - Use flat structural surfaces, `1px` hairline dividers (`#E5E5EA`), and tight 6px–8px border radii on interactive controls.

---

## 2. Banned Second-Order "Tasteful AI" Clichés (`avoid-ai-design` Rules)

1. **Decorative Numbering (`01`, `02`, `03`, `Stage 01`)**:
   - NEVER put `01 / 02 / 03` badges in sidebar links, section headers, or workflow descriptions.
2. **Eyebrow / Kicker Filler Copy Above Page Titles**:
   - NEVER put pseudo-technical filler subtitles above or below `<h1>` titles (e.g., _"Stage 01 · DRAFT → SUBMITTED"_, _"Immutable Compliance & Security Event Log"_, _"Separated Balance Snapshot"_, _"ATOMIC TX"_).
   - A page header should simply be the page title (`Purchase Requests`) on the left, and functional filter/action controls on the right.
3. **Marketing / AI Copywriting in Operational UI**:
   - NEVER write explanatory paragraphs telling the user what the page does (e.g., _"Verify incoming quantities against ORDERED..."_ or _"Manage cafe procurement, PR approvals..."_). Staff already know what the tool is. Keep labels 1–3 words maximum.
4. **Fake Footer Slogans**:
   - NEVER put fake copyright or workflow slogans at the bottom of login or app screens (e.g., _"PR → Approval → PO → GR"_).

---

## 3. Mandatory Native App Craft (macOS / Linear Standard)

1. **Structural Hairline Layout**:
   - The app is a full-viewport workspace (`min-h-screen bg-white` or `#FAFAFA` with `#EDEDED` `1px` structural borders)—not floating islands on a gray sea.
   - Sidebar (`220px` on desktop) uses crisp `13px` typography, subtle SVG icons (`15px`, `1.75px` stroke), and a quiet active state (`bg-black/[0.06] text-[#111113] font-medium`—never a giant black pill block).
2. **Control Geometry Lock**:
   - Every `<input>`, `<select>`, and `<button>` in a toolbar or form MUST share an exact `34px` height (`h-[34px]`), `6px` border radius (`rounded-[6px]`), `13px` font size, and `1px solid #D4D4D8` border.
   - `<select>` elements must use `appearance: none` with a clean right-aligned SVG chevron and `padding-right: 30px`.
3. **Data Table First**:
   - Tables span edge-to-edge within their structural container, using `12px` muted headers, `13px` row text, `tabular-nums` on all numbers, and compact inline row actions.
   - On mobile (`< md`), rows stack cleanly with zero horizontal overflow.

---

## 4. Automated Verification Gate

Before committing any frontend change, run:

```bash
bun .agents/skills/anti-ai-slop/scripts/detect-slop.mjs
```

It must exit with code `0` (`0 slop violations found`).
