import type { AppLanguage } from "@/lib/types";

export interface TranslationDictionary {
  // Brand & Nav
  brandSubtitle: string;
  navDashboard: string;
  navMaster: string;
  navPurchaseRequests: string;
  navPurchaseOrders: string;
  navGoodsReceipts: string;
  navInventory: string;
  navAuditLogs: string;
  mainNav: string;
  groupOverview: string;
  groupMaster: string;
  groupProcurement: string;
  groupWarehouse: string;
  groupCompliance: string;
  logout: string;
  roleStaff: string;
  roleManager: string;
  inventoryAndProcurement: string;

  // Auth / Login
  loginTitle: string;
  loginSubtitle: string;
  loginHeroBadge: string;
  loginHeroTitle1: string;
  loginHeroTitle2: string;
  loginHeroDesc: string;
  loginFeature1: string;
  loginFeature2: string;
  loginFeature3: string;
  loginHeroFooter: string;
  loginDemoCredentials: string;
  emailLabel: string;
  passwordLabel: string;
  signInButton: string;
  quickDemoAccess: string;
  fillStaffRole: string;
  fillApproverRole: string;

  // Common UI
  status: string;
  actions: string;
  filter: string;
  search: string;
  closeForm: string;
  all: string;
  delete: string;
  cancel: string;
  warehouse: string;
  product: string;
  supplier: string;
  quantity: string;
  notes: string;
  timestamp: string;

  // Dashboard
  kpiActiveProducts: string;
  kpiLowStockAlerts: string;
  kpiPendingPr: string;
  kpiActivePo: string;
  recentMovements: string;
  recentAuditTrail: string;
  dashboardSubtitle: string;
  attentionTitle: string;
  attentionSubtitle: string;
  weeklyVolume: string;
  weeklyVolumeSubtitle: string;
  pipelineTitle: string;
  pipelineSubtitle: string;
  warehouseDistribution: string;
  warehouseDistributionSubtitle: string;
  roasteryPortfolio: string;
  roasteryPortfolioSubtitle: string;
  metricVolume: string;
  metricSpend: string;
  metricVelocity: string;
  bannerSystemTitle: string;
  roleBadgePrefix: string;
  welcomeUserPrefix: string;
  bannerSubtitle: string;
  reviewPendingCount: (count: number) => string;
  activeCatalogDesc: string;
  pendingSignoffDesc: string;
  inTransitDesc: string;
  underReorderDesc: string;
  interactiveTrendsTitle: string;
  hoverTelemetryNotice: string;
  realtimeProgression: string;
  stage: string;
  stageDraftTitle: string;
  stageDraftDesc: string;
  stageApprovalTitle: string;
  stageApprovalDesc: string;
  stagePoTitle: string;
  stagePoDesc: string;
  stageReceivingTitle: string;
  stageReceivingDesc: string;
  stageSettledTitle: string;
  stageSettledDesc: string;
  storageTelemetry: string;
  viewLedger: string;
  skusStored: string;
  totalStoredVolume: string;
  units: string;
  materialMix: string;
  activeStockComposition: string;
  compositeReserveDays: string;
  operatingDays: string;
  allStockHealthy: string;
  complianceLedger: string;
  auditTrailTitle: string;
  fullAuditLog: string;
  aggregateIntake: string;
  aggregateSpend: string;
  averageLeadTime: string;
  slaTarget: string;

  // Master Data
  masterTitle: string;
  masterSubtitle: string;
  productsSection: string;
  suppliersSection: string;
  warehousesSection: string;
  newProduct: string;
  newSupplier: string;
  newWarehouse: string;
  addProductTitle: string;
  addSupplierTitle: string;
  addWarehouseTitle: string;
  skuLabel: string;
  nameLabel: string;
  categoryLabel: string;
  unitLabel: string;
  minStockLabel: string;
  codeLabel: string;
  contactEmailLabel: string;
  phoneLabel: string;
  addressLabel: string;
  warehouseTypeLabel: string;
  capacityLabel: string;
  initialPriceLabel: string;
  saveProduct: string;
  saveSupplier: string;
  saveWarehouse: string;
  thSku: string;
  thProductName: string;
  thCategory: string;
  thUnit: string;
  thMinThreshold: string;
  thStatus: string;
  thActions: string;
  thSupplierCode: string;
  thSupplierName: string;
  thContactEmail: string;
  thPhone: string;
  thAddress: string;
  thWarehouseCode: string;
  thWarehouseName: string;
  thWarehouseType: string;
  thCapacity: string;
  activeStatus: string;
  inactiveStatus: string;

  // Purchase Requests
  prTitle: string;
  prSubtitle: string;
  newPr: string;
  createDraftPr: string;
  destinationWarehouse: string;
  selectWarehouse: string;
  selectProduct: string;
  saveDraftPr: string;
  requestId: string;
  warehouseAndRequester: string;
  requestedItems: string;
  submitPr: string;
  approve: string;
  reject: string;
  createPo: string;

