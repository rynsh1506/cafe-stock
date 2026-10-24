import {
  Product,
  Supplier,
  Warehouse,
  PurchaseRequest,
  PurchaseOrder,
  GoodsReceipt,
  InventoryBalance,
  InventoryMovement,
  AuditLog,
} from "@/types";

export const INITIAL_WAREHOUSES: Warehouse[] = [
  {
    id: "wh_jkt",
    code: "WH-JKT-01",
    name: "Gudang Utama Jakarta",
    location: "Jl. Senopati No. 45, Jakarta Selatan",
    isActive: true,
  },
  {
    id: "wh_bdg",
    code: "WH-BDG-01",
    name: "Gudang Roastery Bandung",
    location: "Jl. Riau No. 120, Bandung Kota",
    isActive: true,
  },
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: "sup_001",
    name: "PT Kopi Nusantara Mandiri",
    email: "procurement@kopinusantara.id",
    phone: "+62 812-3456-7890",
    isActive: true,
  },
  {
    id: "sup_002",
    name: "CV Kemasan Sentosa Pack",
    email: "sales@kemasansentosa.id",
    phone: "+62 813-9876-5432",
    isActive: true,
  },
  {
    id: "sup_003",
    name: "PT Dairy Prima Sejahtera",
    email: "order@dairyprima.co.id",
    phone: "+62 821-4455-6677",
    isActive: true,
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prd_01",
    sku: "KOP-AR-001",
    name: "Biji Kopi House Blend Arabica",
    unit: "KG",
    minStock: 30,
    category: "Coffee Beans",
    isActive: true,
  },
  {
    id: "prd_02",
    sku: "KOP-RO-002",
    name: "Biji Kopi Robusta Dampit",
    unit: "KG",
    minStock: 20,
    category: "Coffee Beans",
    isActive: true,
  },
  {
    id: "prd_03",
    sku: "SUS-BR-001",
    name: "Susu Fresh Milk Barista 1L",
    unit: "LITER",
    minStock: 50,
    category: "Dairy & Beverage",
    isActive: true,
  },
  {
    id: "prd_04",
    sku: "SIR-VN-001",
    name: "Sirup Vanilla Premium 750ml",
    unit: "BOTOL",
    minStock: 15,
    category: "Dairy & Beverage",
    isActive: true,
  },
  {
    id: "prd_05",
    sku: "SIR-CR-002",
    name: "Sirup Salted Caramel 750ml",
    unit: "BOTOL",
    minStock: 15,
    category: "Dairy & Beverage",
    isActive: true,
  },
  {
    id: "prd_06",
    sku: "KEM-PC-008",
    name: "Paper Cup Hot 8oz (Dus @1000)",
    unit: "DUS",
    minStock: 8,
    category: "Packaging",
    isActive: true,
  },
  {
    id: "prd_07",
    sku: "KEM-PC-016",
    name: "Plastic Cup Cold 16oz (Dus @1000)",
    unit: "DUS",
    minStock: 10,
    category: "Packaging",
    isActive: true,
  },
];

export const INITIAL_INVENTORY_BALANCES: InventoryBalance[] = [
  { warehouseId: "wh_jkt", productId: "prd_01", stock: 24 }, // CRITICAL (< 30)
  { warehouseId: "wh_jkt", productId: "prd_02", stock: 45 },
  { warehouseId: "wh_jkt", productId: "prd_03", stock: 110 },
  { warehouseId: "wh_jkt", productId: "prd_04", stock: 22 },
  { warehouseId: "wh_jkt", productId: "prd_05", stock: 18 },
  { warehouseId: "wh_jkt", productId: "prd_06", stock: 12 },
  { warehouseId: "wh_jkt", productId: "prd_07", stock: 16 },

  { warehouseId: "wh_bdg", productId: "prd_01", stock: 40 },
  { warehouseId: "wh_bdg", productId: "prd_02", stock: 55 },
  { warehouseId: "wh_bdg", productId: "prd_03", stock: 65 },
  { warehouseId: "wh_bdg", productId: "prd_06", stock: 5 }, // CRITICAL (< 8)
];

