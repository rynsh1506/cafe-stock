import { beforeAll, describe, expect, it } from "bun:test";
import { app } from "@/app";
import { resetDatabaseConnection } from "@/db/index";
import { runMigrations } from "@/db/migrate";
import { seedDatabase } from "@/db/seed";
import type { AuditLogRecord } from "@/modules/audit-logs/service";
import type { LoginResponse } from "@/modules/auth/model";
import type { GoodsReceiptDetail } from "@/modules/goods-receipts/model";
import type {
  InventoryBalanceView,
  InventoryMovementView,
} from "@/modules/inventory/model";
import type { ProductRecord } from "@/modules/products/service";
import type { PurchaseOrderDetail } from "@/modules/purchase-orders/model";
import type { PurchaseRequestDetail } from "@/modules/purchase-requests/model";
import type { SupplierRecord } from "@/modules/suppliers/service";
import type { WarehouseRecord } from "@/modules/warehouses/service";
import type { PaginatedResponse } from "@/utils/pagination";

interface ApiDataEnvelope<T> {
  data: T;
}

interface ApiErrorEnvelope {
  error: {
    code: string;
    message: string;
  };
}

async function apiRequest<T>(
  path: string,
  options: {
    method?: string;
    token?: string;
    idempotencyKey?: string;
    body?: Record<string, unknown>;
  } = {},
): Promise<{ status: number; body: T }> {
  const headers = new Headers({
    "Content-Type": "application/json",
  });
  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }
  if (options.idempotencyKey) {
    headers.set("Idempotency-Key", options.idempotencyKey);
  }

  const response = await app.handle(
    new Request(`http://localhost:3000${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    }),
  );

  const parsed = (await response.json()) as T;
  return {
    status: response.status,
    body: parsed,
  };
}

/**
 * End-to-end integration and business logic test suite covering Authentication, RBAC,
 * Master Data (Products, Suppliers, Warehouses), Purchase Requests, Purchase Orders,
 * atomic Goods Receipts, Inventory Balances & Movements, Idempotency Keys, and Audit Logs.
 */
describe("Procurement & Inventory Vertical-Slice Modules", () => {
  let userToken = "";
  let approverToken = "";
  let testWarehouseId = "";
  let testSupplierId = "";
  let testProductAId = "";
  let testProductBId = "";
  let approvedPrId = "";
  let orderedPoId = "";
  let poItemAId = "";
  let poItemBId = "";

  beforeAll(async () => {
    resetDatabaseConnection("pglite");
    await runMigrations();
    await seedDatabase();
  });

  describe("Authentication & Role-Based Access Control", () => {
    it("authenticates USER and APPROVER accounts and rejects invalid credentials", async () => {
      const badLogin = await apiRequest<ApiErrorEnvelope>("/api/auth/login", {
        method: "POST",
        body: {
          email: "staff@cafestock.com",
          password: "WrongPassword!",
        },
      });
      expect(badLogin.status).toBe(401);
      expect(badLogin.body.error.code).toBe("UNAUTHORIZED");

      const staffLogin = await apiRequest<ApiDataEnvelope<LoginResponse>>(
        "/api/auth/login",
        {
          method: "POST",
          body: {
            email: "staff@cafestock.com",
            password: "User123!",
          },
        },
      );
      expect(staffLogin.status).toBe(200);
      expect(staffLogin.body.data.user.role).toBe("USER");
      userToken = staffLogin.body.data.token;

      const approverLogin = await apiRequest<ApiDataEnvelope<LoginResponse>>(
        "/api/auth/login",
        {
          method: "POST",
          body: {
            email: "approver@cafestock.com",
            password: "Approver123!",
          },
        },
      );
      expect(approverLogin.status).toBe(200);
      expect(approverLogin.body.data.user.role).toBe("APPROVER");
      approverToken = approverLogin.body.data.token;

      // Verify email alias user@cafestock.com and password123 fallback
      const aliasLogin = await apiRequest<ApiDataEnvelope<LoginResponse>>(
        "/api/auth/login",
        {
          method: "POST",
          body: {
            email: "user@cafestock.com",
            password: "password123",
          },
        },
      );
      expect(aliasLogin.status).toBe(200);
      expect(aliasLogin.body.data.user.role).toBe("USER");
      expect(aliasLogin.body.data.user.email).toBe("staff@cafestock.com");

      const meRes = await apiRequest<ApiDataEnvelope<LoginResponse["user"]>>(
        "/api/auth/me",
        {
          token: userToken,
        },
      );
      expect(meRes.status).toBe(200);
      expect(meRes.body.data.email).toBe("staff@cafestock.com");
    });
  });

  describe("Master Data Management (Warehouses, Suppliers, Products)", () => {
    it("creates and lists warehouses, suppliers, and products with uniqueness validation", async () => {
      const whRes = await apiRequest<ApiDataEnvelope<WarehouseRecord>>(
        "/api/warehouses",
        {
          method: "POST",
          token: userToken,
          body: {
            code: "WH-SBY-03",
            name: "Surabaya Roastery Hub",
            address: "Jl. Tunjungan No. 10, Surabaya",
          },
        },
      );
      expect(whRes.status).toBe(201);
      testWarehouseId = whRes.body.data.id;

      const supRes = await apiRequest<ApiDataEnvelope<SupplierRecord>>(
        "/api/suppliers",
        {
          method: "POST",
          token: userToken,
          body: {
            code: "SUP-SBY-04",
            name: "Java East Coffee Beans",
            contactEmail: "hello@javaeast.co.id",
            phone: "+62-31-5551234",
          },
        },
      );
      expect(supRes.status).toBe(201);
      testSupplierId = supRes.body.data.id;

      const prodARes = await apiRequest<ApiDataEnvelope<ProductRecord>>(
        "/api/products",
        {
          method: "POST",
          token: userToken,
          body: {
            sku: "SKU-TEST-A",
            name: "Single Origin Toraja 1kg",
            category: "Coffee Beans",
            unit: "bag",
            unitPrice: 240000,
            minStock: 10,
          },
        },
      );
      expect(prodARes.status).toBe(201);
      testProductAId = prodARes.body.data.id;

      const prodBRes = await apiRequest<ApiDataEnvelope<ProductRecord>>(
        "/api/products",
        {
          method: "POST",
          token: userToken,
          body: {
            sku: "SKU-TEST-B",
            name: "Organic Oat Milk 1L",
            category: "Dairy & Plant Milk",
            unit: "carton",
            unitPrice: 42000,
            minStock: 20,
          },
        },
      );
      expect(prodBRes.status).toBe(201);
      testProductBId = prodBRes.body.data.id;

      const duplicateSku = await apiRequest<ApiErrorEnvelope>("/api/products", {
        method: "POST",
        token: userToken,
        body: {
          sku: "SKU-TEST-A",
          name: "Duplicate Toraja",
          unit: "bag",
        },
      });
      expect(duplicateSku.status).toBe(422);
      expect(duplicateSku.body.error.code).toBe("DUPLICATE_PRODUCT_SKU");

      const listRes = await apiRequest<PaginatedResponse<ProductRecord>>(
        "/api/products?page=1&limit=3&search=Toraja",
        {
          token: userToken,
        },
      );
      expect(listRes.status).toBe(200);
      expect(listRes.body.data.length).toBe(1);
      expect(listRes.body.meta.total).toBe(1);
    });
  });

  describe("Purchase Request Workflow & RBAC Enforcement", () => {
    it("allows USER to create and submit a Purchase Request", async () => {
      const createRes = await apiRequest<
        ApiDataEnvelope<PurchaseRequestDetail>
      >("/api/purchase-requests", {
        method: "POST",
        token: userToken,
        body: {
          warehouseId: testWarehouseId,
          notes: "Monthly restock for Surabaya Hub",
          items: [
            { productId: testProductAId, quantity: 10, notes: "Toraja beans" },
            { productId: testProductBId, quantity: 20, notes: "Oat milk" },
          ],
        },
      });
      expect(createRes.status).toBe(201);
      expect(createRes.body.data.status).toBe("DRAFT");
      approvedPrId = createRes.body.data.id;

      const submitRes = await apiRequest<
        ApiDataEnvelope<PurchaseRequestDetail>
      >(`/api/purchase-requests/${approvedPrId}/submit`, {
        method: "POST",
        token: userToken,
      });
      expect(submitRes.status).toBe(200);
      expect(submitRes.body.data.status).toBe("SUBMITTED");
    });

    it("forbids USER from approving or rejecting a Purchase Request (403 Forbidden)", async () => {
      const userApproveAttempt = await apiRequest<ApiErrorEnvelope>(
        `/api/purchase-requests/${approvedPrId}/approve`,
        {
          method: "POST",
          token: userToken,
        },
      );
      expect(userApproveAttempt.status).toBe(403);
      expect(userApproveAttempt.body.error.code).toBe("FORBIDDEN");

      const userRejectAttempt = await apiRequest<ApiErrorEnvelope>(
        `/api/purchase-requests/${approvedPrId}/reject`,
        {
          method: "POST",
          token: userToken,
          body: { reason: "Unauthorized rejection" },
        },
      );
      expect(userRejectAttempt.status).toBe(403);
      expect(userRejectAttempt.body.error.code).toBe("FORBIDDEN");
    });

    it("allows APPROVER to approve or reject a submitted Purchase Request and blocks post-approval edits", async () => {
      const approveRes = await apiRequest<
        ApiDataEnvelope<PurchaseRequestDetail>
      >(`/api/purchase-requests/${approvedPrId}/approve`, {
        method: "POST",
        token: approverToken,
      });
      expect(approveRes.status).toBe(200);
      expect(approveRes.body.data.status).toBe("APPROVED");

      const editApprovedAttempt = await apiRequest<ApiErrorEnvelope>(
        `/api/purchase-requests/${approvedPrId}`,
        {
          method: "PATCH",
          token: userToken,
          body: {
            notes: "Try modifying after approval",
          },
        },
      );
      expect(editApprovedAttempt.status).toBe(422);
      expect(editApprovedAttempt.body.error.code).toBe("PR_IMMUTABLE_STATUS");

      const secondPr = await apiRequest<ApiDataEnvelope<PurchaseRequestDetail>>(
        "/api/purchase-requests",
        {
          method: "POST",
          token: userToken,
          body: {
            warehouseId: testWarehouseId,
            items: [{ productId: testProductAId, quantity: 5 }],
          },
        },
      );
      const secondPrId = secondPr.body.data.id;

      await apiRequest(`/api/purchase-requests/${secondPrId}/submit`, {
        method: "POST",
        token: userToken,
      });

      const rejectRes = await apiRequest<
        ApiDataEnvelope<PurchaseRequestDetail>
      >(`/api/purchase-requests/${secondPrId}/reject`, {
        method: "POST",
        token: approverToken,
        body: { reason: "Budget cap reached" },
      });
      expect(rejectRes.status).toBe(200);
      expect(rejectRes.body.data.status).toBe("REJECTED");
      expect(rejectRes.body.data.rejectionReason).toBe("Budget cap reached");

      const editRejectedAttempt = await apiRequest<ApiErrorEnvelope>(
        `/api/purchase-requests/${secondPrId}`,
        {
          method: "PATCH",
          token: userToken,
          body: { notes: "Should fail" },
        },
      );
      expect(editRejectedAttempt.status).toBe(422);
    });
  });

  describe("Purchase Order Lifecycle", () => {
    it("creates a Purchase Order from an APPROVED Purchase Request and transitions DRAFT -> ORDERED", async () => {
      const createPoRes = await apiRequest<
        ApiDataEnvelope<PurchaseOrderDetail>
      >("/api/purchase-orders", {
        method: "POST",
        token: userToken,
        body: {
          purchaseRequestId: approvedPrId,
          supplierId: testSupplierId,
          expectedDate: "2026-12-01",
          notes: "Deliver to Surabaya loading dock",
        },
      });
      expect(createPoRes.status).toBe(201);
      expect(createPoRes.body.data.status).toBe("DRAFT");
      expect(createPoRes.body.data.items.length).toBe(2);

      orderedPoId = createPoRes.body.data.id;
      const itemA = createPoRes.body.data.items.find(
        (i) => i.productId === testProductAId,
      );
      const itemB = createPoRes.body.data.items.find(
        (i) => i.productId === testProductBId,
      );
      expect(itemA?.orderedQuantity).toBe(10);
      expect(itemB?.orderedQuantity).toBe(20);
      poItemAId = itemA?.id ?? "";
      poItemBId = itemB?.id ?? "";

      const draftReceiptAttempt = await apiRequest<ApiErrorEnvelope>(
        "/api/goods-receipts",
        {
          method: "POST",
          token: userToken,
          body: {
            purchaseOrderId: orderedPoId,
            items: [{ purchaseOrderItemId: poItemAId, quantityReceived: 5 }],
          },
        },
      );
      expect(draftReceiptAttempt.status).toBe(422);
      expect(draftReceiptAttempt.body.error.code).toBe(
        "INVALID_PO_STATUS_FOR_RECEIPT",
      );

      const orderPoRes = await apiRequest<ApiDataEnvelope<PurchaseOrderDetail>>(
        `/api/purchase-orders/${orderedPoId}/order`,
        {
          method: "POST",
          token: userToken,
        },
      );
      expect(orderPoRes.status).toBe(200);
      expect(orderPoRes.body.data.status).toBe("ORDERED");
    });

    it("rejects Goods Receipt for a CANCELLED Purchase Order", async () => {
      const tempPo = await apiRequest<ApiDataEnvelope<PurchaseOrderDetail>>(
        "/api/purchase-orders",
        {
          method: "POST",
          token: userToken,
          body: {
            supplierId: testSupplierId,
            warehouseId: testWarehouseId,
            items: [{ productId: testProductAId, orderedQuantity: 4 }],
          },
        },
      );
      const tempPoId = tempPo.body.data.id;
      const tempPoItemId = tempPo.body.data.items[0]?.id ?? "";

      const cancelRes = await apiRequest<ApiDataEnvelope<PurchaseOrderDetail>>(
        `/api/purchase-orders/${tempPoId}/cancel`,
        {
          method: "POST",
          token: userToken,
        },
      );
      expect(cancelRes.status).toBe(200);
      expect(cancelRes.body.data.status).toBe("CANCELLED");

      const cancelledReceiptAttempt = await apiRequest<ApiErrorEnvelope>(
        "/api/goods-receipts",
        {
          method: "POST",
          token: userToken,
          body: {
            purchaseOrderId: tempPoId,
            items: [{ purchaseOrderItemId: tempPoItemId, quantityReceived: 2 }],
          },
        },
      );
      expect(cancelledReceiptAttempt.status).toBe(422);
      expect(cancelledReceiptAttempt.body.error.code).toBe(
        "INVALID_PO_STATUS_FOR_RECEIPT",
      );
    });
  });

  describe("Goods Receipt Atomic Transaction, Stock Updates & Rollback Safety", () => {
    it("processes a partial Goods Receipt, updates PO to PARTIALLY_RECEIVED, and increments inventory", async () => {
      const partialGrRes = await apiRequest<
        ApiDataEnvelope<GoodsReceiptDetail>
      >("/api/goods-receipts", {
        method: "POST",
        token: userToken,
        idempotencyKey: "idem-gr-partial-001",
        body: {
          purchaseOrderId: orderedPoId,
          notes: "First batch delivery",
          items: [
            { purchaseOrderItemId: poItemAId, quantityReceived: 6 },
            { purchaseOrderItemId: poItemBId, quantityReceived: 10 },
          ],
        },
      });
      expect(partialGrRes.status).toBe(201);
      expect(partialGrRes.body.data.status).toBe("POSTED");

      const replayGrRes = await apiRequest<ApiDataEnvelope<GoodsReceiptDetail>>(
        "/api/goods-receipts",
        {
          method: "POST",
          token: userToken,
          idempotencyKey: "idem-gr-partial-001",
          body: {
            purchaseOrderId: orderedPoId,
            notes: "First batch delivery",
            items: [
              { purchaseOrderItemId: poItemAId, quantityReceived: 6 },
              { purchaseOrderItemId: poItemBId, quantityReceived: 10 },
            ],
          },
        },
      );
      expect(replayGrRes.status).toBe(201);
      expect(replayGrRes.body.data.id).toBe(partialGrRes.body.data.id);

      const poAfterPartial = await apiRequest<
        ApiDataEnvelope<PurchaseOrderDetail>
      >(`/api/purchase-orders/${orderedPoId}`, {
        token: userToken,
      });
      expect(poAfterPartial.body.data.status).toBe("PARTIALLY_RECEIVED");

      const invRes = await apiRequest<PaginatedResponse<InventoryBalanceView>>(
        `/api/inventory?warehouseId=${testWarehouseId}`,
        {
          token: userToken,
        },
      );
      const balanceA = invRes.body.data.find(
        (b) => b.productId === testProductAId,
      );
      const balanceB = invRes.body.data.find(
        (b) => b.productId === testProductBId,
      );
      expect(balanceA?.quantity).toBe(6);
      expect(balanceB?.quantity).toBe(10);
    });

    it("rejects over-receiving and atomically rolls back multi-item receipt if any item fails validation", async () => {
      const failedMultiItemGr = await apiRequest<ApiErrorEnvelope>(
        "/api/goods-receipts",
        {
          method: "POST",
          token: userToken,
          body: {
            purchaseOrderId: orderedPoId,
            notes: "Item A valid (4), Item B over-receives (15 > 10 remaining)",
            items: [
              { purchaseOrderItemId: poItemAId, quantityReceived: 4 },
              { purchaseOrderItemId: poItemBId, quantityReceived: 15 },
            ],
          },
        },
      );
      expect(failedMultiItemGr.status).toBe(422);
      expect(failedMultiItemGr.body.error.code).toBe(
        "OVER_RECEIVING_NOT_ALLOWED",
      );

      const invAfterRollback = await apiRequest<
        PaginatedResponse<InventoryBalanceView>
      >(`/api/inventory?warehouseId=${testWarehouseId}`, {
        token: userToken,
      });
      const balanceAAfterRollback = invAfterRollback.body.data.find(
        (b) => b.productId === testProductAId,
      );
      expect(balanceAAfterRollback?.quantity).toBe(6);

      const poAfterRollback = await apiRequest<
        ApiDataEnvelope<PurchaseOrderDetail>
      >(`/api/purchase-orders/${orderedPoId}`, {
        token: userToken,
      });
      expect(poAfterRollback.body.data.status).toBe("PARTIALLY_RECEIVED");
      const poItemAAfterRollback = poAfterRollback.body.data.items.find(
        (i) => i.id === poItemAId,
      );
      expect(poItemAAfterRollback?.receivedQuantity).toBe(6);
    });

    it("processes final Goods Receipt, transitions PO to RECEIVED, and records movements and audit logs", async () => {
      const finalGrRes = await apiRequest<ApiDataEnvelope<GoodsReceiptDetail>>(
        "/api/goods-receipts",
        {
          method: "POST",
          token: userToken,
          body: {
            purchaseOrderId: orderedPoId,
            notes: "Final delivery completing order",
            items: [
              { purchaseOrderItemId: poItemAId, quantityReceived: 4 },
              { purchaseOrderItemId: poItemBId, quantityReceived: 10 },
            ],
          },
        },
      );
      expect(finalGrRes.status).toBe(201);

      const poAfterFinal = await apiRequest<
        ApiDataEnvelope<PurchaseOrderDetail>
      >(`/api/purchase-orders/${orderedPoId}`, {
        token: userToken,
      });
      expect(poAfterFinal.body.data.status).toBe("RECEIVED");

      const invRes = await apiRequest<PaginatedResponse<InventoryBalanceView>>(
        `/api/inventory?warehouseId=${testWarehouseId}`,
        {
          token: userToken,
        },
      );
      const balanceA = invRes.body.data.find(
        (b) => b.productId === testProductAId,
      );
      const balanceB = invRes.body.data.find(
        (b) => b.productId === testProductBId,
      );
      expect(balanceA?.quantity).toBe(10);
      expect(balanceB?.quantity).toBe(20);

      const movementsRes = await apiRequest<
        PaginatedResponse<InventoryMovementView>
      >(`/api/inventory/movements?warehouseId=${testWarehouseId}`, {
        token: userToken,
      });
      expect(movementsRes.status).toBe(200);
      expect(movementsRes.body.data.length).toBe(4);
      expect(movementsRes.body.data[0]?.movementType).toBe("PURCHASE_RECEIPT");
      expect(movementsRes.body.data[0]?.referenceType).toBe("GOODS_RECEIPT");

      const auditRes = await apiRequest<PaginatedResponse<AuditLogRecord>>(
        "/api/audit-logs?entityType=GOODS_RECEIPT",
        {
          token: userToken,
        },
      );
      expect(auditRes.status).toBe(200);
      expect(auditRes.body.data.length).toBeGreaterThanOrEqual(2);
    });
  });
});