  // Purchase Orders
  poTitle: string;
  poSubtitle: string;
  newPo: string;
  issuePo: string;
  fromApprovedPr: string;
  directPo: string;
  approvedPr: string;
  supplierPartner: string;
  selectSupplier: string;
  expectedDelivery: string;
  convertPrToPo: string;
  savePo: string;
  poNumber: string;
  supplierAndWarehouse: string;
  fulfillment: string;
  markOrdered: string;
  receiveGoods: string;

  // Goods Receipts
  grTitle: string;
  grSubtitle: string;
  recordReceipt: string;
  recordReceiptTitle: string;
  noReceivableOrders: string;
  purchaseOrder: string;
  orderLineItem: string;
  quantityReceived: string;
  deliveryNote: string;
  postReceipt: string;
  receiptId: string;
  poReference: string;
  receivedBy: string;
  itemsPosted: string;

  // Inventory & Movements
  inventoryTitle: string;
  inventorySubtitle: string;
  balancesTab: string;
  movementsTab: string;
  allWarehouses: string;
  lowStockOnly: string;
  minThreshold: string;
  currentStock: string;
  health: string;
  critical: string;
  healthy: string;
  movementType: string;
  delta: string;
  balanceAfter: string;

  // Audit Logs
  auditTitle: string;
  auditSubtitle: string;
  allEntities: string;
  searchActor: string;
  action: string;
  moduleEntity: string;
  summary: string;
  operator: string;
}

