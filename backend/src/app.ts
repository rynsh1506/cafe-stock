import { Elysia } from "elysia";
import { auditLogsModule } from "@/modules/audit-logs";
import { authModule } from "@/modules/auth";
import { goodsReceiptsModule } from "@/modules/goods-receipts";
import { inventoryModule } from "@/modules/inventory";
import { productsModule } from "@/modules/products";
import { purchaseOrdersModule } from "@/modules/purchase-orders";
import { purchaseRequestsModule } from "@/modules/purchase-requests";
import { setupModule } from "@/modules/setup";
import { suppliersModule } from "@/modules/suppliers";
import { warehousesModule } from "@/modules/warehouses";
import { AppError } from "@/utils/errors";
import { handleFrontendRequest } from "@/utils/frontend-ssr";
import { logger } from "@/utils/logger";

export const APP_VERSION = "3.0.0";

export const app = new Elysia()
  .onRequest(({ request }) => {
    const url = new URL(request.url);
    logger.info("Incoming HTTP request", {
      method: request.method,
      path: url.pathname,
    });
  })
  .onError(({ code, error, set, request }) => {
    const url = new URL(request.url);

    if (error instanceof AppError) {
      set.status = error.statusCode;
      logger.warn("Handled business/domain error", {
        statusCode: error.statusCode,
        code: error.code,
        method: request.method,
        path: url.pathname,
        message: error.message,
      });
      return {
        error: {
          code: error.code,
          message: error.message,
        },
      };
    }

    const message =
      error instanceof Error ? error.message : "Unexpected server error";

    logger.error("HTTP request error", {
      code,
      method: request.method,
      path: url.pathname,
      message,
    });

    if (code === "VALIDATION") {
      set.status = 422;
      return {
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed",
        },
      };
    }

    if (code === "NOT_FOUND") {
      set.status = 404;
      return {
        error: {
          code: "NOT_FOUND",
          message: "Requested resource was not found",
        },
      };
    }

    set.status = 500;
    return {
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message,
      },
    };
  })
  .get("/api/health", () => ({
    status: "ok",
    version: APP_VERSION,
    timestamp: new Date().toISOString(),
  }))
  .use(authModule)
  .use(setupModule)
  .use(productsModule)
  .use(suppliersModule)
  .use(warehousesModule)
  .use(purchaseRequestsModule)
  .use(purchaseOrdersModule)
  .use(goodsReceiptsModule)
  .use(inventoryModule)
  .use(auditLogsModule)
  .all("/api/*", ({ set }) => {
    set.status = 404;
    return {
      error: {
        code: "API_ROUTE_NOT_FOUND",
        message: "The requested API endpoint does not exist",
      },
    };
  })
  .all("*", ({ request }) => handleFrontendRequest(request));

(globalThis as Record<string, unknown>).__CAFESTOCK_API_HANDLER = (
  request: Request,
): Promise<Response> => app.handle(request);
