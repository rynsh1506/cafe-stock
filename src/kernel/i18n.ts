export type BuiltInLocaleCode = "id" | "en" | "ja";
export type LocaleCode = string;

export interface LocaleMetadata {
  code: LocaleCode;
  name: string;
  nativeName: string;
  flagCode: string;
  isBuiltIn: boolean;
}

export const BUILTIN_LOCALES: LocaleMetadata[] = [
  {
    code: "id",
    name: "Indonesian",
    nativeName: "Bahasa Indonesia",
    flagCode: "ID",
    isBuiltIn: true,
  },
  {
    code: "en",
    name: "English",
    nativeName: "English (International)",
    flagCode: "EN",
    isBuiltIn: true,
  },
  {
    code: "ja",
    name: "Japanese",
    nativeName: "日本語 (Roastery Standard)",
    flagCode: "JA",
    isBuiltIn: true,
  },
];

/**
 * Complete, strictly-typed translation dictionary covering all system UI elements
 * across Login, Sidebar, Header, Dashboard, Module Placeholders, and Control Panel.
 */
export interface TranslationDictionary {
  // Common & Global UI
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
  "common.apply": string;
  "common.inUse": string;
  "common.clear": string;
  "common.delete": string;

  // Sidebar Categories & Plugin Names
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

  // Module Placeholder Descriptions (App.tsx)
  "mod.products.desc": string;
  "mod.pr.desc": string;
  "mod.po.desc": string;
  "mod.gr.desc": string;
  "mod.inventory.desc": string;
  "mod.audit.desc": string;

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
  "login.defaultPassHint": string;
  "login.rememberShift": string;
  "login.submitBtn": string;
  "login.submittingBtn": string;
  "login.seederTitle": string;
  "login.userPassDesc": string;
  "login.approverPassDesc": string;
  "login.setupTag": string;
  "login.setupTitle": string;
  "login.setupDesc": string;
  "login.registerTitle": string;
  "login.registerDesc": string;
  "login.fullNameLabel": string;
  "login.emailLabel": string;
  "login.confirmPassLabel": string;
  "login.roleLabel": string;
  "login.roleApprover": string;
  "login.roleUser": string;
  "login.createFirstBtn": string;
  "login.registerBtn": string;
  "login.switchToRegister": string;
  "login.switchToLogin": string;
  "login.errEmpty": string;
  "login.errPassMismatch": string;
  "login.errInvalidCreds": string;
  "login.errUserExists": string;

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

  // Control Panel Navigation & Header
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

  // Control Panel - Section 1: Status
  "cp.status.latencyTitle": string;
  "cp.status.addonsTitle": string;
  "cp.status.dbModeTitle": string;
  "cp.status.specHeader": string;
  "cp.status.rowIdentity": string;
  "cp.status.rowStorage": string;
  "cp.status.rowLang": string;
  "cp.status.rowEmail": string;
  "cp.status.customTerms": string;

  // Control Panel - Section 2: Identity & Branding
  "cp.identity.presetLabel": string;
  "cp.identity.presetRoastery": string;
  "cp.identity.presetWarehouse": string;
  "cp.identity.presetTicketing": string;
  "cp.identity.appNameLabel": string;
  "cp.identity.appSubLabel": string;
  "cp.identity.orgNameLabel": string;
  "cp.identity.itemTermLabel": string;
  "cp.identity.prefixPrLabel": string;
  "cp.identity.prefixPoLabel": string;
  "cp.identity.prefixGrLabel": string;

  // Control Panel - Section 3: Multi-Language & Custom Locale Creator
  "cp.i18n.desc": string;
  "cp.i18n.activeLocalesLabel": string;
  "cp.i18n.builtInBadge": string;
  "cp.i18n.customBadge": string;
  "cp.i18n.addLangTitle": string;
  "cp.i18n.addLangCodePlaceholder": string;
  "cp.i18n.addLangNamePlaceholder": string;
  "cp.i18n.addLangBaseLabel": string;
  "cp.i18n.addLangBtn": string;
  "cp.i18n.editorTitle": string;
  "cp.i18n.editorSubtitle": string;
  "cp.i18n.resetDictBtn": string;
  "cp.i18n.searchPlaceholder": string;
  "cp.i18n.defaultTextPrefix": string;

  // Control Panel - Section 4: Database Adapter
  "cp.db.desc": string;
  "cp.db.localTitle": string;
  "cp.db.localDesc": string;
  "cp.db.remoteTitle": string;
  "cp.db.remoteDesc": string;
  "cp.db.remoteHeader": string;
  "cp.db.hostUrlLabel": string;
  "cp.db.tokenLabel": string;

