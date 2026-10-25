import {
  BrandingConfig,
  EmailNotificationConfig,
  IndustryPresetId,
  KernelPluginManifest,
  ThemePalette,
} from "@/kernel/types";

/**
 * ============================================================================
 * DEVELOPER EXTENSION GUIDE: ADDING A NEW PLUGIN / MODULE
 * ============================================================================
 * To add a new feature tab or add-on module to this Microkernel application:
 * 1. Add your plugin ID to `NavigationTab` in `src/types/index.ts`.
 * 2. Append a new `KernelPluginManifest` object to `KERNEL_PLUGINS` below.
 * 3. Map its component in `src/App.tsx`.
 * The Sidebar, Mobile Header, Breadcrumbs, and Control Panel will register it
 * automatically without modifying any layout files.
 */
export const KERNEL_PLUGINS: KernelPluginManifest[] = [
  {
    id: "dashboard",
    code: "01",
    name: "Buku Ikhtisar",
    sectionLabel: "Ikhtisar",
    category: "CORE_OVERVIEW",
    version: "1.2.0",
    author: "Core Kernel Team",
    description:
      "Meja kendali utama yang merangkum metrik katalog, antrean otorisasi, tonase barang masuk, dan peringatan stok minimum.",
    isCore: true,
    defaultEnabled: true,
    hooks: ["kernel:boot", "metrics:aggregate"],
  },
  {
    id: "products",
    code: "02",
    name: "Katalog Master & Pemasok",
    sectionLabel: "Master Data",
    category: "CORE_OVERVIEW",
    version: "1.1.0",
    author: "Core Kernel Team",
    description:
      "Manajemen spesifikasi SKU item, satuan takar, batas minimum stok (reorder point), daftar pemasok, dan lokasi gudang.",
    isCore: false,
    defaultEnabled: true,
    hooks: ["catalog:itemCreated", "catalog:supplierVerified"],
  },
  {
    id: "purchase-requests",
    code: "03",
    name: "Purchase Request (Tiket PR)",
    sectionLabel: "Siklus Pengadaan",
    category: "PROCUREMENT_FLOW",
    version: "1.3.0",
    author: "Procurement Add-on",
    description:
      "Modul pengajuan kebutuhan barang/tiket pengadaan dengan payload agregat dan alur otorisasi berjenjang (DRAFT → SUBMITTED → APPROVED/REJECTED).",
    isCore: false,
    defaultEnabled: true,
    hooks: [
      "mailer:onPrSubmitted",
      "mailer:onPrApproved",
      "mailer:onPrRejected",
    ],
  },
  {
    id: "purchase-orders",
    code: "04",
    name: "Purchase Order (PO)",
    sectionLabel: "Siklus Pengadaan",
    category: "PROCUREMENT_FLOW",
    version: "1.2.0",
    author: "Procurement Add-on",
    description:
      "Penerbitan dokumen pesanan resmi ke pemasok dari tiket PR yang telah disetujui (APPROVED) beserta pelacakan pengiriman.",
    isCore: false,
    defaultEnabled: true,
    hooks: ["mailer:onPoOrdered", "po:statusChanged"],
  },
  {
    id: "goods-receipts",
    code: "05",
    name: "Timbang Terima (Goods Receipt)",
    sectionLabel: "Siklus Pengadaan",
    category: "PROCUREMENT_FLOW",
    version: "1.2.4",
    author: "Warehouse Add-on",
    description:
      "Verifikasi penerimaan fisik terhadap PO dengan validasi batas sisa kuantitas dan pemicu otomatis transaksi penambah stok.",
    isCore: false,
    defaultEnabled: true,
    hooks: ["inventory:commitReceipt", "mailer:onGrReceived"],
  },
  {
    id: "inventory",
    code: "06",
    name: "Kartu Stok & Mutasi",
    sectionLabel: "Gudang",
    category: "WAREHOUSE_AUDIT",
    version: "1.1.5",
    author: "Warehouse Add-on",
    description:
      "Pemisahan tegas antara tabel saldo berjalan (inventory_balances) dan buku riwayat mutasi (append-only inventory_movements).",
    isCore: false,
    defaultEnabled: true,
    hooks: ["mailer:onCriticalStock", "ledger:balanceCheck"],
  },
  {
    id: "audit-logs",
    code: "07",
    name: "Jurnal Jejak Audit",
    sectionLabel: "Kepatuhan",
    category: "WAREHOUSE_AUDIT",
    version: "1.0.8",
    author: "Security & Compliance",
    description:
      "Pencatatan permanen setiap perubahan state dokumen, identitas petugas pelaksana, dan stempel waktu presisi.",
    isCore: false,
    defaultEnabled: true,
    hooks: ["audit:appendRecord"],
  },
  {
    id: "control-panel",
    code: "SYS",
    name: "Panel Kontrol (Admin)",
    sectionLabel: "Administrasi Sistem",
    category: "SYSTEM_EXTENSION",
    version: "2.0.0",
    author: "Microkernel Core",
    description:
      "Pusat kendali bergaya Gitea/osTicket untuk mengatur identitas instansi, pasang/lepas plugin, palet warna tema, dan gateway email inti.",
    isCore: true,
    defaultEnabled: true,
    hooks: ["kernel:configUpdated", "mailer:testDispatch"],
  },
];

