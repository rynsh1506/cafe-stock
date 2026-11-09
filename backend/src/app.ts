import { Elysia } from "elysia";
import { logger } from "@/utils/logger";
import { handleFrontendRequest } from "@/utils/frontend-ssr";

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
