import type { AppLanguage } from "@/lib/types";

export interface TranslationDictionary {
  brandSubtitle: string;
  navDashboard: string;
  navMaster: string;
  navPurchaseRequests: string;
  navPurchaseOrders: string;
  navGoodsReceipts: string;
  navInventory: string;
  navAuditLogs: string;
  logout: string;
  loginTitle: string;
  loginSubtitle: string;
  emailLabel: string;
  passwordLabel: string;
  signInButton: string;
  quickDemoAccess: string;
  fillStaffRole: string;
  fillApproverRole: string;
  kpiActiveProducts: string;
  kpiLowStockAlerts: string;
  kpiPendingPr: string;
  kpiActivePo: string;
  recentMovements: string;
  recentAuditTrail: string;
  masterTitle: string;
  productsSection: string;
  suppliersSection: string;
  warehousesSection: string;
  prTitle: string;
  poTitle: string;
  grTitle: string;
  inventoryTitle: string;
  auditTitle: string;
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
    logout: "Keluar",
    loginTitle: "Masuk ke CafeStock",
    loginSubtitle:
      "Kelola pengadaan bahan baku kafe, persetujuan PR, pesanan PO, dan penerimaan barang secara atomik.",
    emailLabel: "Alamat Email",
    passwordLabel: "Kata Sandi",
    signInButton: "Masuk Sekarang",
    quickDemoAccess: "Akses Cepat Akun Seeder (1-Klik):",
    fillStaffRole: "Isi Akun USER (Staff)",
    fillApproverRole: "Isi Akun APPROVER (Manajer)",
    kpiActiveProducts: "Produk Aktif",
    kpiLowStockAlerts: "Peringatan Stok Rendah",
    kpiPendingPr: "PR Menunggu Persetujuan",
    kpiActivePo: "PO Aktif / Dipesan",
    recentMovements: "Mutasi Stok Terbaru",
    recentAuditTrail: "Jejak Audit Terbaru",
    masterTitle: "Manajemen Master Data (Produk, Supplier, Gudang)",
    productsSection: "Daftar Produk & Bahan Baku",
    suppliersSection: "Daftar Mitra Supplier",
    warehousesSection: "Daftar Gudang & Cabang",
    prTitle: "Purchase Request (Permintaan Pembelian)",
    poTitle: "Purchase Order (Pesanan Pembelian)",
    grTitle: "Goods Receipt (Penerimaan Barang Atomik)",
    inventoryTitle: "Saldo Inventori & Riwayat Mutasi Stok",
    auditTitle: "Jejak Audit Transaksi Sistem",
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
    logout: "Sign Out",
    loginTitle: "Sign In to CafeStock",
    loginSubtitle:
      "Manage cafe procurement, PR approvals, supplier POs, and atomic Goods Receipts.",
    emailLabel: "Email Address",
    passwordLabel: "Password",
    signInButton: "Sign In",
    quickDemoAccess: "Quick Seeder Account Fill (1-Click):",
    fillStaffRole: "Fill USER Account (Staff)",
    fillApproverRole: "Fill APPROVER Account (Manager)",
    kpiActiveProducts: "Active Products",
    kpiLowStockAlerts: "Low Stock Alerts",
    kpiPendingPr: "PRs Awaiting Approval",
    kpiActivePo: "Active / Ordered POs",
    recentMovements: "Recent Stock Movements",
    recentAuditTrail: "Recent Audit Trail",
    masterTitle: "Master Data Management (Products, Suppliers, Warehouses)",
    productsSection: "Products & Ingredients",
    suppliersSection: "Supplier Partners",
    warehousesSection: "Warehouses & Branches",
    prTitle: "Purchase Requests",
    poTitle: "Purchase Orders",
    grTitle: "Goods Receipts (Atomic Stock Posting)",
    inventoryTitle: "Inventory Balances & Stock Movement Ledger",
    auditTitle: "System Transaction Audit Trail",
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
    logout: "ログアウト",
    loginTitle: "CafeStock ログイン",
    loginSubtitle:
      "購買依頼、承認ワークフロー、発注、およびアトミックな入荷在庫更新を管理します。",
    emailLabel: "メールアドレス",
    passwordLabel: "パスワード",
    signInButton: "ログイン",
    quickDemoAccess: "デモアカウント自動入力 (1クリック):",
    fillStaffRole: "USER (スタッフ) を入力",
    fillApproverRole: "APPROVER (承認者) を入力",
    kpiActiveProducts: "有効な商品数",
    kpiLowStockAlerts: "在庫不足アラート",
    kpiPendingPr: "承認待ち PR",
    kpiActivePo: "進行中の PO",
    recentMovements: "最近の在庫移動",
    recentAuditTrail: "最近の監査ログ",
    masterTitle: "マスターデータ管理（商品・サプライヤー・倉庫）",
    productsSection: "商品・原材料一覧",
    suppliersSection: "サプライヤー一覧",
    warehousesSection: "倉庫・店舗一覧",
    prTitle: "購買依頼 (Purchase Requests)",
    poTitle: "発注管理 (Purchase Orders)",
    grTitle: "入荷検収 (Goods Receipts)",
    inventoryTitle: "在庫残高・入出庫台帳",
    auditTitle: "システム監査ログ",
  },
};

export function getDictionary(lang: AppLanguage): TranslationDictionary {
  return translations[lang] ?? translations.ID;
}
