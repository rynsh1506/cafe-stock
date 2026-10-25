export type LocaleCode = "id" | "en" | "ja";

export interface LocaleMetadata {
  code: LocaleCode;
  name: string;
  nativeName: string;
  flagCode: string;
}

export const SUPPORTED_LOCALES: LocaleMetadata[] = [
  {
    code: "id",
    name: "Indonesian",
    nativeName: "Bahasa Indonesia",
    flagCode: "ID",
  },
  {
    code: "en",
    name: "English",
    nativeName: "English (International)",
    flagCode: "EN",
  },
  {
    code: "ja",
    name: "Japanese",
    nativeName: "日本語 (Roastery Standard)",
    flagCode: "JA",
  },
];

/**
 * Strictly typed translation dictionary contract.
 * Every UI module reads from these keys via `useKernel().t(key)` so the entire application
 * can switch languages or apply custom user-defined terminology in 0ms.
 */
export interface TranslationDictionary {
  // Common & Header
  "common.searchPlaceholder": string;
  "common.controlPanel": string;
  "common.switchRole": string;
  "common.activeStaff": string;
  "common.open": string;
  "common.reset": string;
  "common.active": string;
  "common.inactive": string;
  "common.lockedCore": string;
  "common.language": string;

  // Sidebar Categories & Plugin Titles
  "nav.cat.overview": string;
  "nav.cat.procurement": string;
  "nav.cat.warehouse": string;
  "nav.cat.system": string;
  "plugin.dashboard.name": string;
  "plugin.products.name": string;
  "plugin.purchaseRequests.name": string;
  "plugin.purchaseOrders.name": string;
  "plugin.goodsReceipts.name": string;
  "plugin.inventory.name": string;
  "plugin.auditLogs.name": string;
  "plugin.controlPanel.name": string;

  // Login Page
  "login.docStamp": string;
  "login.activeWarehouses": string;
  "login.ledgerSubtitle": string;
  "login.heroLine1": string;
  "login.heroLine2": string;
  "login.heroDesc": string;
  "login.chainTitle": string;
  "login.formTag": string;
  "login.welcomeTitle": string;
  "login.welcomeDesc": string;
  "login.usernameLabel": string;
  "login.passwordLabel": string;
  "login.rememberShift": string;
  "login.submitBtn": string;
  "login.submittingBtn": string;
  "login.seederTitle": string;
  "login.userPassDesc": string;
  "login.approverPassDesc": string;

  // Dashboard Tab
  "dashboard.activeModules": string;
  "dashboard.coreAlert": string;
  "dashboard.titlePrefix": string;
  "dashboard.subtitle": string;
  "dashboard.customizeKernel": string;
  "dashboard.reviewBtn": string;
  "dashboard.createPrBtn": string;
  "dashboard.kpi1.label": string;
  "dashboard.kpi1.unit": string;
  "dashboard.kpi1.footer": string;
  "dashboard.kpi2.label": string;
  "dashboard.kpi2.unit": string;
  "dashboard.kpi2.footer": string;
  "dashboard.kpi3.label": string;
  "dashboard.kpi3.unit": string;
  "dashboard.kpi3.footer": string;
  "dashboard.kpi4.label": string;
  "dashboard.kpi4.unit": string;
  "dashboard.kpi4.footer": string;
  "dashboard.chart.tag": string;
  "dashboard.chart.title": string;
  "dashboard.chart.desc": string;
  "dashboard.chart.weekTotal": string;
  "dashboard.chart.vsLastWeek": string;
  "dashboard.chart.dominantCat": string;
  "dashboard.chart.dailyAvg": string;
  "dashboard.chart.auditVariance": string;
  "dashboard.alert.tag": string;
  "dashboard.alert.title": string;
  "dashboard.alert.deficit": string;
  "dashboard.alert.draftPrBtn": string;
  "dashboard.tx.tag": string;
  "dashboard.tx.title": string;
  "dashboard.tx.flowLabel": string;
  "dashboard.tx.colReg": string;
  "dashboard.tx.colStage": string;
  "dashboard.tx.colWarehouse": string;
  "dashboard.tx.colDate": string;
  "dashboard.tx.colStatus": string;
  "dashboard.tx.colFile": string;

