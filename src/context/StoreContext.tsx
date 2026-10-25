import React, { createContext, useContext, useEffect, useState } from "react";
import {
  AuditLog,
  GoodsReceipt,
  GRItem,
  InventoryBalance,
  InventoryMovement,
  Product,
  PurchaseOrder,
  PurchaseRequest,
  PRItem,
  Supplier,
  Warehouse,
} from "@/types";
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_GOODS_RECEIPTS,
  INITIAL_INVENTORY_BALANCES,
  INITIAL_MOVEMENTS,
  INITIAL_PRODUCTS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_PURCHASE_REQUESTS,
  INITIAL_SUPPLIERS,
  INITIAL_WAREHOUSES,
} from "@/data/mockData";
import {
  clearNativeDatabase,
  DB_TABLE_KEYS,
  generatePortableSqlDump,
  loadSnapshotFromNativeDatabase,
  purgeLegacyMockStorage,
  readTableSync,
  syncSnapshotToNativeDatabase,
  writeTableSync,
} from "@/utils/sqliteDatabase";

purgeLegacyMockStorage();

const STORE_KEYS = DB_TABLE_KEYS;

function loadStored<T>(key: string, fallback: T): T {
  return readTableSync(key, fallback);
}

function saveStored<T>(key: string, value: T): void {
  writeTableSync(key, value);
}

export interface CreateProductInput {
  sku: string;
  name: string;
  unit: string;
  minStock: number;
  category: string;
}

export interface CreateSupplierInput {
  name: string;
  email: string;
  phone: string;
}

export interface CreateWarehouseInput {
  code: string;
  name: string;
  location: string;
}

export interface CreatePRInput {
  warehouseId: string;
  notes: string;
  submitImmediately: boolean;
  items: { productId: string; quantity: number }[];
  createdBy: string;
  prefixPR: string;
}

export interface CreatePOInput {
  purchaseRequestId: string;
  supplierId: string;
  orderImmediately: boolean;
  createdBy: string;
  prefixPO: string;
}

export interface CreateGRInput {
  purchaseOrderId: string;
  receivedBy: string;
  prefixGR: string;
  items: { productId: string; quantity: number }[];
}

interface StoreContextValue {
  products: Product[];
  suppliers: Supplier[];
  warehouses: Warehouse[];
  purchaseRequests: PurchaseRequest[];
  purchaseOrders: PurchaseOrder[];
  goodsReceipts: GoodsReceipt[];
  inventoryBalances: InventoryBalance[];
  inventoryMovements: InventoryMovement[];
  auditLogs: AuditLog[];

  addProduct: (input: CreateProductInput, actor: string) => Product;
  toggleProductStatus: (id: string, actor: string) => void;
  addSupplier: (input: CreateSupplierInput, actor: string) => Supplier;
  toggleSupplierStatus: (id: string, actor: string) => void;
  addWarehouse: (input: CreateWarehouseInput, actor: string) => Warehouse;
  toggleWarehouseStatus: (id: string, actor: string) => void;

  createPurchaseRequest: (input: CreatePRInput) => PurchaseRequest;
  updateDraftPurchaseRequest: (
    id: string,
    input: {
      warehouseId: string;
      notes: string;
      items: { productId: string; quantity: number }[];
      actor: string;
    },
  ) => boolean;
  submitPurchaseRequest: (id: string, actor: string) => void;
  approvePurchaseRequest: (id: string, actor: string) => void;
  rejectPurchaseRequest: (id: string, reason: string, actor: string) => void;

  createPurchaseOrder: (input: CreatePOInput) => PurchaseOrder | null;
  markPurchaseOrderOrdered: (id: string, actor: string) => void;
  cancelPurchaseOrder: (id: string, actor: string) => void;

  createGoodsReceipt: (input: CreateGRInput) => {
    ok: boolean;
    error?: string;
    receipt?: GoodsReceipt;
  };