  // Control Panel - Section 6: Themes
  "cp.themes.pickerHeader": string;
  "cp.themes.tokenBgMain": string;
  "cp.themes.tokenBgSurface": string;
  "cp.themes.tokenBgSidebar": string;
  "cp.themes.tokenTextMain": string;
  "cp.themes.tokenBorder": string;
  "cp.themes.tokenAccent": string;

  // Control Panel - Section 7: Mailer
  "cp.mailer.smtpEnabled": string;
  "cp.mailer.smtpDisabled": string;
  "cp.mailer.testSentNotice": string;
  "cp.mailer.coreEmailLabel": string;
  "cp.mailer.approverEmailLabel": string;
  "cp.mailer.smtpHostLabel": string;
  "cp.mailer.subjectPrefixLabel": string;
  "cp.mailer.triggersHeader": string;
  "cp.mailer.trigPrSub": string;
  "cp.mailer.trigPrApp": string;
  "cp.mailer.trigPrRej": string;
  "cp.mailer.trigPoOrd": string;
  "cp.mailer.trigGrRec": string;
  "cp.mailer.trigCrit": string;
  "cp.mailer.outboxHeader": string;
  "cp.mailer.sendTestBtn": string;

  // Control Panel - Section 8: Dev SDK
  "cp.sdk.boxTitle": string;
  "cp.sdk.step1": string;
  "cp.sdk.step2": string;
  "cp.sdk.step3": string;
}

export type TranslationKey = keyof TranslationDictionary;

export const BUILTIN_TRANSLATIONS: Record<
  BuiltInLocaleCode,
  TranslationDictionary
