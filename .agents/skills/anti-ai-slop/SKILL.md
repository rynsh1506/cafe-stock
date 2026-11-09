---
name: anti-ai-slop
description: Strict Anti-AI-Slop & Domain-Character frontend design skill combining anthropics/skills@frontend-design, funboy322/avoid-ai-design, and Figma CafeStock Roastery guidelines.
---

# Anti-AI-Slop & Domain-Character Frontend Design Skill

Activate this skill whenever creating, modifying, or auditing any frontend UI component, layout, or stylesheet in `frontend/`.

## 1. Domain Character Over Sterile Blank Monochrome (`anthropics/skills@frontend-design`)

- **FORBIDDEN**: Sterile, blank, colorless monochrome (`#FFFFFF` + `#111111` + `#FAFAFA`) with no domain personality.
- **FORBIDDEN**: Generic centered login boxes sitting alone in the middle of an empty white/gray screen.
- **REQUIRED (CafeStock Figma Roastery Theme)**:
  - **Deep Espresso Sidebar & Hero**: `#231712` / `#1C120D` surface, `#38261E` border, `#EFE8E1` text.
  - **Roasted Coffee Primary & Copper Accents**: `#5A3825` primary buttons/accents, `#C68B59` / `#D8A57A` warm copper highlights.
  - **Warm Cream Parchment Workspace**: `#FAF7F2` canvas background, `#FFFFFF` cards with `#EDE4D8` warm sand borders, `#2D241E` primary ink, `#8C7665` muted cocoa labels.
  - **Editorial Typography**: `Newsreader` (serif) for headings and brand titles, `Plus Jakarta Sans` for UI controls and tables, and `JetBrains Mono` (`tabular-nums`) for document codes (`PR-`, `PO-`, `GR-`, `SKU`).

## 2. Layout & Component Architecture (Figma Reference Aligned)

- **Split-Screen Login (`frontend/src/routes/login/+page.svelte`)**:
  - Left column (`md:w-1/2 lg:w-5/12 bg-[#231712]`): CafeStock v1.0 branding, serif hero headline (_"Stok tertata, Racikan tetap terjaga."_), procurement highlights, and team footer.
  - Right column (`flex-1 bg-[#FAF7F2]`): Login form with icon inputs, password visibility toggle, and 1-Click Demo Seeder Account cards (`Staff Gudang — USER` & `Manager Reviewer — APPROVER`).
- **Dashboard (`frontend/src/routes/+page.svelte`)**:
  - Top Espresso gradient welcome banner (`from-[#2C1E18] to-[#4A2D1D]`) with user greeting, role badge, and primary CTA.
  - 4 warm KPI metric cards (`Total Master Produk`, `PR Perlu Review`, `PO Aktif / Penerimaan`, `Stok Kritis Gudang`) with warm icon containers.
  - 3-column middle section: 7-day incoming material volume bar chart (`Sen`–`Min`) + Critical Stock Alert widget.
  - Bottom section: Recent Procurement & Inventory Movement table.
- **Clean Modal / Collapsible Creation Flows**:
  - Keep operational pages (`master`, `purchase-requests`, `purchase-orders`, `goods-receipts`) clean by placing creation forms inside collapsible drawers or modal dialogs triggered from the header button.

## 3. Control Geometry & `<select>` Alignment

- Every `.ui-input`, `.ui-select`, `.ui-btn`, and `.ui-btn-outline` MUST share a locked `38px` height (`border-radius: 10px`) with `appearance: none` and a custom right-aligned SVG chevron on `<select>` so dropdowns never look crooked on Linux/macOS/Windows.