  getStockBalance: (warehouseId: string, productId: string) => number;
  resetStoreData: () => void;
  wipeAllDatabase: () => void;
  seedDemoData: () => void;
  exportSqlDump: () => string;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [products, setProducts] = useState<Product[]>(() =>
    loadStored<Product[]>(STORE_KEYS.PRODUCTS, []),
  );
  const [suppliers, setSuppliers] = useState<Supplier[]>(() =>
    loadStored<Supplier[]>(STORE_KEYS.SUPPLIERS, []),
  );
  const [warehouses, setWarehouses] = useState<Warehouse[]>(() =>
    loadStored<Warehouse[]>(STORE_KEYS.WAREHOUSES, []),
  );
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>(
    () => loadStored<PurchaseRequest[]>(STORE_KEYS.PRS, []),
  );
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() =>
    loadStored<PurchaseOrder[]>(STORE_KEYS.POS, []),
  );
  const [goodsReceipts, setGoodsReceipts] = useState<GoodsReceipt[]>(() =>
    loadStored<GoodsReceipt[]>(STORE_KEYS.GRS, []),
  );
  const [inventoryBalances, setInventoryBalances] = useState<
    InventoryBalance[]
  >(() => loadStored<InventoryBalance[]>(STORE_KEYS.BALANCES, []));
  const [inventoryMovements, setInventoryMovements] = useState<
    InventoryMovement[]
  >(() => loadStored<InventoryMovement[]>(STORE_KEYS.MOVEMENTS, []));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() =>
    loadStored<AuditLog[]>(STORE_KEYS.AUDITS, []),
  );

  // Hydrate from Tauri native database file on initial launch if local cache is empty
  useEffect(() => {
    let mounted = true;
    loadSnapshotFromNativeDatabase().then((snap) => {
      if (!mounted || !snap) {
        return;
      }
      const hasLocalData =
        products.length > 0 ||
        suppliers.length > 0 ||
        warehouses.length > 0 ||
        purchaseRequests.length > 0;
      if (
        !hasLocalData &&
        (snap.products.length > 0 || snap.warehouses.length > 0)
      ) {
        setProducts(snap.products);
        setSuppliers(snap.suppliers);
        setWarehouses(snap.warehouses);
        setPurchaseRequests(snap.purchaseRequests);
        setPurchaseOrders(snap.purchaseOrders);
        setGoodsReceipts(snap.goodsReceipts);
        setInventoryBalances(snap.inventoryBalances);
        setInventoryMovements(snap.inventoryMovements);
        setAuditLogs(snap.auditLogs);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Continuously persist relational snapshot to Tauri native DB file & IndexedDB
  useEffect(() => {
    syncSnapshotToNativeDatabase({
      version: 2,
      updatedAt: new Date().toISOString(),
      products,
      suppliers,
      warehouses,
      purchaseRequests,
      purchaseOrders,
      goodsReceipts,
      inventoryBalances,
      inventoryMovements,
      auditLogs,
    });
  }, [
    products,
    suppliers,
    warehouses,
    purchaseRequests,
    purchaseOrders,
    goodsReceipts,
    inventoryBalances,
    inventoryMovements,
    auditLogs,
  ]);

  const appendAudit = (
    entity: string,
    entityId: string,
    action: string,
    performedBy: string,
    details: string,
  ): void => {
    const entry: AuditLog = {
      id: `aud_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      entity,
      entityId,
      action,
      performedBy,
      timestamp: new Date().toISOString(),
      details,
    };
    setAuditLogs((prev) => {
      const next = [entry, ...prev];
      saveStored(STORE_KEYS.AUDITS, next);
      return next;
    });
  };

  const addProduct = (input: CreateProductInput, actor: string): Product => {
    const newProduct: Product = {
      id: `prd_${Date.now()}`,
      sku: input.sku.trim().toUpperCase(),
      name: input.name.trim(),
      unit: input.unit.trim().toUpperCase(),
      minStock: Math.max(0, Number(input.minStock) || 0),
      category: input.category.trim() || "General",
      isActive: true,
    };
    setProducts((prev) => {
      const next = [newProduct, ...prev];
      saveStored(STORE_KEYS.PRODUCTS, next);
      return next;
    });
    appendAudit(
      "Product",
      newProduct.sku,
      "CREATE_PRODUCT",
      actor,
      `Registrasi SKU baru: ${newProduct.name} (Min: ${newProduct.minStock} ${newProduct.unit})`,
    );
    return newProduct;
  };

  const toggleProductStatus = (id: string, actor: string): void => {
    setProducts((prev) => {
      const next = prev.map((p) =>
        p.id === id ? { ...p, isActive: !p.isActive } : p,
      );
      saveStored(STORE_KEYS.PRODUCTS, next);
      const target = next.find((p) => p.id === id);
      if (target) {
        appendAudit(
          "Product",
          target.sku,
          target.isActive ? "ACTIVATE_PRODUCT" : "DEACTIVATE_PRODUCT",
          actor,
          `Status SKU ${target.name} diubah menjadi ${target.isActive ? "ACTIVE" : "INACTIVE"}`,
        );
      }
      return next;
    });
  };

  const addSupplier = (input: CreateSupplierInput, actor: string): Supplier => {
    const newSupplier: Supplier = {
      id: `sup_${Date.now()}`,
      name: input.name.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      isActive: true,
    };
    setSuppliers((prev) => {
      const next = [newSupplier, ...prev];
      saveStored(STORE_KEYS.SUPPLIERS, next);
      return next;
    });
    appendAudit(
      "Supplier",
      newSupplier.id,
      "CREATE_SUPPLIER",
      actor,
      `Registrasi pemasok baru: ${newSupplier.name} (${newSupplier.email})`,
    );
    return newSupplier;
  };

  const toggleSupplierStatus = (id: string, actor: string): void => {
    setSuppliers((prev) => {
      const next = prev.map((s) =>
        s.id === id ? { ...s, isActive: !s.isActive } : s,
      );
      saveStored(STORE_KEYS.SUPPLIERS, next);
      return next;
    });
    appendAudit(
      "Supplier",
      id,
      "TOGGLE_SUPPLIER_STATUS",
      actor,
      "Perubahan status aktif mitra pemasok",
    );
  };

  const addWarehouse = (
    input: CreateWarehouseInput,
    actor: string,
  ): Warehouse => {
    const newWh: Warehouse = {
      id: `wh_${Date.now()}`,
      code: input.code.trim().toUpperCase(),
      name: input.name.trim(),
      location: input.location.trim(),
      isActive: true,
    };
    setWarehouses((prev) => {
      const next = [...prev, newWh];
      saveStored(STORE_KEYS.WAREHOUSES, next);
      return next;
    });
    appendAudit(
      "Warehouse",
      newWh.code,
      "CREATE_WAREHOUSE",
      actor,
      `Penambahan lokasi gudang baru: ${newWh.name}`,
    );
    return newWh;
  };

  const toggleWarehouseStatus = (id: string, actor: string): void => {
    setWarehouses((prev) => {
      const next = prev.map((w) =>
        w.id === id ? { ...w, isActive: !w.isActive } : w,
      );
      saveStored(STORE_KEYS.WAREHOUSES, next);
      return next;
    });
    appendAudit(
      "Warehouse",
      id,
      "TOGGLE_WAREHOUSE_STATUS",
      actor,
      "Perubahan status aktif lokasi gudang",
    );
  };

  const createPurchaseRequest = (input: CreatePRInput): PurchaseRequest => {
    const seq = String(purchaseRequests.length + 1).padStart(6, "0");
    const reqNum = `${input.prefixPR}-2026-${seq}`;
    const prItems: PRItem[] = input.items.map((item, idx) => ({
      id: `pri_${Date.now()}_${idx}`,
      productId: item.productId,
      quantity: item.quantity,
    }));

    const newPR: PurchaseRequest = {
      id: `pr_${Date.now()}`,
      requestNumber: reqNum,
      warehouseId: input.warehouseId,
      status: input.submitImmediately ? "SUBMITTED" : "DRAFT",
      createdBy: input.createdBy,
      createdAt: new Date().toISOString(),
      notes: input.notes,
      items: prItems,
    };

    setPurchaseRequests((prev) => {
      const next = [newPR, ...prev];
      saveStored(STORE_KEYS.PRS, next);
      return next;
    });

    appendAudit(
      "PurchaseRequest",
      newPR.requestNumber,
      input.submitImmediately
        ? "CREATE_AND_SUBMIT_PR"
        : "CREATE_PURCHASE_REQUEST",
      input.createdBy,
      `Dokumen ${newPR.requestNumber} dibuat (${prItems.length} baris item) dengan status ${newPR.status}`,
    );

    return newPR;
  };

  const updateDraftPurchaseRequest = (
    id: string,
    input: {
      warehouseId: string;
      notes: string;
      items: { productId: string; quantity: number }[];
      actor: string;
    },
  ): boolean => {
    const target = purchaseRequests.find((pr) => pr.id === id);
    if (!target || target.status !== "DRAFT") {
      return false;
    }

    const updatedItems: PRItem[] = input.items.map((item, idx) => ({
      id: `pri_${Date.now()}_${idx}`,
      productId: item.productId,
      quantity: item.quantity,
    }));

    setPurchaseRequests((prev) => {
      const next = prev.map((pr) =>
        pr.id === id && pr.status === "DRAFT"
          ? {
              ...pr,
              warehouseId: input.warehouseId,
              notes: input.notes,
              items: updatedItems,
            }
          : pr,
      );
      saveStored(STORE_KEYS.PRS, next);
      return next;
    });

    appendAudit(
      "PurchaseRequest",
      target.requestNumber,
      "UPDATE_DRAFT_PR",
      input.actor,
      `Perubahan isi DRAFT ${target.requestNumber} (${updatedItems.length} baris item)`,
    );
    return true;
  };

  const submitPurchaseRequest = (id: string, actor: string): void => {
    setPurchaseRequests((prev) => {
      const next = prev.map((pr) =>
        pr.id === id && pr.status === "DRAFT"
          ? { ...pr, status: "SUBMITTED" as const }
          : pr,
      );
      saveStored(STORE_KEYS.PRS, next);
      const target = next.find((pr) => pr.id === id);
      if (target) {
        appendAudit(
          "PurchaseRequest",
          target.requestNumber,
          "SUBMIT_PURCHASE_REQUEST",
          actor,
          `Transisi status DRAFT → SUBMITTED untuk pemeriksaan manajer`,
        );
      }
      return next;
    });
  };

  const approvePurchaseRequest = (id: string, actor: string): void => {
    setPurchaseRequests((prev) => {
      const next = prev.map((pr) =>
        pr.id === id && pr.status === "SUBMITTED"
          ? { ...pr, status: "APPROVED" as const }
          : pr,
      );
      saveStored(STORE_KEYS.PRS, next);
      const target = next.find((pr) => pr.id === id);
      if (target) {
        appendAudit(
          "PurchaseRequest",
          target.requestNumber,
          "APPROVE_PURCHASE_REQUEST",
          actor,
          `Otorisasi disetujui (SUBMITTED → APPROVED). Siap diterbitkan menjadi PO.`,
        );
      }
      return next;
    });
  };

  const rejectPurchaseRequest = (
    id: string,
    reason: string,
    actor: string,
  ): void => {
    setPurchaseRequests((prev) => {
      const next = prev.map((pr) =>
        pr.id === id && pr.status === "SUBMITTED"
          ? {
              ...pr,
              status: "REJECTED" as const,
              notes: reason
                ? `${pr.notes ?? ""} [Ditolak: ${reason}]`
                : pr.notes,
            }
          : pr,
      );
      saveStored(STORE_KEYS.PRS, next);
      const target = next.find((pr) => pr.id === id);
      if (target) {
        appendAudit(
          "PurchaseRequest",
          target.requestNumber,
          "REJECT_PURCHASE_REQUEST",
          actor,
          `Dokumen PR ditolak (SUBMITTED → REJECTED). Catatan: ${reason || "Tidak memenuhi kriteria"}`,
        );
      }
      return next;
    });
  };

  const createPurchaseOrder = (input: CreatePOInput): PurchaseOrder | null => {
    const pr = purchaseRequests.find((r) => r.id === input.purchaseRequestId);
    if (!pr || pr.status !== "APPROVED") {
      return null;
    }

    const alreadyHasActivePO = purchaseOrders.some(
      (po) => po.purchaseRequestId === pr.id && po.status !== "CANCELLED",
    );
    if (alreadyHasActivePO) {
      return null;
    }

    const seq = String(purchaseOrders.length + 1).padStart(6, "0");
    const poNum = `${input.prefixPO}-2026-${seq}`;

    const newPO: PurchaseOrder = {
      id: `po_${Date.now()}`,
      poNumber: poNum,
      purchaseRequestId: pr.id,
      supplierId: input.supplierId,
      warehouseId: pr.warehouseId,
      status: input.orderImmediately ? "ORDERED" : "DRAFT",
      createdBy: input.createdBy,
      createdAt: new Date().toISOString(),
      items: pr.items.map((item, idx) => ({
        id: `poi_${Date.now()}_${idx}`,
        productId: item.productId,
        quantity: item.quantity,
        receivedQuantity: 0,
      })),
    };

    setPurchaseOrders((prev) => {
      const next = [newPO, ...prev];
      saveStored(STORE_KEYS.POS, next);
      return next;
    });

    const sup = suppliers.find((s) => s.id === input.supplierId);
    appendAudit(
      "PurchaseOrder",
      newPO.poNumber,
      input.orderImmediately ? "CREATE_AND_ORDER_PO" : "CREATE_PURCHASE_ORDER",
      input.createdBy,
      `Penerbitan ${newPO.poNumber} dari ${pr.requestNumber} ke pemasok ${sup?.name ?? input.supplierId}`,
    );

    return newPO;
  };

  const markPurchaseOrderOrdered = (id: string, actor: string): void => {
    setPurchaseOrders((prev) => {
      const next = prev.map((po) =>
        po.id === id && po.status === "DRAFT"
          ? { ...po, status: "ORDERED" as const }
          : po,
      );
      saveStored(STORE_KEYS.POS, next);
      const target = next.find((po) => po.id === id);
      if (target) {
        appendAudit(
          "PurchaseOrder",
          target.poNumber,
          "MARK_AS_ORDERED",
          actor,
          `Status pesanan ${target.poNumber} diubah DRAFT → ORDERED (dikirim ke pemasok)`,
        );
      }
      return next;
    });
  };

  const cancelPurchaseOrder = (id: string, actor: string): void => {
    setPurchaseOrders((prev) => {
      const next = prev.map((po) =>
        po.id === id && (po.status === "DRAFT" || po.status === "ORDERED")
          ? { ...po, status: "CANCELLED" as const }
          : po,
      );
      saveStored(STORE_KEYS.POS, next);
      const target = next.find((po) => po.id === id);
      if (target) {
        appendAudit(
          "PurchaseOrder",
          target.poNumber,
          "CANCEL_PURCHASE_ORDER",
          actor,
          `Pesanan ${target.poNumber} dibatalkan (CANCELLED)`,
        );
      }
      return next;
    });
  };

  const createGoodsReceipt = (
    input: CreateGRInput,
  ): { ok: boolean; error?: string; receipt?: GoodsReceipt } => {
    const po = purchaseOrders.find((p) => p.id === input.purchaseOrderId);
    if (!po) {
      return { ok: false, error: "Dokumen PO tidak ditemukan." };
    }
    if (po.status !== "ORDERED" && po.status !== "PARTIALLY_RECEIVED") {
      return {
        ok: false,
        error:
          "Hanya PO berstatus ORDERED atau PARTIALLY_RECEIVED yang dapat diterima.",
      };
    }

    const validItems = input.items.filter((i) => i.quantity > 0);
    if (validItems.length === 0) {
      return {
        ok: false,
        error: "Masukkan minimal 1 item dengan kuantitas terima > 0.",
      };
    }

    // Strict Over-delivery validation per PRD Section 4.5
    for (const incoming of validItems) {
      const poItem = po.items.find((pi) => pi.productId === incoming.productId);
      if (!poItem) {
        return {
          ok: false,
          error: "Produk tidak terdaftar pada dokumen PO ini.",
        };
      }
      const remaining = poItem.quantity - poItem.receivedQuantity;
      if (incoming.quantity > remaining) {
        const prod = products.find((p) => p.id === incoming.productId);
        return {
          ok: false,
          error: `Kuantitas terima untuk ${prod?.name ?? incoming.productId} (${incoming.quantity}) melebihi sisa pesanan (${remaining}). Over-delivery dilarang oleh sistem.`,
        };
      }
    }

    const seq = String(goodsReceipts.length + 1).padStart(6, "0");
    const grNum = `${input.prefixGR}-2026-${seq}`;
    const nowIso = new Date().toISOString();

    const grItems: GRItem[] = validItems.map((item, idx) => ({
      id: `gri_${Date.now()}_${idx}`,
      productId: item.productId,
      quantity: item.quantity,
    }));

    const newGR: GoodsReceipt = {
      id: `gr_${Date.now()}`,
      grNumber: grNum,
      purchaseOrderId: po.id,
      receivedBy: input.receivedBy,
      receivedAt: nowIso,
      items: grItems,
    };

    // 1. Save GR
    setGoodsReceipts((prev) => {
      const next = [newGR, ...prev];
      saveStored(STORE_KEYS.GRS, next);
      return next;
    });

    // 2. Update PO items & PO status (PARTIALLY_RECEIVED vs RECEIVED)
    setPurchaseOrders((prev) => {
      const next = prev.map((existingPo) => {
        if (existingPo.id !== po.id) {
          return existingPo;
        }
        const updatedItems = existingPo.items.map((pi) => {
          const rec = validItems.find((vi) => vi.productId === pi.productId);
          return rec
            ? { ...pi, receivedQuantity: pi.receivedQuantity + rec.quantity }
            : pi;
        });
        const allFulfilled = updatedItems.every(
          (ui) => ui.receivedQuantity >= ui.quantity,
        );
        return {
          ...existingPo,
          items: updatedItems,
          status: allFulfilled
            ? ("RECEIVED" as const)
            : ("PARTIALLY_RECEIVED" as const),
        };
      });
      saveStored(STORE_KEYS.POS, next);
      return next;
    });

    // 3. Atomic Update: Inventory Balances
    setInventoryBalances((prev) => {
      const copy = [...prev];
      for (const rec of validItems) {
        const idx = copy.findIndex(
          (b) =>
            b.warehouseId === po.warehouseId && b.productId === rec.productId,
        );
        if (idx >= 0) {
          copy[idx] = {
            ...copy[idx],
            stock: copy[idx].stock + rec.quantity,
          };
        } else {
          copy.push({
            warehouseId: po.warehouseId,
            productId: rec.productId,
            stock: rec.quantity,
          });
        }
      }
      saveStored(STORE_KEYS.BALANCES, copy);
      return copy;
    });

    // 4. Atomic Append: Inventory Movements (Append-Only Ledger)
    const newMovements: InventoryMovement[] = validItems.map((rec, idx) => ({
      id: `mov_${Date.now()}_${idx}`,
      warehouseId: po.warehouseId,
      productId: rec.productId,
      movementType: "PURCHASE_RECEIPT",
      quantity: rec.quantity,
      referenceType: "GOODS_RECEIPT",
      referenceId: grNum,
      createdAt: nowIso,
    }));

    setInventoryMovements((prev) => {
      const next = [...newMovements, ...prev];
      saveStored(STORE_KEYS.MOVEMENTS, next);
      return next;
    });

    // 5. Append Immutable Audit Log
    const summaryText = validItems
      .map((vi) => {
        const p = products.find((prod) => prod.id === vi.productId);
        return `+${vi.quantity} ${p?.unit ?? ""} ${p?.name ?? vi.productId}`;
      })
      .join(", ");

    appendAudit(
      "GoodsReceipt",
      grNum,
      "CREATE_GOODS_RECEIPT",
      input.receivedBy,
      `Timbang terima fisik atas ${po.poNumber} (${summaryText})`,
    );

    return { ok: true, receipt: newGR };
  };

  const getStockBalance = (warehouseId: string, productId: string): number => {
    const found = inventoryBalances.find(
      (b) => b.warehouseId === warehouseId && b.productId === productId,
    );
    return found ? found.stock : 0;
  };

  const wipeAllDatabase = (): void => {
    setProducts([]);
    setSuppliers([]);
    setWarehouses([]);
    setPurchaseRequests([]);
    setPurchaseOrders([]);
    setGoodsReceipts([]);
    setInventoryBalances([]);
    setInventoryMovements([]);
    setAuditLogs([]);
    Object.values(STORE_KEYS).forEach((k) => {
      try {
        window.localStorage.removeItem(k);
      } catch {
        // ignore
      }
    });
    clearNativeDatabase();
  };

  const seedDemoData = (): void => {
    setProducts(INITIAL_PRODUCTS);
    setSuppliers(INITIAL_SUPPLIERS);
    setWarehouses(INITIAL_WAREHOUSES);
    setPurchaseRequests(INITIAL_PURCHASE_REQUESTS);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setGoodsReceipts(INITIAL_GOODS_RECEIPTS);
    setInventoryBalances(INITIAL_INVENTORY_BALANCES);
    setInventoryMovements(INITIAL_MOVEMENTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    saveStored(STORE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    saveStored(STORE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
    saveStored(STORE_KEYS.WAREHOUSES, INITIAL_WAREHOUSES);
    saveStored(STORE_KEYS.PRS, INITIAL_PURCHASE_REQUESTS);
    saveStored(STORE_KEYS.POS, INITIAL_PURCHASE_ORDERS);
    saveStored(STORE_KEYS.GRS, INITIAL_GOODS_RECEIPTS);
    saveStored(STORE_KEYS.BALANCES, INITIAL_INVENTORY_BALANCES);
    saveStored(STORE_KEYS.MOVEMENTS, INITIAL_MOVEMENTS);
    saveStored(STORE_KEYS.AUDITS, INITIAL_AUDIT_LOGS);
  };

  const exportSqlDump = (): string => {
    return generatePortableSqlDump({
      version: 2,
      updatedAt: new Date().toISOString(),
      products,
      suppliers,
      warehouses,
      purchaseRequests,
      purchaseOrders,
      goodsReceipts,
      inventoryBalances,
      inventoryMovements,
      auditLogs,
    });
  };

  const resetStoreData = (): void => {
    wipeAllDatabase();
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        suppliers,
        warehouses,
        purchaseRequests,
        purchaseOrders,
        goodsReceipts,
        inventoryBalances,
        inventoryMovements,
        auditLogs,
        addProduct,
        toggleProductStatus,
        addSupplier,
        toggleSupplierStatus,
        addWarehouse,
        toggleWarehouseStatus,
        createPurchaseRequest,
        updateDraftPurchaseRequest,
        submitPurchaseRequest,
        approvePurchaseRequest,
        rejectPurchaseRequest,
        createPurchaseOrder,
        markPurchaseOrderOrdered,
        cancelPurchaseOrder,
        createGoodsReceipt,
        getStockBalance,
        resetStoreData,
        wipeAllDatabase,
        seedDemoData,
        exportSqlDump,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextValue => {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return ctx;
};