> = {
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
    "common.apply": "TERAPKAN",
    "common.inUse": "● DIGUNAKAN",
    "common.clear": "Bersihkan",
    "common.delete": "Hapus",

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

    "mod.products.desc":
      "Pencatatan spesifikasi SKU item, satuan takar, batas stok minimum, serta daftar pemasok resmi dan titik gudang sesuai PRD Bagian 4.2.",
    "mod.pr.desc":
      "Penyusunan permintaan pengadaan menggunakan payload agregat (header + daftar item), mulai dari status DRAFT, SUBMITTED, hingga otorisasi APPROVE / REJECT.",
    "mod.po.desc":
      "Penerbitan pesanan resmi dari permintaan berstatus APPROVED, penunjukan pemasok aktif, penomoran otomatis, dan pengiriman status ORDERED.",
    "mod.gr.desc":
      "Verifikasi fisik kedatangan barang terhadap dokumen PO dengan validasi ketat kuantitas sisa pesanan serta pembaruan saldo gudang secara transaksional.",
    "mod.inventory.desc":
      "Pemisahan tegas antara tabel saldo berjalan (inventory_balances) dan buku riwayat mutasi (append-only inventory_movements) per lokasi gudang.",
    "mod.audit.desc":
      "Rekaman permanen setiap tindakan krusial (Create, Submit, Approve, Reject, PO Ordered, GR Received) lengkap dengan identitas petugas dan waktu kejadian.",

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
    "login.defaultPassHint": "awaan: password123",
    "login.rememberShift": "Simpan sesi shift pada perangkat ini",
    "login.submitBtn": "BUKA SESI KERJA",
    "login.submittingBtn": "MEMBUKA BUKU KERJA...",
    "login.seederTitle": "Kartu Akses Seeder (Klik untuk Masuk Cepat)",
    "login.userPassDesc":
      "Operasional Gudang: Buat PR, terbitkan PO, & catat GR.",
    "login.approverPassDesc":
      "Manajer Pemeriksa: Verifikasi & Approve/Reject dokumen PR.",
    "login.setupTag": "INSTALASI AWAL SISTEM // FIRST-RUN SETUP",
    "login.setupTitle": "Buat Akun Utama Pertama",
    "login.setupDesc":
      "Selamat datang! Karena aplikasi ini baru pertama kali dijalankan, silakan buat akun Administrator / Pemilik pertama Anda untuk mengaktifkan buku kerja.",
    "login.registerTitle": "Daftarkan Akun Petugas Baru",
    "login.registerDesc":
      "Tambahkan akun petugas gudang (USER) atau manajer otorisasi (APPROVER) baru ke dalam sistem.",
    "login.fullNameLabel": "Nama Lengkap",
    "login.emailLabel": "Alamat Email",
    "login.confirmPassLabel": "Konfirmasi Kata Sandi",
    "login.roleLabel": "Peran Otorisasi (Role)",
    "login.roleApprover": "APPROVER / ADMIN (Bisa Approve PR & Kelola Sistem)",
    "login.roleUser": "USER / STAFF GUDANG (Buat PR, PO, & Terima Barang)",
    "login.createFirstBtn": "BUAT AKUN UTAMA & MULAI APLIKASI",
    "login.registerBtn": "DAFTARKAN AKUN BARU",
    "login.switchToRegister": "Belum punya akun? Buat Akun Baru",
    "login.switchToLogin": "Sudah punya akun? Masuk di sini",
    "login.errEmpty": "Mohon lengkapi seluruh kolom wajib.",
    "login.errPassMismatch": "Konfirmasi kata sandi tidak cocok.",
    "login.errInvalidCreds":
      "Username/Email atau kata sandi tidak ditemukan atau salah.",
    "login.errUserExists": "Username atau email tersebut sudah terdaftar.",

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
    "cp.nav.i18n": "Multi-Bahasa & Bahasa Kustom",
    "cp.nav.database": "Koneksi Database & Server",
    "cp.nav.plugins": "Manajemen Plugin (Add-On)",
    "cp.nav.themes": "Palet Tema & Studio Warna",
    "cp.nav.mailer": "Email Inti & Notifikasi",
    "cp.nav.devSdk": "Arsitektur & Panduan Dev",

    "cp.status.latencyTitle": "LATENSI BACA / TULIS",
    "cp.status.addonsTitle": "MODUL ADD-ON AKTIF",
    "cp.status.dbModeTitle": "MODE PENYIMPANAN DB",
    "cp.status.specHeader": "SPESIFIKASI KONFIGURASI KERNEL SAAT INI",
    "cp.status.rowIdentity": "Identitas Aplikasi",
    "cp.status.rowStorage": "Engine Penyimpanan",
    "cp.status.rowLang": "Paket Bahasa Aktif",
    "cp.status.rowEmail": "Tujuan Email Inti",
    "cp.status.customTerms": "istilah kustom",

    "cp.identity.presetLabel": "PILIH PRESET PROFIL PENGGUNAAN (1-KLIK)",
    "cp.identity.presetRoastery": "Roastery & Cafe",
    "cp.identity.presetWarehouse": "ERP Gudang Umum",
    "cp.identity.presetTicketing": "IT Ticketing Desk",
    "cp.identity.appNameLabel": "Judul Utama Aplikasi",
    "cp.identity.appSubLabel": "Subjudul / Tagline Sistem",
    "cp.identity.orgNameLabel": "Nama Organisasi / Cabang",
    "cp.identity.itemTermLabel": "Sebutan Item (Terminologi)",
    "cp.identity.prefixPrLabel": "Prefix Request (PR)",
    "cp.identity.prefixPoLabel": "Prefix Order (PO)",
    "cp.identity.prefixGrLabel": "Prefix Receipt (GR)",

    "cp.i18n.desc":
      "Pilih paket bahasa yang tersedia, buat bahasa baru sendiri (misal: Jawa, Sunda, Jerman, Mandarin), atau sesuaikan setiap kalimat antarmuka.",
    "cp.i18n.activeLocalesLabel": "DAFTAR BAHASA TERPASANG (BUILT-IN & KUSTOM)",
    "cp.i18n.builtInBadge": "BAWAAN",
    "cp.i18n.customBadge": "KUSTOM",
    "cp.i18n.addLangTitle": "TAMBAH BAHASA BARU SENDIRI (CUSTOM LOCALE)",
    "cp.i18n.addLangCodePlaceholder": "Kode (cth: jv, de, zh)",
    "cp.i18n.addLangNamePlaceholder": "Nama Bahasa (cth: Basa Jawa, Deutsch)",
    "cp.i18n.addLangBaseLabel": "Salin Kamus Dasar Dari:",
    "cp.i18n.addLangBtn": "+ Buat Bahasa Baru",
    "cp.i18n.editorTitle": "EDITOR KAMUS BAHASA AKTIF",
    "cp.i18n.editorSubtitle":
      "Ubah teks pada kolom kanan untuk menyesuaikan kalimat pada bahasa yang sedang dipilih.",
    "cp.i18n.resetDictBtn": "Reset Perubahan Kamus",
    "cp.i18n.searchPlaceholder": "Cari kunci atau teks kamus...",
    "cp.i18n.defaultTextPrefix": "Teks Dasar",

    "cp.db.desc":
      "Pilih Standalone Local jika dipakai pada 1 komputer mandiri, atau Shared Server Node agar banyak karyawan (.exe & .apk) terhubung ke database yang sama.",
    "cp.db.localTitle": "1. Standalone Local (Embedded)",
    "cp.db.localDesc":
      "Berjalan 100% lokal di dalam Tauri tanpa server luar. Sangat kencang (<0.1 ms), cocok untuk 1 perangkat mandiri atau mode offline.",
    "cp.db.remoteTitle": "2. Shared Server Node (Multi-Device)",
    "cp.db.remoteDesc":
      "Menyambungkan aplikasi .exe & .apk karyawan ke node server kantor (ElysiaJS/PostgreSQL) agar tiket PR & Approval tersinkronisasi real-time.",
    "cp.db.remoteHeader": "● KONFIGURASI ENDPOINT SERVER BERSAMA",
    "cp.db.hostUrlLabel": "URL Host Server / API Node",
    "cp.db.tokenLabel": "Token Otorisasi Instansi",

    "cp.themes.pickerHeader":
      "KUSTOMISASI TOKEN WARNA MANUAL (LIVE HEX PICKER)",
    "cp.themes.tokenBgMain": "Latar Utama (Workspace)",
    "cp.themes.tokenBgSurface": "Permukaan Kertas / Panel",
    "cp.themes.tokenBgSidebar": "Latar Navigasi Samping",
    "cp.themes.tokenTextMain": "Tinta Teks Utama",
    "cp.themes.tokenBorder": "Garis Arsitektural Panel",
    "cp.themes.tokenAccent": "Warna Aksen Utama",

    "cp.mailer.smtpEnabled": "GATEWAY EMAIL: AKTIF",
    "cp.mailer.smtpDisabled": "GATEWAY EMAIL: NONAKTIF",
    "cp.mailer.testSentNotice": "✓ Paket uji notifikasi berhasil dikirim ke:",
    "cp.mailer.coreEmailLabel": "Alamat Email Inti (Penerima Utama / Admin)",
    "cp.mailer.approverEmailLabel": "Email Meja Approver / Manajer",
    "cp.mailer.smtpHostLabel": "SMTP Relay Host & Port",
    "cp.mailer.subjectPrefixLabel": "Tag Prefix Subjek Email",
    "cp.mailer.triggersHeader": "ATURAN PEMICU NOTIFIKASI OTOMATIS",
    "cp.mailer.trigPrSub": "Saat Tiket PR Baru Diajukan (SUBMITTED)",
    "cp.mailer.trigPrApp": "Saat PR Disetujui Approver (APPROVED)",
    "cp.mailer.trigPrRej": "Saat PR Ditolak Approver (REJECTED)",
    "cp.mailer.trigPoOrd": "Saat PO Diterbitkan ke Pemasok (ORDERED)",
    "cp.mailer.trigGrRec": "Saat Barang Masuk Diterima Gudang (GR)",
    "cp.mailer.trigCrit": "Saat Saldo Stok Menyentuh Batas Kritis",
    "cp.mailer.outboxHeader": "LOG OUTBOX NOTIFIKASI EMAIL",
    "cp.mailer.sendTestBtn": "Kirim Uji Email ke Inti",

    "cp.sdk.boxTitle": "Arsitektur Modular yang Bersih bagi Programmer:",
    "cp.sdk.step1":
      "Tambah Plugin / Modul Baru: Cukup daftarkan objek manifest di src/kernel/registry.ts.",
    "cp.sdk.step2":
      "Tambah Bahasa Baru: Bisa langsung lewat menu ADM-03 di atas atau melalui src/kernel/i18n.ts.",
    "cp.sdk.step3":
      "Tambah Tema Palet Baru: Cukup tambahkan objek warna pada THEME_PALETTES di src/kernel/registry.ts.",
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
    "common.apply": "APPLY",
    "common.inUse": "● ACTIVE",
    "common.clear": "Clear",
    "common.delete": "Delete",

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

    "mod.products.desc":
      "Manage item SKU specifications, measurement units, minimum stock reorder thresholds, verified suppliers, and warehouse locations per PRD Section 4.2.",
    "mod.pr.desc":
      "Create procurement requisitions using an aggregate payload (header + line items), progressing from DRAFT and SUBMITTED to APPROVE / REJECT authorization.",
    "mod.po.desc":
      "Issue official supplier purchase orders from APPROVED requisitions, assign active vendors, generate PO numbers, and dispatch ORDERED status.",
    "mod.gr.desc":
      "Verify physical incoming deliveries against open POs with strict remaining-quantity validation and atomic stock balance transactions.",
    "mod.inventory.desc":
      "Strict separation between current warehouse stock balances (inventory_balances) and append-only movement history (inventory_movements).",
    "mod.audit.desc":
      "Immutable audit trail recording every critical state transition (Create, Submit, Approve, Reject, PO Ordered, GR Received) with actor and timestamp.",

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
    "login.defaultPassHint": "Default: password123",
    "login.rememberShift": "Keep shift session active on this device",
    "login.submitBtn": "OPEN WORKBOOK SESSION",
    "login.submittingBtn": "AUTHENTICATING...",
    "login.seederTitle": "Quick Seeder Access Passes (1-Click Sign In)",
    "login.userPassDesc":
      "Warehouse Operations: Draft PR, issue PO, & record GR.",
    "login.approverPassDesc":
      "Approver Manager: Review & Approve/Reject PR tickets.",
    "login.setupTag": "INITIAL SYSTEM INSTALLATION // FIRST-RUN SETUP",
    "login.setupTitle": "Create Primary Admin Account",
    "login.setupDesc":
      "Welcome! Since this is a fresh installation, please create your first Administrator / Owner account to initialize the workspace.",
    "login.registerTitle": "Register New Operator Account",
    "login.registerDesc":
      "Add a new warehouse operator (USER) or authorization manager (APPROVER) account to the system.",
    "login.fullNameLabel": "Full Name",
    "login.emailLabel": "Email Address",
    "login.confirmPassLabel": "Confirm Password",
    "login.roleLabel": "Authorization Role",
    "login.roleApprover": "APPROVER / ADMIN (Approve PRs & Manage System)",
    "login.roleUser": "USER / WAREHOUSE STAFF (Draft PR, PO, & Receive Goods)",
    "login.createFirstBtn": "CREATE PRIMARY ACCOUNT & START",
    "login.registerBtn": "REGISTER NEW ACCOUNT",
    "login.switchToRegister": "Need another account? Register New User",
    "login.switchToLogin": "Already have an account? Sign In here",
    "login.errEmpty": "Please fill in all required fields.",
    "login.errPassMismatch": "Password confirmation does not match.",
    "login.errInvalidCreds": "Invalid username/email or password.",
    "login.errUserExists": "Username or email is already registered.",

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
    "cp.nav.i18n": "Languages & Custom Dictionary",
    "cp.nav.database": "Database & Server Node",
    "cp.nav.plugins": "Plugin Manager (Add-Ons)",
    "cp.nav.themes": "Theme & Color Studio",
    "cp.nav.mailer": "Core Email & Notifications",
    "cp.nav.devSdk": "Developer SDK & Guide",

    "cp.status.latencyTitle": "READ / WRITE LATENCY",
    "cp.status.addonsTitle": "ACTIVE ADD-ON MODULES",
    "cp.status.dbModeTitle": "DB STORAGE DRIVER",
    "cp.status.specHeader": "CURRENT KERNEL CONFIGURATION SUMMARY",
    "cp.status.rowIdentity": "Application Identity",
    "cp.status.rowStorage": "Storage Engine",
    "cp.status.rowLang": "Active Language Pack",
    "cp.status.rowEmail": "Core Alert Destination",
    "cp.status.customTerms": "custom terms",

    "cp.identity.presetLabel": "SELECT INDUSTRY PROFILE PRESET (1-CLICK)",
    "cp.identity.presetRoastery": "Roastery & Cafe",
    "cp.identity.presetWarehouse": "General Warehouse ERP",
    "cp.identity.presetTicketing": "IT Ticketing Desk",
    "cp.identity.appNameLabel": "Primary Application Title",
    "cp.identity.appSubLabel": "System Subtitle / Tagline",
    "cp.identity.orgNameLabel": "Organization / Branch Name",
    "cp.identity.itemTermLabel": "Commodity / Item Terminology",
    "cp.identity.prefixPrLabel": "Request Prefix (PR)",
    "cp.identity.prefixPoLabel": "Order Prefix (PO)",
    "cp.identity.prefixGrLabel": "Receipt Prefix (GR)",

    "cp.i18n.desc":
      "Switch between installed language packs, create your own custom language pack (e.g., German, Spanish, Javanese), or override any interface phrase.",
    "cp.i18n.activeLocalesLabel":
      "INSTALLED LANGUAGE PACKS (BUILT-IN & CUSTOM)",
    "cp.i18n.builtInBadge": "BUILT-IN",
    "cp.i18n.customBadge": "CUSTOM",
    "cp.i18n.addLangTitle": "CREATE NEW CUSTOM LANGUAGE PACK",
    "cp.i18n.addLangCodePlaceholder": "Code (e.g. de, es, jv)",
    "cp.i18n.addLangNamePlaceholder": "Language Name (e.g. Deutsch, Español)",
    "cp.i18n.addLangBaseLabel": "Clone Base Dictionary From:",
    "cp.i18n.addLangBtn": "+ Add Custom Language",
    "cp.i18n.editorTitle": "ACTIVE LANGUAGE DICTIONARY EDITOR",
    "cp.i18n.editorSubtitle":
      "Type in the right column to customize any phrase for the currently selected language in real time.",
    "cp.i18n.resetDictBtn": "Reset Dictionary Overrides",
    "cp.i18n.searchPlaceholder": "Search dictionary key or phrase...",
    "cp.i18n.defaultTextPrefix": "Base Text",

    "cp.db.desc":
      "Select Standalone Local for single-machine speed, or Shared Server Node so multiple employee devices (.exe & .apk) sync to the same database.",
    "cp.db.localTitle": "1. Standalone Local (Embedded)",
    "cp.db.localDesc":
      "Runs 100% locally inside Tauri without an external server. Ultra-fast (<0.1 ms), ideal for single-terminal use or offline testing.",
    "cp.db.remoteTitle": "2. Shared Server Node (Multi-Device)",
    "cp.db.remoteDesc":
      "Connects employee .exe & .apk apps to a shared office server node (ElysiaJS/PostgreSQL) for real-time PR & Approval synchronization.",
    "cp.db.remoteHeader": "● SHARED SERVER ENDPOINT CONFIGURATION",
    "cp.db.hostUrlLabel": "Server Host URL / API Node",
    "cp.db.tokenLabel": "Instance Authorization Token",

    "cp.themes.pickerHeader": "MANUAL COLOR TOKEN CUSTOMIZER (LIVE HEX PICKER)",
    "cp.themes.tokenBgMain": "Main Workspace Background",
    "cp.themes.tokenBgSurface": "Card / Sheet Surface",
    "cp.themes.tokenBgSidebar": "Sidebar Navigation Background",
    "cp.themes.tokenTextMain": "Primary Ink Text",
    "cp.themes.tokenBorder": "Architectural Hairline Border",
    "cp.themes.tokenAccent": "Primary Accent Color",

    "cp.mailer.smtpEnabled": "EMAIL GATEWAY: ENABLED",
    "cp.mailer.smtpDisabled": "EMAIL GATEWAY: DISABLED",
    "cp.mailer.testSentNotice": "✓ Test notification packet dispatched to:",
    "cp.mailer.coreEmailLabel": "Core Admin Email (Primary Recipient)",
    "cp.mailer.approverEmailLabel": "Approver Desk Group Email",
    "cp.mailer.smtpHostLabel": "SMTP Relay Host & Port",
    "cp.mailer.subjectPrefixLabel": "Email Subject Prefix Tag",
    "cp.mailer.triggersHeader": "AUTOMATIC NOTIFICATION TRIGGER RULES",
    "cp.mailer.trigPrSub": "When a new PR ticket is submitted (SUBMITTED)",
    "cp.mailer.trigPrApp": "When a PR is approved by manager (APPROVED)",
    "cp.mailer.trigPrRej": "When a PR is rejected by manager (REJECTED)",
    "cp.mailer.trigPoOrd": "When a PO is dispatched to supplier (ORDERED)",
    "cp.mailer.trigGrRec": "When Goods Receipt is recorded (GR RECEIVED)",
    "cp.mailer.trigCrit": "When stock balance drops below minimum threshold",
    "cp.mailer.outboxHeader": "EMAIL NOTIFICATION OUTBOX LOG",
    "cp.mailer.sendTestBtn": "Send Test Email to Core",

    "cp.sdk.boxTitle": "Clean Modular Architecture for Developers:",
    "cp.sdk.step1":
      "Add New Plugin / Module: Register a manifest entry in src/kernel/registry.ts.",
    "cp.sdk.step2":
      "Add New Language: Create it live in ADM-03 above or add to src/kernel/i18n.ts.",
    "cp.sdk.step3":
      "Add New Color Theme: Append a palette object to THEME_PALETTES in src/kernel/registry.ts.",
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
    "common.apply": "適用する",
    "common.inUse": "● 適用中",
    "common.clear": "クリア",
    "common.delete": "削除",

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

    "mod.products.desc":
      "PRD 4.2節に基づき、品目SKU仕様、計量単位、安全在庫基準値、認定仕入先、および倉庫拠点を一元管理します。",
    "mod.pr.desc":
      "ヘッダと明細行を含むアグリゲートペイロードで購買依頼を作成し、DRAFT・SUBMITTEDからAPPROVE / REJECT承認までを管理します。",
    "mod.po.desc":
      "承認済み(APPROVED)の購買依頼から正式な発注書(PO)を発行し、仕入先の指定、PO番号自動採番、ORDERED送信を行います。",
    "mod.gr.desc":
      "発注残数量の厳密なバリデーションを行い、入庫検収(GR)と同時に倉庫在庫残高をトランザクション更新します。",
    "mod.inventory.desc":
      "現在庫残高テーブル(inventory_balances)と追記専用の受払履歴(inventory_movements)を厳密に分離して管理します。",
    "mod.audit.desc":
      "すべての重要操作（作成・申請・承認・却下・発注・入庫）を実行者とタイムスタンプ付きで永久記録します。",

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
    "login.defaultPassHint": "初期値: password123",
    "login.rememberShift": "この端末でシフトセッションを保持する",
    "login.submitBtn": "業務セッションを開始",
    "login.submittingBtn": "認証処理中...",
    "login.seederTitle": "クイックデモアカウント (1クリックログイン)",
    "login.userPassDesc": "倉庫担当: PR作成・PO発行・GR入庫検収",
    "login.approverPassDesc": "承認責任者: PR内容の審査・承認/却下",
    "login.setupTag": "初期システムセットアップ // FIRST-RUN SETUP",
    "login.setupTitle": "初期管理者アカウントの作成",
    "login.setupDesc":
      "ようこそ！初回起動のため、システムを利用開始するための最初の管理者（オーナー）アカウントを作成してください。",
    "login.registerTitle": "新規担当者アカウント登録",
    "login.registerDesc":
      "新しい倉庫担当者(USER)または承認責任者(APPROVER)アカウントを追加登録します。",
    "login.fullNameLabel": "氏名 (フルネーム)",
    "login.emailLabel": "メールアドレス",
    "login.confirmPassLabel": "パスワード (確認)",
    "login.roleLabel": "権限ロール",
    "login.roleApprover": "APPROVER / 管理者 (PR承認・システム管理)",
    "login.roleUser": "USER / 倉庫スタッフ (PR作成・PO発注・入庫検収)",
    "login.createFirstBtn": "初期アカウントを作成して開始",
    "login.registerBtn": "新規アカウントを登録",
    "login.switchToRegister": "アカウントを新規作成する",
    "login.switchToLogin": "既存アカウントでログインする",
    "login.errEmpty": "すべての必須項目を入力してください。",
    "login.errPassMismatch": "確認用パスワードが一致しません。",
    "login.errInvalidCreds": "ユーザー名またはパスワードが正しくありません。",
    "login.errUserExists":
      "そのユーザー名またはメールアドレスは既に登録されています。",

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
    "cp.nav.i18n": "多言語・カスタム言語作成",
    "cp.nav.database": "DB接続モード・サーバー設定",
    "cp.nav.plugins": "プラグイン管理 (Add-Ons)",
    "cp.nav.themes": "テーマ・カラーパレット",
    "cp.nav.mailer": "コア通知メール設定",
    "cp.nav.devSdk": "開発者向け拡張ガイド",

    "cp.status.latencyTitle": "読込 / 書込レイテンシ",
    "cp.status.addonsTitle": "有効アドオン数",
    "cp.status.dbModeTitle": "DB接続ドライバ",
    "cp.status.specHeader": "現在のカーネル設定仕様",
    "cp.status.rowIdentity": "アプリケーション名",
    "cp.status.rowStorage": "ストレージエンジン",
    "cp.status.rowLang": "使用中の言語パック",
    "cp.status.rowEmail": "コア通知メールアドレス",
    "cp.status.customTerms": "件のカスタム語句",

    "cp.identity.presetLabel": "業種別プロファイルプリセット (1クリック適用)",
    "cp.identity.presetRoastery": "ロースタリー＆カフェ",
    "cp.identity.presetWarehouse": "一般倉庫・物流ERP",
    "cp.identity.presetTicketing": "IT資産・チケット管理",
    "cp.identity.appNameLabel": "アプリケーション名",
    "cp.identity.appSubLabel": "サブタイトル / スローガン",
    "cp.identity.orgNameLabel": "組織名 / 拠点名",
    "cp.identity.itemTermLabel": "管理品目の呼称",
    "cp.identity.prefixPrLabel": "依頼伝票プレフィックス (PR)",
    "cp.identity.prefixPoLabel": "発注伝票プレフィックス (PO)",
    "cp.identity.prefixGrLabel": "入庫伝票プレフィックス (GR)",

    "cp.i18n.desc":
      "既存の言語パックの切り替え、独自言語パックの新規作成、または画面上のあらゆる文言のカスタマイズが可能です。",
    "cp.i18n.activeLocalesLabel": "インストール済み言語パック一覧",
    "cp.i18n.builtInBadge": "標準搭載",
    "cp.i18n.customBadge": "独自作成",
    "cp.i18n.addLangTitle": "新しいカスタム言語を追加作成",
    "cp.i18n.addLangCodePlaceholder": "言語コード (例: de, kr, jv)",
    "cp.i18n.addLangNamePlaceholder": "言語名 (例: Deutsch, 한국어)",
    "cp.i18n.addLangBaseLabel": "ベース辞書のコピー元:",
    "cp.i18n.addLangBtn": "+ 新規言語を作成",
    "cp.i18n.editorTitle": "選択中の言語辞書エディタ",
    "cp.i18n.editorSubtitle":
      "右側の入力欄を編集すると、現在選択している言語の表示文言が即座に書き換わります。",
    "cp.i18n.resetDictBtn": "辞書の変更をリセット",
    "cp.i18n.searchPlaceholder": "辞書キーまたは文言を検索...",
    "cp.i18n.defaultTextPrefix": "基本文言",

    "cp.db.desc":
      "1台の端末で高速利用する場合はStandalone Local、複数社員のPC(.exe)やスマホ(.apk)でデータ共有する場合はShared Server Nodeを選択してください。",
    "cp.db.localTitle": "1. Standalone Local (端末内蔵DB)",
    "cp.db.localDesc":
      "外部サーバー不要でTauri内部で100%完結動作します。超高速(<0.1 ms)で単一端末やオフライン環境に最適です。",
    "cp.db.remoteTitle": "2. Shared Server Node (複数端末同期)",
    "cp.db.remoteDesc":
      "社員の.exeや.apkアプリを社内サーバー(ElysiaJS/PostgreSQL)へ接続し、PR申請と承認をリアルタイム同期します。",
    "cp.db.remoteHeader": "● 共有サーバーエンドポイント設定",
    "cp.db.hostUrlLabel": "サーバーホストURL / APIノード",
    "cp.db.tokenLabel": "インスタンス認証トークン",

    "cp.themes.pickerHeader": "手動カラートークン調整 (ライブHEXピッカー)",
    "cp.themes.tokenBgMain": "メイン背景色 (Workspace)",
    "cp.themes.tokenBgSurface": "パネル・台帳シート背景",
    "cp.themes.tokenBgSidebar": "サイドバー背景色",
    "cp.themes.tokenTextMain": "メイン文字色",
    "cp.themes.tokenBorder": "パネル境界線色",
    "cp.themes.tokenAccent": "メインアクセント色",

    "cp.mailer.smtpEnabled": "メールゲートウェイ: 有効",
    "cp.mailer.smtpDisabled": "メールゲートウェイ: 無効",
    "cp.mailer.testSentNotice": "✓ テスト通知メールを送信しました:",
    "cp.mailer.coreEmailLabel": "コア通知先メールアドレス (管理者)",
    "cp.mailer.approverEmailLabel": "承認者グループメールアドレス",
    "cp.mailer.smtpHostLabel": "SMTPリレーホスト & ポート",
    "cp.mailer.subjectPrefixLabel": "メール件名プレフィックス",
    "cp.mailer.triggersHeader": "自動メール通知トリガー条件",
    "cp.mailer.trigPrSub": "新規PR伝票が申請された時 (SUBMITTED)",
    "cp.mailer.trigPrApp": "PRが承認された時 (APPROVED)",
    "cp.mailer.trigPrRej": "PRが却下された時 (REJECTED)",
    "cp.mailer.trigPoOrd": "仕入先へPOが発注された時 (ORDERED)",
    "cp.mailer.trigGrRec": "倉庫で入庫検収が完了した時 (GR)",
    "cp.mailer.trigCrit": "在庫残高が安全在庫基準を下回った時",
    "cp.mailer.outboxHeader": "メール送信アウトボックス履歴",
    "cp.mailer.sendTestBtn": "コア宛にテスト送信",

    "cp.sdk.boxTitle": "開発者向けモジュラー拡張アーキテクチャ:",
    "cp.sdk.step1":
      "新規プラグイン追加: src/kernel/registry.ts の KERNEL_PLUGINS に追加するだけで自動認識されます。",
    "cp.sdk.step2":
      "新規言語の追加: ADM-03画面から直接追加するか、src/kernel/i18n.ts に定義を追加できます。",
    "cp.sdk.step3":
      "新規テーマの追加: src/kernel/registry.ts の THEME_PALETTES に配色オブジェクトを追加します。",
  },
};