export const INITIAL_PURCHASE_REQUESTS: PurchaseRequest[] = [
  {
    id: "pr_001",
    requestNumber: "PR-2026-000001",
    warehouseId: "wh_jkt",
    status: "SUBMITTED",
    createdBy: "user_procurement",
    createdAt: "2026-10-23T08:30:00Z",
    notes: "Pengisian stok mingguan bar Senopati",
    items: [
      { id: "pri_1", productId: "prd_01", quantity: 40 },
      { id: "pri_2", productId: "prd_04", quantity: 15 },
    ],
  },
  {
    id: "pr_002",
    requestNumber: "PR-2026-000002",
    warehouseId: "wh_jkt",
    status: "DRAFT",
    createdBy: "user_procurement",
    createdAt: "2026-10-24T02:15:00Z",
    notes: "Rencana pengadaan kemasan ramah lingkungan",
    items: [
      { id: "pri_3", productId: "prd_06", quantity: 10 },
      { id: "pri_4", productId: "prd_07", quantity: 15 },
    ],
  },
  {
    id: "pr_003",
    requestNumber: "PR-2026-000003",
    warehouseId: "wh_bdg",
    status: "APPROVED",
    createdBy: "user_procurement",
    createdAt: "2026-10-22T09:00:00Z",
    notes: "Persetujuan bahan baku roastery",
    items: [
      { id: "pri_5", productId: "prd_01", quantity: 60 },
      { id: "pri_6", productId: "prd_03", quantity: 80 },
    ],
  },
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: "po_001",
    poNumber: "PO-2026-000001",
    purchaseRequestId: "pr_003",
    supplierId: "sup_001",
    warehouseId: "wh_bdg",
    status: "ORDERED",
    createdBy: "user_procurement",
    createdAt: "2026-10-22T14:00:00Z",
    items: [
      { id: "poi_1", productId: "prd_01", quantity: 60, receivedQuantity: 0 },
      { id: "poi_2", productId: "prd_03", quantity: 80, receivedQuantity: 0 },
    ],
  },
  {
    id: "po_002",
    poNumber: "PO-2026-000002",
    purchaseRequestId: "pr_old",
    supplierId: "sup_001",
    warehouseId: "wh_jkt",
    status: "PARTIALLY_RECEIVED",
    createdBy: "user_procurement",
    createdAt: "2026-10-20T10:00:00Z",
    items: [
      { id: "poi_3", productId: "prd_01", quantity: 100, receivedQuantity: 60 },
      { id: "poi_4", productId: "prd_02", quantity: 50, receivedQuantity: 50 },
    ],
  },
];

export const INITIAL_GOODS_RECEIPTS: GoodsReceipt[] = [
  {
    id: "gr_001",
    grNumber: "GR-2026-000001",
    purchaseOrderId: "po_002",
    receivedBy: "user_procurement",
    receivedAt: "2026-10-21T11:45:00Z",
    items: [
      { id: "gri_1", productId: "prd_01", quantity: 60 },
      { id: "gri_2", productId: "prd_02", quantity: 50 },
    ],
  },
];

export const INITIAL_MOVEMENTS: InventoryMovement[] = [
  {
    id: "mov_001",
    warehouseId: "wh_jkt",
    productId: "prd_01",
    movementType: "PURCHASE_RECEIPT",
    quantity: 60,
    referenceType: "GOODS_RECEIPT",
    referenceId: "GR-2026-000001",
    createdAt: "2026-10-21T11:45:00Z",
  },
  {
    id: "mov_002",
    warehouseId: "wh_jkt",
    productId: "prd_02",
    movementType: "PURCHASE_RECEIPT",
    quantity: 50,
    referenceType: "GOODS_RECEIPT",
    referenceId: "GR-2026-000001",
    createdAt: "2026-10-21T11:45:00Z",
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: "aud_001",
    entity: "GoodsReceipt",
    entityId: "GR-2026-000001",
    action: "CREATE_GOODS_RECEIPT",
    performedBy: "user_procurement",
    timestamp: "2026-10-21T11:45:00Z",
    details: "Penerimaan parsial PO-2026-000002 (60kg Arabica, 50kg Robusta)",
  },
  {
    id: "aud_002",
    entity: "PurchaseRequest",
    entityId: "PR-2026-000003",
    action: "APPROVE_PURCHASE_REQUEST",
    performedBy: "approver_manager",
    timestamp: "2026-10-22T11:00:00Z",
    details: "Persetujuan PR untuk Gudang Roastery Bandung",
  },
  {
    id: "aud_003",
    entity: "PurchaseOrder",
    entityId: "PO-2026-000001",
    action: "MARK_AS_ORDERED",
    performedBy: "user_procurement",
    timestamp: "2026-10-22T14:30:00Z",
    details: "Pesanan dikirimkan ke PT Kopi Nusantara Mandiri",
  },
];