export const THEME_PALETTES: ThemePalette[] = [
  {
    id: "roastery-ledger",
    name: "Roastery Parchment Ledger",
    badge: "DEFAULT",
    description:
      "Kertas buku kerja tanpa pemutih dengan tinta espresso pekat dan aksen tembaga sangrai.",
    colors: {
      bgMain: "#F6F3EC",
      bgSurface: "#FDFBF7",
      bgElevated: "#F4EFE4",
      bgSidebar: "#191310",
      bgSidebarHeader: "#140F0C",
      textMain: "#1A1411",
      textMuted: "#6E5E50",
      textSidebar: "#EBE4DA",
      border: "#D8CFC0",
      borderSidebar: "#332720",
      accent: "#C89666",
      accentText: "#1F1612",
    },
  },
  {
    id: "gitea-forge",
    name: "Gitea Forge Slate",
    badge: "DEV OPS",
    description:
      "Gaya panel kontrol self-hosted Gitea dengan abu-abu teknis bersih, sidebar batu tulis gelap, dan aksen hijau zamrud.",
    colors: {
      bgMain: "#F3F5F8",
      bgSurface: "#FFFFFF",
      bgElevated: "#EBF0F5",
      bgSidebar: "#161B22",
      bgSidebarHeader: "#0D1117",
      textMain: "#1F2328",
      textMuted: "#59636E",
      textSidebar: "#E6EDF3",
      border: "#D0D7DE",
      borderSidebar: "#30363D",
      accent: "#3FB950",
      accentText: "#0D1117",
    },
  },
  {
    id: "odoo-modular",
    name: "Odoo Modular Plum",
    badge: "ERP SUITE",
    description:
      "Palet khas sistem ERP modular dengan permukaan batu hangat, navigasi aubergine tua, dan aksen terakota.",
    colors: {
      bgMain: "#F7F5F7",
      bgSurface: "#FFFFFF",
      bgElevated: "#EFEBF0",
      bgSidebar: "#261729",
      bgSidebarHeader: "#1C101E",
      textMain: "#211A23",
      textMuted: "#685B6B",
      textSidebar: "#F2EBF4",
      border: "#DDD5DF",
      borderSidebar: "#3E2842",
      accent: "#E0A96D",
      accentText: "#1C101E",
    },
  },
  {
    id: "osticket-dispatch",
    name: "osTicket Service Desk",
    badge: "TICKETING",
    description:
      "Kontras tinggi ala meja bantuan osTicket dengan biru maritim industri, kertas formulir terang, dan indikator kuning sinyal.",
    colors: {
      bgMain: "#F2F5F7",
      bgSurface: "#FFFFFF",
      bgElevated: "#E6ECF0",
      bgSidebar: "#102131",
      bgSidebarHeader: "#0A1622",
      textMain: "#132332",
      textMuted: "#546778",
      textSidebar: "#E3ECF5",
      border: "#CBD5E0",
      borderSidebar: "#21384F",
      accent: "#F59E0B",
      accentText: "#102131",
    },
  },
  {
    id: "obsidian-terminal",
    name: "Obsidian Industrial Night",
    badge: "DARK MODE",
    description:
      "Mode malam karbon berkecepatan tinggi untuk pemantauan layar gudang 24 jam tanpa silau.",
    colors: {
      bgMain: "#111317",
      bgSurface: "#181B20",
      bgElevated: "#20242B",
      bgSidebar: "#0B0D10",
      bgSidebarHeader: "#07080A",
      textMain: "#ECEFF4",
      textMuted: "#949EA8",
      textSidebar: "#D8DEE9",
      border: "#2B303A",
      borderSidebar: "#22262E",
      accent: "#D49B6A",
      accentText: "#111317",
    },
  },
];

export const INDUSTRY_PRESETS: Record<IndustryPresetId, BrandingConfig> = {
  ROASTERY_CAFE: {
    appName: "CafeStock",
    appSubtitle: "Roastery & Supply Ledger",
    orgName: "Jakarta & Bandung Roastery",
    industryPreset: "ROASTERY_CAFE",
    documentPrefixPR: "PR",
    documentPrefixPO: "PO",
    documentPrefixGR: "GR",
    itemTerm: "Bahan Baku",
  },
  GENERAL_WAREHOUSE: {
    appName: "OpenSupply",
    appSubtitle: "Modular Warehouse Kernel",
    orgName: "Divisi Logistik & Distribusi Pusat",
    industryPreset: "GENERAL_WAREHOUSE",
    documentPrefixPR: "REQ",
    documentPrefixPO: "ORD",
    documentPrefixGR: "RCV",
    itemTerm: "Komoditas Gudang",
  },
  IT_ASSET_TICKETING: {
    appName: "osProcure",
    appSubtitle: "IT Asset & Request Ticketing",
    orgName: "Internal Infrastructure & Helpdesk",
    industryPreset: "IT_ASSET_TICKETING",
    documentPrefixPR: "TKT",
    documentPrefixPO: "PO-IT",
    documentPrefixGR: "AST",
    itemTerm: "Perangkat / Aset",
  },
};

export const DEFAULT_EMAIL_CONFIG: EmailNotificationConfig = {
  enabled: true,
  coreAdminEmail: "inti-operasional@perusahaan.co.id",
  approverGroupEmail: "approver-desk@perusahaan.co.id",
  smtpHost: "smtp.internal-relay.local",
  smtpPort: 587,
  useTls: true,
  senderIdentity: "no-reply@microkernel-desk.local",
  subjectPrefix: "[NOTIF-INTI]",
  triggers: {
    onPrSubmitted: true,
    onPrApproved: true,
    onPrRejected: true,
    onPoOrdered: true,
    onGrReceived: true,
    onCriticalStock: true,
  },
};