  // Control Panel (Gitea / osTicket Site Admin)
  "cp.headerTag": string;
  "cp.headerTitle": string;
  "cp.headerDesc": string;
  "cp.resetDefaultBtn": string;
  "cp.menuTitle": string;
  "cp.nav.status": string;
  "cp.nav.identity": string;
  "cp.nav.i18n": string;
  "cp.nav.database": string;
  "cp.nav.plugins": string;
  "cp.nav.themes": string;
  "cp.nav.mailer": string;
  "cp.nav.devSdk": string;
}

export type TranslationKey = keyof TranslationDictionary;

export const BUILTIN_TRANSLATIONS: Record<LocaleCode, TranslationDictionary> = {
  id: {
    "common.searchPlaceholder": "Cari Dokumen / SKU...",
    "common.controlPanel": "Panel Kontrol",
    "common.switchRole": "Ganti",
    "common.activeStaff": "OTORISASI PETUGAS AKTIF",
    "common.open": "BUKA",
    "common.reset": "Reset",
    "common.active": "AKTIF",
    "common.inactive": "NONAKTIF",
    "common.lockedCore": "TERKUNCI (INTI)",
    "common.language": "Bahasa",

    "nav.cat.overview": "IKHTISAR & MASTER",
    "nav.cat.procurement": "SIKLUS TRANSAKSI",
    "nav.cat.warehouse": "GUDANG & KEPATUHAN",
    "nav.cat.system": "KERNEL & KONFIGURASI",
    "plugin.dashboard.name": "Buku Ikhtisar",
    "plugin.products.name": "Katalog Master & Pemasok",
    "plugin.purchaseRequests.name": "Purchase Request (PR)",
    "plugin.purchaseOrders.name": "Purchase Order (PO)",
    "plugin.goodsReceipts.name": "Timbang Terima (GR)",
    "plugin.inventory.name": "Kartu Stok & Mutasi",
    "plugin.auditLogs.name": "Jurnal Jejak Audit",
    "plugin.controlPanel.name": "Panel Kontrol (Admin)",

    "login.docStamp": "DOC // ARCHIVE-IDN",
    "login.activeWarehouses": "2 GUDANG AKTIF",
    "login.ledgerSubtitle": "Buku Induk Pengadaan & Mutasi Gudang",
    "login.heroLine1": "Stok tertata,",
    "login.heroLine2": "racikan tetap terjaga.",
    "login.heroDesc":
      "Catatan operasional pengadaan komoditas, bahan baku, dan inventaris. Setiap barang yang masuk tercatat dari pengajuan awal hingga bukti timbang terima di gudang.",
    "login.chainTitle": "Rantai Dokumen Transaksi (PRD Standard)",
    "login.formTag": "FORMULIR OTENTIKASI PETUGAS",
    "login.welcomeTitle": "Masuk ke Buku Kerja",
    "login.welcomeDesc":
      "Gunakan kredensial petugas gudang atau manajer pemeriksa untuk mengakses dokumen pengadaan.",
    "login.usernameLabel": "ID Petugas / Username",
    "login.passwordLabel": "Kata Sandi",
    "login.rememberShift": "Simpan sesi shift pada perangkat ini",
    "login.submitBtn": "BUKA SESI KERJA",
    "login.submittingBtn": "MEMBUKA BUKU KERJA...",
    "login.seederTitle": "Kartu Akses Seeder (Klik untuk Masuk Cepat)",
    "login.userPassDesc":
      "Operasional Gudang: Buat PR, terbitkan PO, & catat GR.",
    "login.approverPassDesc":
      "Manajer Pemeriksa: Verifikasi & Approve/Reject dokumen PR.",

    "dashboard.activeModules": "MODUL AKTIF",
    "dashboard.coreAlert": "NOTIF INTI",
    "dashboard.titlePrefix": "Buku Ikhtisar & Kendali",
    "dashboard.subtitle":
      "Pemantauan langsung dokumen permintaan, pesanan pemasok, hingga bukti timbang terima fisik di gudang.",
    "dashboard.customizeKernel": "Kustomisasi Kernel",
    "dashboard.reviewBtn": "Periksa",
    "dashboard.createPrBtn": "Buat Dokumen Baru",
    "dashboard.kpi1.label": "01 // KATALOG MASTER",
    "dashboard.kpi1.unit": "SKU Terdaftar",
    "dashboard.kpi1.footer": "STATUS MASTER",
    "dashboard.kpi2.label": "02 // ANTREAN OTORISASI",
    "dashboard.kpi2.unit": "Menunggu Review",
    "dashboard.kpi2.footer": "SIAP DITERBITKAN",
    "dashboard.kpi3.label": "03 // PESANAN PEMASOK",
    "dashboard.kpi3.unit": "Pesanan Terbuka",
    "dashboard.kpi3.footer": "TAHAP TERIMA",
    "dashboard.kpi4.label": "04 // AMBANG MINIMUM",
    "dashboard.kpi4.unit": "Item Kritis",
    "dashboard.kpi4.footer": "NOTIFIKASI EMAIL",
    "dashboard.chart.tag": "CATATAN PENERIMAAN FISIK",
    "dashboard.chart.title": "Akumulasi Volume Barang Masuk",
    "dashboard.chart.desc":
      "Rekapitulasi kuantitas bersih penerimaan barang selama 7 hari terakhir",
    "dashboard.chart.weekTotal": "TOTAL MINGGU INI",
    "dashboard.chart.vsLastWeek": "+14.2% vs minggu lalu",
    "dashboard.chart.dominantCat": "KATEGORI UTAMA",
    "dashboard.chart.dailyAvg": "RATA-RATA HARIAN",
    "dashboard.chart.auditVariance": "SELISIH AUDIT",
    "dashboard.alert.tag": "BON PERINGATAN GUDANG",
    "dashboard.alert.title": "Saldo di Bawah Minimum",
    "dashboard.alert.deficit": "KURANG",
    "dashboard.alert.draftPrBtn": "Susun Pengadaan Baru",
    "dashboard.tx.tag": "JURNAL EKSPEDISI DOKUMEN",
    "dashboard.tx.title": "Mutasi Dokumen Pengadaan Terkini",
    "dashboard.tx.flowLabel": "ALUR BAKU",
    "dashboard.tx.colReg": "No. Registrasi",
    "dashboard.tx.colStage": "Tahap Siklus",
    "dashboard.tx.colWarehouse": "Gudang Tujuan",
    "dashboard.tx.colDate": "Tanggal Catat",
    "dashboard.tx.colStatus": "Status Dokumen",
    "dashboard.tx.colFile": "Berkas",

    "cp.headerTag": "SITE ADMINISTRATION // MICROKERNEL CONTROL PANEL",
    "cp.headerTitle": "Panel Kontrol & Konfigurasi Inti",
    "cp.headerDesc":
      "Pusat pengaturan mandiri ala Gitea & osTicket: kelola judul instansi, multi-bahasa, koneksi database lokal/server, modul add-on, palet warna, dan gateway email inti.",
    "cp.resetDefaultBtn": "Reset Default Kernel",
    "cp.menuTitle": "MENU ADMINISTRASI SISTEM",
    "cp.nav.status": "Status Kernel & Performa",
    "cp.nav.identity": "Identitas & Judul Aplikasi",
    "cp.nav.i18n": "Multi-Bahasa & Kamus Kustom",
    "cp.nav.database": "Koneksi Database & Server",
    "cp.nav.plugins": "Manajemen Plugin (Add-On)",
    "cp.nav.themes": "Palet Tema & Studio Warna",
    "cp.nav.mailer": "Email Inti & Notifikasi",
    "cp.nav.devSdk": "Arsitektur & Panduan Dev",
  },

  en: {
    "common.searchPlaceholder": "Search Document / SKU...",
    "common.controlPanel": "Control Panel",
    "common.switchRole": "Switch",
    "common.activeStaff": "ACTIVE OPERATOR CLEARANCE",
    "common.open": "OPEN",
    "common.reset": "Reset",
    "common.active": "ENABLED",
    "common.inactive": "DISABLED",
    "common.lockedCore": "LOCKED (CORE)",
    "common.language": "Language",

    "nav.cat.overview": "OVERVIEW & MASTER",
    "nav.cat.procurement": "PROCUREMENT CYCLE",
    "nav.cat.warehouse": "WAREHOUSE & COMPLIANCE",
    "nav.cat.system": "KERNEL & SITE ADMIN",
    "plugin.dashboard.name": "Executive Ledger",
    "plugin.products.name": "Master Catalog & Suppliers",
    "plugin.purchaseRequests.name": "Purchase Requests (PR)",
    "plugin.purchaseOrders.name": "Purchase Orders (PO)",
    "plugin.goodsReceipts.name": "Goods Receipts (GR)",
    "plugin.inventory.name": "Stock Balances & Movements",
    "plugin.auditLogs.name": "Compliance Audit Trail",
    "plugin.controlPanel.name": "Control Panel (Site Admin)",

    "login.docStamp": "DOC // ARCHIVE-INTL",
    "login.activeWarehouses": "2 ACTIVE WAREHOUSES",
    "login.ledgerSubtitle": "Master Procurement & Inventory Ledger",
    "login.heroLine1": "Ordered stock,",
    "login.heroLine2": "consistent craft.",
    "login.heroDesc":
      "End-to-end operational ledger for raw materials, commodities, and bar supply. Every incoming batch is tracked from initial requisition to verified warehouse receipt.",
    "login.chainTitle": "Transaction Document Chain (PRD Standard)",
    "login.formTag": "OPERATOR AUTHENTICATION FORM",
    "login.welcomeTitle": "Sign In to Ledger",
    "login.welcomeDesc":
      "Use your warehouse staff or approver manager credentials to access procurement records.",
    "login.usernameLabel": "Operator ID / Username",
    "login.passwordLabel": "Password",
    "login.rememberShift": "Keep shift session active on this device",
    "login.submitBtn": "OPEN WORKBOOK SESSION",
    "login.submittingBtn": "AUTHENTICATING...",
    "login.seederTitle": "Quick Seeder Access Passes (1-Click Sign In)",
    "login.userPassDesc":
      "Warehouse Operations: Draft PR, issue PO, & record GR.",
    "login.approverPassDesc":
      "Approver Manager: Review & Approve/Reject PR tickets.",

    "dashboard.activeModules": "ACTIVE MODULES",
    "dashboard.coreAlert": "CORE ALERT",
    "dashboard.titlePrefix": "Operations & Supply Ledger:",
    "dashboard.subtitle":
      "Real-time tracking of purchase requisitions, supplier orders, and physical goods receipts across active warehouses.",
    "dashboard.customizeKernel": "Customize Kernel",
    "dashboard.reviewBtn": "Review",
    "dashboard.createPrBtn": "New Requisition",
    "dashboard.kpi1.label": "01 // MASTER CATALOG",
    "dashboard.kpi1.unit": "Registered SKUs",
    "dashboard.kpi1.footer": "MASTER STATUS",
    "dashboard.kpi2.label": "02 // APPROVAL QUEUE",
    "dashboard.kpi2.unit": "Pending Review",
    "dashboard.kpi2.footer": "READY FOR PO",
    "dashboard.kpi3.label": "03 // SUPPLIER ORDERS",
    "dashboard.kpi3.unit": "Open Orders",
    "dashboard.kpi3.footer": "RECEIPT STAGE",
    "dashboard.kpi4.label": "04 // CRITICAL THRESHOLD",
    "dashboard.kpi4.unit": "Critical Items",
    "dashboard.kpi4.footer": "EMAIL ALERT",
    "dashboard.chart.tag": "PHYSICAL INTAKE LOG",
    "dashboard.chart.title": "Weekly Incoming Volume",
    "dashboard.chart.desc":
      "Net weight & quantity of verified goods receipts over the last 7 days",
    "dashboard.chart.weekTotal": "TOTAL THIS WEEK",
    "dashboard.chart.vsLastWeek": "+14.2% vs last week",
    "dashboard.chart.dominantCat": "PRIMARY CATEGORY",
    "dashboard.chart.dailyAvg": "DAILY AVERAGE",
    "dashboard.chart.auditVariance": "AUDIT VARIANCE",
    "dashboard.alert.tag": "REORDER REQUISITION SLIP",
    "dashboard.alert.title": "Below Minimum Stock",
    "dashboard.alert.deficit": "SHORT",
    "dashboard.alert.draftPrBtn": "Draft New Requisition",
    "dashboard.tx.tag": "DOCUMENT DISPATCH REGISTER",
    "dashboard.tx.title": "Recent Procurement Document Movements",
    "dashboard.tx.flowLabel": "STANDARD PIPELINE",
    "dashboard.tx.colReg": "Registration No.",
    "dashboard.tx.colStage": "Cycle Stage",
    "dashboard.tx.colWarehouse": "Target Warehouse",
    "dashboard.tx.colDate": "Recorded Date",
    "dashboard.tx.colStatus": "Document Status",
    "dashboard.tx.colFile": "Record",

    "cp.headerTag": "SITE ADMINISTRATION // MICROKERNEL CONTROL PANEL",
    "cp.headerTitle": "System Control Panel & Core Configuration",
    "cp.headerDesc":
      "Self-hosted administration center inspired by Gitea & osTicket: configure branding, multi-language dictionaries, hybrid DB connections, add-on plugins, themes, and email alerts.",
    "cp.resetDefaultBtn": "Reset Kernel Defaults",
    "cp.menuTitle": "SITE ADMINISTRATION MENU",
    "cp.nav.status": "Kernel Status & Telemetry",
    "cp.nav.identity": "Identity & App Branding",
    "cp.nav.i18n": "Multi-Language & Custom Terms",
    "cp.nav.database": "Database & Server Node",
    "cp.nav.plugins": "Plugin Manager (Add-Ons)",
    "cp.nav.themes": "Theme & Color Studio",
    "cp.nav.mailer": "Core Email & Notifications",
    "cp.nav.devSdk": "Developer SDK & Guide",
  },

  ja: {
    "common.searchPlaceholder": "伝票番号 / SKUを検索...",
    "common.controlPanel": "管理パネル",
    "common.switchRole": "切替",
    "common.activeStaff": "現在の担当者権限",
    "common.open": "開く",
    "common.reset": "リセット",
    "common.active": "有効",
    "common.inactive": "無効",
    "common.lockedCore": "コア固定",
    "common.language": "言語設定",

    "nav.cat.overview": "概要・マスタ管理",
    "nav.cat.procurement": "調達サイクル",
    "nav.cat.warehouse": "倉庫在庫・監査",
    "nav.cat.system": "カーネル・システム管理",
    "plugin.dashboard.name": "総合台帳ダッシュボード",
    "plugin.products.name": "品目マスタ・仕入先",
    "plugin.purchaseRequests.name": "購買依頼伝票 (PR)",
    "plugin.purchaseOrders.name": "発注伝票 (PO)",
    "plugin.goodsReceipts.name": "入庫検収伝票 (GR)",
    "plugin.inventory.name": "倉庫在庫・受払台帳",
    "plugin.auditLogs.name": "システム監査証跡",
    "plugin.controlPanel.name": "システム管理パネル",

    "login.docStamp": "DOC // ARCHIVE-JPN",
    "login.activeWarehouses": "稼働倉庫: 2拠点",
    "login.ledgerSubtitle": "購買調達・倉庫在庫統合台帳",
    "login.heroLine1": "整然たる在庫、",
    "login.heroLine2": "揺るぎない一杯の品質。",
    "login.heroDesc":
      "生豆・乳製品・資材の購買依頼から承認、発注、入庫検収までを一元記録するマイクロカーネル台帳システム。",
    "login.chainTitle": "標準調達ワークフロー (PRD準拠)",
    "login.formTag": "担当者認証フォーム",
    "login.welcomeTitle": "業務台帳へログイン",
    "login.welcomeDesc":
      "倉庫担当者または承認マネージャーのアカウントでログインしてください。",
    "login.usernameLabel": "担当者ID / ユーザー名",
    "login.passwordLabel": "パスワード",
    "login.rememberShift": "この端末でシフトセッションを保持する",
    "login.submitBtn": "業務セッションを開始",
    "login.submittingBtn": "認証処理中...",
    "login.seederTitle": "クイックデモアカウント (1クリックログイン)",
    "login.userPassDesc": "倉庫担当: PR作成・PO発行・GR入庫検収",
    "login.approverPassDesc": "承認責任者: PR内容の審査・承認/却下",

    "dashboard.activeModules": "有効モジュール",
    "dashboard.coreAlert": "コア通知先",
    "dashboard.titlePrefix": "購買・在庫統括台帳:",
    "dashboard.subtitle":
      "購買依頼伝票、仕入先発注、および各倉庫での入庫検収状況をリアルタイムに監視します。",
    "dashboard.customizeKernel": "カーネル設定",
    "dashboard.reviewBtn": "審査待ち",
    "dashboard.createPrBtn": "新規購買依頼",
    "dashboard.kpi1.label": "01 // 品目マスタ",
    "dashboard.kpi1.unit": "登録SKU数",
    "dashboard.kpi1.footer": "マスタ状態",
    "dashboard.kpi2.label": "02 // 承認待ちPR",
    "dashboard.kpi2.unit": "審査待ち伝票",
    "dashboard.kpi2.footer": "PO発行可能",
    "dashboard.kpi3.label": "03 // 発注残 (PO)",
    "dashboard.kpi3.unit": "未完納PO",
    "dashboard.kpi3.footer": "入庫ステータス",
    "dashboard.kpi4.label": "04 // 安全在庫割れ",
    "dashboard.kpi4.unit": "要補充品目",
    "dashboard.kpi4.footer": "メール通知",
    "dashboard.chart.tag": "入庫計量ログ",
    "dashboard.chart.title": "週間入庫ボリューム推移",
    "dashboard.chart.desc": "過去7日間の検収済み純入庫量集計",
    "dashboard.chart.weekTotal": "今週累計",
    "dashboard.chart.vsLastWeek": "+14.2% 先週比",
    "dashboard.chart.dominantCat": "主要カテゴリ",
    "dashboard.chart.dailyAvg": "日次平均",
    "dashboard.chart.auditVariance": "棚卸差異",
    "dashboard.alert.tag": "補充勧告スリップ",
    "dashboard.alert.title": "安全在庫基準以下",
    "dashboard.alert.deficit": "不足",
    "dashboard.alert.draftPrBtn": "補充PRを作成する",
    "dashboard.tx.tag": "伝票処理レジスタ",
    "dashboard.tx.title": "最新の購買・入庫伝票履歴",
    "dashboard.tx.flowLabel": "標準フロー",
    "dashboard.tx.colReg": "伝票番号",
    "dashboard.tx.colStage": "工程フェーズ",
    "dashboard.tx.colWarehouse": "対象倉庫",
    "dashboard.tx.colDate": "記帳日",
    "dashboard.tx.colStatus": "ステータス",
    "dashboard.tx.colFile": "詳細",

    "cp.headerTag": "SITE ADMINISTRATION // MICROKERNEL CONTROL PANEL",
    "cp.headerTitle": "システム管理・コア設定パネル",
    "cp.headerDesc":
      "GiteaおよびosTicketに着想を得た管理センター：ブランド名、多言語辞書、DB接続モード、プラグイン、カラーテーマ、コア通知メールを一元管理します。",
    "cp.resetDefaultBtn": "初期設定に戻す",
    "cp.menuTitle": "システム管理メニュー",
    "cp.nav.status": "カーネル状態・速度計測",
    "cp.nav.identity": "アプリ名・組織ブランディング",
    "cp.nav.i18n": "多言語・カスタム辞書編集",
    "cp.nav.database": "DB接続モード・サーバー設定",
    "cp.nav.plugins": "プラグイン管理 (Add-Ons)",
    "cp.nav.themes": "テーマ・カラーパレット",
    "cp.nav.mailer": "コア通知メール設定",
    "cp.nav.devSdk": "開発者向け拡張ガイド",
  },
};