export const translations: Record<AppLanguage, TranslationDictionary> = {
  ID: {
    brandSubtitle: "Sistem Pengadaan & Inventori Roastery SSR",
    navDashboard: "Dasbor",
    navMaster: "Master Data",
    navPurchaseRequests: "Purchase Request",
    navPurchaseOrders: "Purchase Order",
    navGoodsReceipts: "Goods Receipt",
    navInventory: "Inventori & Mutasi",
    navAuditLogs: "Log Audit",
    mainNav: "Navigasi Utama",
    groupOverview: "Ikhtisar",
    groupMaster: "Master Registry",
    groupProcurement: "Alur Pengadaan",
    groupWarehouse: "Gudang & Stok",
    groupCompliance: "Kepatuhan",
    logout: "Keluar",
    roleStaff: "Staff Roastery",
    roleManager: "Manajer Roastery",
    inventoryAndProcurement: "Inventori & Pengadaan",

    loginTitle: "Masuk ke CafeStock",
    loginSubtitle:
      "Kelola pengadaan bahan baku kafe, persetujuan PR, pesanan PO, dan penerimaan barang secara atomik.",
    loginHeroBadge: "Dari Pengajuan Hingga Inventori Terupdate",
    loginHeroTitle1: "Stok Terkendali.",
    loginHeroTitle2: "Kualitas Terjaga.",
    loginHeroDesc:
      "Sistem terintegrasi pencatatan siklus pengadaan bahan baku kafe—dari Purchase Request, persetujuan manajer, hingga PO dan Goods Receipt dengan saldo konsisten.",
    loginFeature1:
      "Alur persetujuan bertingkat terverifikasi (Staff & Manajer)",
    loginFeature2: "Pemisahan ketat saldo stok aktif dan buku besar mutasi",
    loginFeature3:
      "Pencatatan penerimaan barang atomik dengan jejak audit lengkap",
    loginHeroFooter: "Group 2 • Sistem Pengadaan & Inventori Kafe © 2026",
    loginDemoCredentials: "Kredensial seeder default:",
    emailLabel: "Alamat Email",
    passwordLabel: "Kata Sandi",
    signInButton: "Masuk Sekarang",
    quickDemoAccess: "Akses Demo Akun Seeder",
    fillStaffRole: "Isi Akun USER (Staff)",
    fillApproverRole: "Isi Akun APPROVER (Manajer)",

    status: "Status",
    actions: "Aksi",
    filter: "Filter",
    search: "Cari",
    closeForm: "Tutup Form",
    all: "Semua",
    delete: "Hapus",
    cancel: "Batalkan",
    warehouse: "Gudang",
    product: "Produk",
    supplier: "Pemasok",
    quantity: "Kuantitas",
    notes: "Catatan",
    timestamp: "Waktu",

    kpiActiveProducts: "Produk Aktif",
    kpiLowStockAlerts: "Peringatan Stok Rendah",
    kpiPendingPr: "PR Menunggu Persetujuan",
    kpiActivePo: "PO Aktif / Dipesan",
    recentMovements: "Mutasi Stok Terbaru",
    recentAuditTrail: "Jejak Audit Terbaru",
    dashboardSubtitle:
      "Ringkasan operasional harian pengadaan dan inventori kafe.",
    attentionTitle: "Perhatian Stok",
    attentionSubtitle:
      "Item dengan saldo mendekati atau di bawah batas minimum.",
    weeklyVolume: "Volume Penerimaan Mingguan",
    weeklyVolumeSubtitle: "Estimasi total pergerakan stok masuk harian.",
    pipelineTitle: "Alur Proses Pengadaan Terpadu",
    pipelineSubtitle:
      "Tahapan dari pengajuan draf hingga verifikasi saldo gudang.",
    warehouseDistribution: "Distribusi & Kapasitas Gudang",
    warehouseDistributionSubtitle:
      "Kapasitas utilisasi ruang penyimpanan dan jumlah SKU aktif.",
    roasteryPortfolio: "Portofolio Material Roastery",
    roasteryPortfolioSubtitle:
      "Estimasi komposisi stok bahan baku utama dan kemasan.",
    metricVolume: "Volume Masuk (KG)",
    metricSpend: "Nilai Pembelian (Rp)",
    metricVelocity: "Kecepatan Order (Hari)",
    bannerSystemTitle: "Manajemen Pengadaan & Inventori Terpadu",
    roleBadgePrefix: "PERAN:",
    welcomeUserPrefix: "Selamat datang di CafeStock,",
    bannerSubtitle:
      "Konsol operasional terpusat untuk pengajuan PR, persetujuan manajerial, PO pemasok, penerimaan barang dok gudang, dan buku besar saldo inventori.",
    reviewPendingCount: (count: number) => `Tinjau ${count} Permintaan`,
    activeCatalogDesc: "Terdaftar aktif dalam katalog",
    pendingSignoffDesc: "Menunggu persetujuan manajer",
    inTransitDesc: "Dalam perjalanan & antrean dok",
    underReorderDesc: "Di bawah batas aman stok",
    interactiveTrendsTitle: "Tren Operasional Interaktif",
    hoverTelemetryNotice: "Arahkan kursor pada titik untuk data rinci",
    realtimeProgression: "Perkembangan Inventori Real-Time",
    stage: "TAHAP",
    stageDraftTitle: "Draf Permintaan",
    stageDraftDesc: "Penyusunan draf staf gudang",
    stageApprovalTitle: "Menunggu Persetujuan",
    stageApprovalDesc: "Antrean evaluasi manajer",
    stagePoTitle: "PO Diterbitkan",
    stagePoDesc: "Pemasok memproses pengiriman",
    stageReceivingTitle: "Bongkar Muat Dok",
    stageReceivingDesc: "Pemeriksaan fisik barang di dok",
    stageSettledTitle: "Stok Terekonsiliasi",
    stageSettledDesc: "Saldo buku bertambah secara atomik",
    storageTelemetry: "Telemetri Kapasitas Gudang",
    viewLedger: "Lihat Buku Besar",
    skusStored: "SKU Tersimpan",
    totalStoredVolume: "Total Volume",
    units: "Unit",
    materialMix: "Komposisi Kategori Inventori",
    activeStockComposition: "Komposisi Stok Aktual",
    compositeReserveDays: "Estimasi Ketahanan Cadangan",
    operatingDays: "Hari",
    allStockHealthy:
      "Seluruh stok gudang saat ini berada di atas batas aman pemesanan kembali.",
    complianceLedger: "Buku Kepatuhan Sistem",
    auditTrailTitle: "Riwayat Audit Pengadaan & Stok Terkini",
    fullAuditLog: "Seluruh Log Audit",
    aggregateIntake: "total akumulasi masuk",
    aggregateSpend: "total belanja pengadaan",
    averageLeadTime: "rerata waktu pemrosesan",
    slaTarget: "target SLA 1.5 hari",

    masterTitle: "Manajemen Master Data (Produk, Supplier, Gudang)",
    masterSubtitle:
      "Registri terpusat untuk produk, mitra pemasok terverifikasi, dan fasilitas gudang.",
    productsSection: "Daftar Produk & Bahan Baku",
    suppliersSection: "Daftar Mitra Supplier",
    warehousesSection: "Daftar Gudang & Cabang",
    newProduct: "+ Tambah Produk",
    newSupplier: "+ Tambah Supplier",
    newWarehouse: "+ Tambah Gudang",
    addProductTitle: "Tambah Produk Baru (SKU)",
    addSupplierTitle: "Tambah Mitra Pemasok",
    addWarehouseTitle: "Tambah Fasilitas Gudang",
    skuLabel: "Kode SKU",
    nameLabel: "Nama Produk",
    categoryLabel: "Kategori Produk",
    unitLabel: "Satuan (Unit)",
    minStockLabel: "Batas Min. Stok",
    codeLabel: "Kode Entitas",
    contactEmailLabel: "Email Kontak",
    phoneLabel: "No. Telepon",
    addressLabel: "Alamat Operasional",
    warehouseTypeLabel: "Tipe Fasilitas Gudang",
    capacityLabel: "Kapasitas Maksimal (Unit)",
    initialPriceLabel: "Harga Satuan Estimasi (Rp)",
    saveProduct: "Simpan Produk",
    saveSupplier: "Simpan Supplier",
    saveWarehouse: "Simpan Gudang",
    thSku: "SKU",
    thProductName: "Nama Produk",
    thCategory: "Kategori",
    thUnit: "Satuan",
    thMinThreshold: "Ambang Min.",
    thStatus: "Status",
    thActions: "Aksi",
    thSupplierCode: "Kode Pemasok",
    thSupplierName: "Nama Mitra Supplier",
    thContactEmail: "Email Kontak",
    thPhone: "No. Telepon",
    thAddress: "Alamat Operasional",
    thWarehouseCode: "Kode Gudang",
    thWarehouseName: "Nama Fasilitas Gudang",
    thWarehouseType: "Tipe Fasilitas",
    thCapacity: "Kapasitas (Unit)",
    activeStatus: "AKTIF",
    inactiveStatus: "NONAKTIF",

    prTitle: "Purchase Request (Permintaan Pembelian)",
    prSubtitle:
      "Pengajuan kebutuhan bahan baku gudang dan persetujuan manajerial.",
    newPr: "+ Buat PR Baru",
    createDraftPr: "Buat Purchase Request (DRAFT)",
    destinationWarehouse: "Gudang Tujuan",
    selectWarehouse: "Pilih Gudang...",
    selectProduct: "Pilih Produk...",
    saveDraftPr: "Simpan Draft PR",
    requestId: "No. Dokumen",
    warehouseAndRequester: "Gudang & Pemohon",
    requestedItems: "Item Diminta",
    submitPr: "Submit PR",
    approve: "Setujui",
    reject: "Tolak",
    createPo: "Buat PO →",

    poTitle: "Purchase Order (Pesanan Pembelian)",
    poSubtitle:
      "Penerbitan surat pesanan resmi ke pemasok dan pelacakan penerimaan.",
    newPo: "+ Buat PO Baru",
    issuePo: "Terbitkan Purchase Order Baru",
    fromApprovedPr: "Dari PR Approved",
    directPo: "PO Langsung",
    approvedPr: "PR Disetujui (APPROVED)",
    supplierPartner: "Mitra Pemasok",
    selectSupplier: "Pilih Pemasok...",
    expectedDelivery: "Estimasi Kirim",
    convertPrToPo: "Konversi PR ke PO",
    savePo: "Simpan PO",
    poNumber: "No. PO",
    supplierAndWarehouse: "Pemasok & Gudang",
    fulfillment: "Realisasi (Diterima / Dipesan)",
    markOrdered: "Tandai Dipesan",
    receiveGoods: "Terima Barang",

    grTitle: "Goods Receipt (Penerimaan Barang Atomik)",
    grSubtitle:
      "Verifikasi penerimaan barang fisik dari pemasok dan penambahan stok gudang otomatis.",
    recordReceipt: "+ Catat Penerimaan (GR)",
    recordReceiptTitle: "Catat Bukti Barang Masuk (Goods Receipt)",
    noReceivableOrders:
      "Belum ada Purchase Order berstatus ORDERED atau PARTIALLY_RECEIVED.",
    purchaseOrder: "Purchase Order",
    orderLineItem: "Item Pesanan",
    quantityReceived: "Kuantitas Diterima",
    deliveryNote: "No. Surat Jalan / Catatan",
    postReceipt: "Simpan Penerimaan",
    receiptId: "No. GR",
    poReference: "Ref. PO",
    receivedBy: "Petugas Penerima",
    itemsPosted: "Item Masuk",

    inventoryTitle: "Saldo Inventori & Riwayat Mutasi Stok",
    inventorySubtitle:
      "Pemantauan saldo stok aktual per gudang dan riwayat mutasi barang masuk.",
    balancesTab: "Saldo Gudang",
    movementsTab: "Riwayat Mutasi",
    allWarehouses: "Semua Gudang",
    lowStockOnly: "Stok Kritis Saja",
    minThreshold: "Batas Min",
    currentStock: "Stok Tersedia",
    health: "Kondisi",
    critical: "KRITIS",
    healthy: "AMAN",
    movementType: "Tipe Mutasi",
    delta: "Perubahan",
    balanceAfter: "Saldo Akhir",

    auditTitle: "Jejak Audit Transaksi Sistem",
    auditSubtitle:
      "Rekam jejak seluruh perubahan dokumen transaksi dan identitas petugas.",
    allEntities: "Semua Entitas",
    searchActor: "Cari petugas atau ringkasan...",
    action: "Aksi",
    moduleEntity: "Modul / Entitas",
    summary: "Ringkasan",
    operator: "Petugas",
  },
  EN: {
    brandSubtitle: "SSR Roastery Procurement & Inventory System",
    navDashboard: "Dashboard",
    navMaster: "Master Data",
    navPurchaseRequests: "Purchase Requests",
    navPurchaseOrders: "Purchase Orders",
    navGoodsReceipts: "Goods Receipts",
    navInventory: "Inventory & Ledger",
    navAuditLogs: "Audit Trail",
    mainNav: "Main Navigation",
    groupOverview: "Overview",
    groupMaster: "Master Registry",
    groupProcurement: "Procurement Flow",
    groupWarehouse: "Warehouse & Stock",
    groupCompliance: "Compliance",
    logout: "Sign Out",
    roleStaff: "Roastery Staff",
    roleManager: "Roastery Manager",
    inventoryAndProcurement: "Inventory & Procurement",

    loginTitle: "Sign In to CafeStock",
    loginSubtitle:
      "Manage cafe procurement, PR approvals, supplier POs, and atomic Goods Receipts.",
    loginHeroBadge: "From Purchase Request to Stock Updated",
    loginHeroTitle1: "Stock in order.",
    loginHeroTitle2: "Craft intact.",
    loginHeroDesc:
      "A unified system recording the entire cafe procurement cycle—from Purchase Requests and managerial approvals to Purchase Orders and Goods Receipts with reliable stock balances.",
    loginFeature1: "Multi-tier approval workflow (Staff & Manager)",
    loginFeature2:
      "Strict separation of active stock balances and immutable ledger",
    loginFeature3: "Atomic Goods Receipt settlement with complete audit trail",
    loginHeroFooter: "Group 2 • Inventory Procurement System © 2026",
    loginDemoCredentials: "Default seeder credentials:",
    emailLabel: "Email Address",
    passwordLabel: "Password",
    signInButton: "Sign In",
    quickDemoAccess: "Seeder Demo Accounts",
    fillStaffRole: "Fill USER Account (Staff)",
    fillApproverRole: "Fill APPROVER Account (Manager)",

    status: "Status",
    actions: "Actions",
    filter: "Filter",
    search: "Search",
    closeForm: "Close Form",
    all: "All",
    delete: "Delete",
    cancel: "Cancel",
    warehouse: "Warehouse",
    product: "Product",
    supplier: "Supplier",
    quantity: "Quantity",
    notes: "Notes",
    timestamp: "Timestamp",

    kpiActiveProducts: "Active Products",
    kpiLowStockAlerts: "Low Stock Alerts",
    kpiPendingPr: "PRs Awaiting Approval",
    kpiActivePo: "Active / Ordered POs",
    recentMovements: "Recent Stock Movements",
    recentAuditTrail: "Recent Audit Trail",
    dashboardSubtitle:
      "Daily cafe procurement operations and inventory summary.",
    attentionTitle: "Stock Attention",
    attentionSubtitle: "Items with balances near or below minimum thresholds.",
    weeklyVolume: "Weekly Receipt Volume",
    weeklyVolumeSubtitle: "Estimated aggregate daily stock intake.",
    pipelineTitle: "Unified Procurement Pipeline",
    pipelineSubtitle:
      "Real-time lifecycle stages from draft creation to stock settlement.",
    warehouseDistribution: "Warehouse Storage & Distribution",
    warehouseDistributionSubtitle:
      "Space utilization rates and active SKU density across facilities.",
    roasteryPortfolio: "Roastery Material Portfolio",
    roasteryPortfolioSubtitle:
      "Inventory composition of green coffee, dairy, and degassing packaging.",
    metricVolume: "Inbound Volume (KG)",
    metricSpend: "Procurement Capital (IDR)",
    metricVelocity: "Fulfillment Velocity (Days)",
    bannerSystemTitle: "Procurement & Inventory Management",
    roleBadgePrefix: "ROLE:",
    welcomeUserPrefix: "Welcome to CafeStock,",
    bannerSubtitle:
      "Centralized operations console for purchase requests, managerial approvals, vendor purchase orders, warehouse dock receipts, and verified stock ledgers.",
    reviewPendingCount: (count: number) => `Review ${count} Requests`,
    activeCatalogDesc: "Active catalog registry",
    pendingSignoffDesc: "Requires manager sign-off",
    inTransitDesc: "In-transit & dock pending",
    underReorderDesc: "Under reorder threshold",
    interactiveTrendsTitle: "Interactive Operational Trends",
    hoverTelemetryNotice: "Hover nodes for granular telemetry",
    realtimeProgression: "Real-Time Inventory Progression",
    stage: "STAGE",
    stageDraftTitle: "Draft PRs",
    stageDraftDesc: "Warehouse staff drafting",
    stageApprovalTitle: "Awaiting Approval",
    stageApprovalDesc: "Manager sign-off queue",
    stagePoTitle: "PO Issued",
    stagePoDesc: "Supplier dispatched",
    stageReceivingTitle: "Receiving Bay",
    stageReceivingDesc: "Dock inspection in progress",
    stageSettledTitle: "Stock Settled",
    stageSettledDesc: "Ledger updated atomically",
    storageTelemetry: "Storage Telemetry",
    viewLedger: "View Ledger",
    skusStored: "SKUs Stored",
    totalStoredVolume: "Total Volume",
    units: "Units",
    materialMix: "Material Inventory Mix",
    activeStockComposition: "Active Stock Composition",
    compositeReserveDays: "Composite Operating Reserve",
    operatingDays: "Days",
    allStockHealthy:
      "All warehouse items are currently above their reorder safety thresholds.",
    complianceLedger: "System Compliance Ledger",
    auditTrailTitle: "Recent Stock & Procurement Audit Trail",
    fullAuditLog: "Full Audit Log",
    aggregateIntake: "aggregate intake",
    aggregateSpend: "aggregate procurement spend",
    averageLeadTime: "average lead time",
    slaTarget: "1.5d target SLA",

    masterTitle: "Master Data Management (Products, Suppliers, Warehouses)",
    masterSubtitle:
      "Central registry for products, verified suppliers, and warehouse facilities.",
    productsSection: "Products & Ingredients",
    suppliersSection: "Supplier Partners",
    warehousesSection: "Warehouses & Branches",
    newProduct: "+ New Product",
    newSupplier: "+ New Supplier",
    newWarehouse: "+ New Warehouse",
    addProductTitle: "Add New SKU Product",
    addSupplierTitle: "Add New Supplier Partner",
    addWarehouseTitle: "Add New Warehouse Facility",
    skuLabel: "SKU Code",
    nameLabel: "Product Name",
    categoryLabel: "Category",
    unitLabel: "Unit",
    minStockLabel: "Min Threshold",
    codeLabel: "Entity Code",
    contactEmailLabel: "Contact Email",
    phoneLabel: "Phone Number",
    addressLabel: "Operational Address",
    warehouseTypeLabel: "Facility Type",
    capacityLabel: "Max Capacity (Units)",
    initialPriceLabel: "Estimated Unit Price (Rp)",
    saveProduct: "Save Product",
    saveSupplier: "Save Supplier",
    saveWarehouse: "Save Warehouse",
    thSku: "SKU",
    thProductName: "Product Name",
    thCategory: "Category",
    thUnit: "Unit",
    thMinThreshold: "Min Threshold",
    thStatus: "Status",
    thActions: "Actions",
    thSupplierCode: "Supplier Code",
    thSupplierName: "Supplier Name",
    thContactEmail: "Contact Email",
    thPhone: "Phone",
    thAddress: "Address",
    thWarehouseCode: "Warehouse Code",
    thWarehouseName: "Facility Name",
    thWarehouseType: "Facility Type",
    thCapacity: "Capacity (Units)",
    activeStatus: "ACTIVE",
    inactiveStatus: "INACTIVE",

    prTitle: "Purchase Requests",
    prSubtitle:
      "Draft raw material requirements and managerial approval workflow.",
    newPr: "+ New Purchase Request",
    createDraftPr: "Create Purchase Request (DRAFT)",
    destinationWarehouse: "Destination Warehouse",
    selectWarehouse: "Select Warehouse...",
    selectProduct: "Select Product...",
    saveDraftPr: "Save Draft PR",
    requestId: "Request ID",
    warehouseAndRequester: "Warehouse & Requester",
    requestedItems: "Requested Items",
    submitPr: "Submit PR",
    approve: "Approve",
    reject: "Reject",
    createPo: "Create PO →",

    poTitle: "Purchase Orders",
    poSubtitle:
      "Issue official supplier purchase orders and track fulfillment progress.",
    newPo: "+ New Purchase Order",
    issuePo: "Issue New Purchase Order",
    fromApprovedPr: "From Approved PR",
    directPo: "Direct PO",
    approvedPr: "Approved PR",
    supplierPartner: "Supplier Partner",
    selectSupplier: "Select Supplier...",
    expectedDelivery: "Expected Delivery",
    convertPrToPo: "Convert PR to PO",
    savePo: "Save PO",
    poNumber: "PO Number",
    supplierAndWarehouse: "Supplier & Warehouse",
    fulfillment: "Fulfillment (Received / Ordered)",
    markOrdered: "Mark Ordered",
    receiveGoods: "Receive Goods",

    grTitle: "Goods Receipts (Atomic Stock Posting)",
    grSubtitle:
      "Verify physical delivery from suppliers and atomically post inventory balance increments.",
    recordReceipt: "+ Record Goods Receipt",
    recordReceiptTitle: "Record Inbound Goods Receipt",
    noReceivableOrders:
      "No Purchase Orders are currently in ORDERED or PARTIALLY_RECEIVED status.",
    purchaseOrder: "Purchase Order",
    orderLineItem: "Order Line Item",
    quantityReceived: "Quantity Received",
    deliveryNote: "Delivery Note / Ref Notes",
    postReceipt: "Post Goods Receipt",
    receiptId: "Receipt ID",
    poReference: "PO Reference",
    receivedBy: "Received By",
    itemsPosted: "Items Posted",

    inventoryTitle: "Inventory Balances & Stock Movement Ledger",
    inventorySubtitle:
      "Real-time stock balance per warehouse facility and append-only inbound movement ledger.",
    balancesTab: "Warehouse Balances",
    movementsTab: "Movement Ledger",
    allWarehouses: "All Warehouses",
    lowStockOnly: "Low Stock Only",
    minThreshold: "Min Threshold",
    currentStock: "Current Stock",
    health: "Health",
    critical: "CRITICAL",
    healthy: "HEALTHY",
    movementType: "Movement Type",
    delta: "Delta",
    balanceAfter: "Balance After",

    auditTitle: "System Transaction Audit Trail",
    auditSubtitle:
      "Immutable log of transactional status changes, actions, and operator identities.",
    allEntities: "All Entities",
    searchActor: "Search actor or summary...",
    action: "Action",
    moduleEntity: "Module / Entity",
    summary: "Summary",
    operator: "Operator",
  },
  JP: {
    brandSubtitle: "SSR カフェ購買・在庫管理システム",
    navDashboard: "ダッシュボード",
    navMaster: "マスターデータ",
    navPurchaseRequests: "購買依頼 (PR)",
    navPurchaseOrders: "発注書 (PO)",
    navGoodsReceipts: "入荷検収 (GR)",
    navInventory: "在庫残高・入出庫履歴",
    navAuditLogs: "監査ログ",
    mainNav: "メインナビゲーション",
    groupOverview: "概要",
    groupMaster: "マスタ登録",
    groupProcurement: "調達フロー",
    groupWarehouse: "倉庫・在庫",
    groupCompliance: "コンプライアンス",
    logout: "ログアウト",
    roleStaff: "焙煎所スタッフ",
    roleManager: "焙煎所マネージャー",
    inventoryAndProcurement: "在庫・調達管理",

    loginTitle: "CafeStock ログイン",
    loginSubtitle:
      "購買依頼、承認ワークフロー、発注、およびアトミックな入荷在庫更新を管理します。",
    loginHeroBadge: "購買申請から入庫台帳の更新まで",
    loginHeroTitle1: "在庫の調達を、",
    loginHeroTitle2: "正確に。",
    loginHeroDesc:
      "購買依頼から承認ワークフロー、発注、アトミックな入荷検収まで、カフェの原材料調達を一元管理します。",
    loginFeature1: "多段階の承認ワークフロー（スタッフ・承認者）",
    loginFeature2: "実在庫と入出庫台帳の厳格な分離管理",
    loginFeature3: "アトミックな入荷検収と監査ログの自動記録",
    loginHeroFooter: "Group 2 • カフェ在庫・調達管理システム © 2026",
    loginDemoCredentials: "初期シードアカウント:",
    emailLabel: "メールアドレス",
    passwordLabel: "パスワード",
    signInButton: "ログイン",
    quickDemoAccess: "デモアカウント",
    fillStaffRole: "USER (スタッフ) を入力",
    fillApproverRole: "APPROVER (承認者) を入力",

    status: "ステータス",
    actions: "操作",
    filter: "絞り込み",
    search: "検索",
    closeForm: "閉じる",
    all: "すべて",
    delete: "削除",
    cancel: "キャンセル",
    warehouse: "倉庫",
    product: "商品",
    supplier: "仕入先",
    quantity: "数量",
    notes: "備考",
    timestamp: "日時",

    kpiActiveProducts: "有効な商品数",
    kpiLowStockAlerts: "在庫不足アラート",
    kpiPendingPr: "承認待ち PR",
    kpiActivePo: "進行中の PO",
    recentMovements: "最近の在庫移動",
    recentAuditTrail: "最近の監査ログ",
    dashboardSubtitle: "日々の購買業務とカフェ在庫サマリー。",
    attentionTitle: "在庫注意報",
    attentionSubtitle: "最小基準値付近または下回っている品目。",
    weeklyVolume: "週間入荷量推移",
    weeklyVolumeSubtitle: "日別推定総入庫量。",
    pipelineTitle: "調達プロセス・パイプライン",
    pipelineSubtitle: "購買起票から在庫確定までのリアルタイム推移。",
    warehouseDistribution: "倉庫別収容状況・在庫分布",
    warehouseDistributionSubtitle: "各保管拠点の容量使用率および管理SKU数。",
    roasteryPortfolio: "ロースタリー原材料構成",
    roasteryPortfolioSubtitle: "生豆・副資材・パッケージの在庫構成比率。",
    metricVolume: "入荷総量 (KG)",
    metricSpend: "購買総額 (IDR)",
    metricVelocity: "納入速度 (日数)",
    bannerSystemTitle: "調達・在庫統合管理システム",
    roleBadgePrefix: "権限:",
    welcomeUserPrefix: "CafeStockへようこそ、",
    bannerSubtitle:
      "購買申請、承認決裁、発注書、受入検収、および検証済み在庫台帳の一元管理コンソール。",
    reviewPendingCount: (count: number) => `${count} 件の申請をレビュー`,
    activeCatalogDesc: "カタログ登録済み有効SKU",
    pendingSignoffDesc: "マネージャー承認待ち",
    inTransitDesc: "輸送中・検収待ち",
    underReorderDesc: "安全在庫基準値を下回る",
    interactiveTrendsTitle: "運用テレメトリー推移",
    hoverTelemetryNotice: "各データポイントにカーソルを合わせて詳細を表示",
    realtimeProgression: "在庫推移のリアルタイム進行状況",
    stage: "ステージ",
    stageDraftTitle: "起票中 PR",
    stageDraftDesc: "倉庫担当者による起票",
    stageApprovalTitle: "承認待ち",
    stageApprovalDesc: "マネージャー決裁待ち",
    stagePoTitle: "発注済み (PO)",
    stagePoDesc: "仕入先出荷手配中",
    stageReceivingTitle: "入荷受入ドック",
    stageReceivingDesc: "現品受入・検収実施中",
    stageSettledTitle: "在庫確定・台帳反映",
    stageSettledDesc: "在庫台帳へアトミック加算",
    storageTelemetry: "倉庫別保管容量",
    viewLedger: "台帳を見る",
    skusStored: "保管SKU数",
    totalStoredVolume: "保管総数量",
    units: "点",
    materialMix: "原材料カテゴリー構成",
    activeStockComposition: "実在庫構成比率",
    compositeReserveDays: "推定運用可能在庫日数",
    operatingDays: "日分",
    allStockHealthy: "すべての品目は現在、最低安全基準を満たしています。",
    complianceLedger: "システム監査・証跡台帳",
    auditTrailTitle: "直近の調達・入出庫監査ログ",
    fullAuditLog: "監査ログ一覧",
    aggregateIntake: "累計入庫量",
    aggregateSpend: "累計調達支出",
    averageLeadTime: "平均リードタイム",
    slaTarget: "目標SLA 1.5日",

    masterTitle: "マスターデータ管理（商品・サプライヤー・倉庫）",
    masterSubtitle: "商品、取引先サプライヤー、倉庫拠点の一元管理。",
    productsSection: "商品・原材料一覧",
    suppliersSection: "サプライヤー一覧",
    warehousesSection: "倉庫・店舗一覧",
    newProduct: "+ 新規商品",
    newSupplier: "+ 新規サプライヤー",
    newWarehouse: "+ 新規倉庫",
    addProductTitle: "新規SKU商品の追加",
    addSupplierTitle: "新規サプライヤーの追加",
    addWarehouseTitle: "新規倉庫拠点の追加",
    skuLabel: "SKUコード",
    nameLabel: "商品名",
    categoryLabel: "カテゴリー",
    unitLabel: "単位",
    minStockLabel: "最小基準値",
    codeLabel: "コード",
    contactEmailLabel: "連絡先メール",
    phoneLabel: "電話番号",
    addressLabel: "所在地",
    warehouseTypeLabel: "施設タイプ",
    capacityLabel: "最大収容能力 (ユニット)",
    initialPriceLabel: "見積単価 (Rp)",
    saveProduct: "商品を保存",
    saveSupplier: "サプライヤーを保存",
    saveWarehouse: "倉庫を保存",
    thSku: "SKU",
    thProductName: "商品名",
    thCategory: "カテゴリー",
    thUnit: "単位",
    thMinThreshold: "最小閾値",
    thStatus: "ステータス",
    thActions: "操作",
    thSupplierCode: "仕入先コード",
    thSupplierName: "仕入先名",
    thContactEmail: "連絡先メール",
    thPhone: "電話番号",
    thAddress: "所在地",
    thWarehouseCode: "倉庫コード",
    thWarehouseName: "倉庫施設名",
    thWarehouseType: "施設タイプ",
    thCapacity: "収容能力",
    activeStatus: "有効",
    inactiveStatus: "無効",

    prTitle: "購買依頼 (Purchase Requests)",
    prSubtitle: "原材料の購買申請と承認ワークフロー。",
    newPr: "+ 新規購買依頼",
    createDraftPr: "購買依頼の作成 (ドラフト)",
    destinationWarehouse: "納品先倉庫",
    selectWarehouse: "倉庫を選択...",
    selectProduct: "商品を選択...",
    saveDraftPr: "下書きPRを保存",
    requestId: "申請番号",
    warehouseAndRequester: "倉庫 & 申請者",
    requestedItems: "申請品目",
    submitPr: "PRを提出",
    approve: "承認",
    reject: "却下",
    createPo: "PO作成 →",

    poTitle: "発注管理 (Purchase Orders)",
    poSubtitle: "サプライヤーへの発注書発行と納品進捗の追跡。",
    newPo: "+ 新規発注書",
    issuePo: "新規発注書の発行",
    fromApprovedPr: "承認済みPRから作成",
    directPo: "直接発注",
    approvedPr: "承認済みPR",
    supplierPartner: "取引先サプライヤー",
    selectSupplier: "サプライヤーを選択...",
    expectedDelivery: "納品予定日",
    convertPrToPo: "PRを発注書に変換",
    savePo: "発注書を保存",
    poNumber: "発注番号",
    supplierAndWarehouse: "サプライヤー & 倉庫",
    fulfillment: "入荷進捗 (受領 / 発注)",
    markOrdered: "発注済みにする",
    receiveGoods: "入荷検収を行う",

    grTitle: "入荷検収 (Goods Receipts)",
    grSubtitle: "実物の受領確認およびアトミックな在庫加算の登録。",
    recordReceipt: "+ 入荷検収を記録",
    recordReceiptTitle: "入荷受領書の記録",
    noReceivableOrders: "現在、発注中または一部入荷状態の発注書はありません。",
    purchaseOrder: "発注書",
    orderLineItem: "発注品目",
    quantityReceived: "受領数量",
    deliveryNote: "納品書番号 / 備考",
    postReceipt: "入荷を確定",
    receiptId: "受領番号",
    poReference: "発注参照",
    receivedBy: "検収担当者",
    itemsPosted: "入庫品目",

    inventoryTitle: "在庫残高・入出庫台帳",
    inventorySubtitle: "拠点別リアルタイム在庫残高と入庫履歴台帳。",
    balancesTab: "倉庫残高",
    movementsTab: "入出庫履歴",
    allWarehouses: "全倉庫",
    lowStockOnly: "在庫注意のみ",
    minThreshold: "最小基準値",
    currentStock: "現在在庫",
    health: "状態",
    critical: "注意",
    healthy: "適正",
    movementType: "移動種別",
    delta: "変動数",
    balanceAfter: "受領後残高",

    auditTitle: "システム監査ログ",
    auditSubtitle: "取引ドキュメント変更と操作担当者の不変ログ。",
    allEntities: "全エンティティ",
    searchActor: "担当者または概要を検索...",
    action: "操作",
    moduleEntity: "モジュール / 対象",
    summary: "概要",
    operator: "担当者",
  },
};

export function getDictionary(lang: AppLanguage): TranslationDictionary {
  return translations[lang] ?? translations.EN;
}
