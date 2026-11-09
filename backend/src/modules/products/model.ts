import { t } from "elysia";

export interface CreateProductInput {
  sku: string;
  name: string;
  category?: string;
  unit: string;
  unitPrice?: number;
  minStock?: number;
  isActive?: boolean;
}

export interface UpdateProductInput {
  sku?: string;
  name?: string;
  category?: string;
  unit?: string;
  unitPrice?: number;
  minStock?: number;
  isActive?: boolean;
}

export interface ListProductsQuery {
  page?: string;
  limit?: string;
  search?: string;
  category?: string;
  isActive?: string;
}

export const createProductBodySchema = t.Object({
  sku: t.String({ minLength: 1 }),
  name: t.String({ minLength: 1 }),
  category: t.Optional(t.String()),
  unit: t.String({ minLength: 1 }),
  unitPrice: t.Optional(t.Number({ minimum: 0 })),
  minStock: t.Optional(t.Number({ minimum: 0 })),
  isActive: t.Optional(t.Boolean()),
});

export const updateProductBodySchema = t.Object({
  sku: t.Optional(t.String({ minLength: 1 })),
  name: t.Optional(t.String({ minLength: 1 })),
  category: t.Optional(t.String()),
  unit: t.Optional(t.String({ minLength: 1 })),
  unitPrice: t.Optional(t.Number({ minimum: 0 })),
  minStock: t.Optional(t.Number({ minimum: 0 })),
  isActive: t.Optional(t.Boolean()),
});
