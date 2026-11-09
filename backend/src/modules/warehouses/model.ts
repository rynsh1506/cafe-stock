import { t } from "elysia";

export interface CreateWarehouseInput {
  code: string;
  name: string;
  address?: string;
  isActive?: boolean;
}

export interface UpdateWarehouseInput {
  code?: string;
  name?: string;
  address?: string;
  isActive?: boolean;
}

export interface ListWarehousesQuery {
  page?: string;
  limit?: string;
  search?: string;
  isActive?: string;
}

export const createWarehouseBodySchema = t.Object({
  code: t.String({ minLength: 1 }),
  name: t.String({ minLength: 1 }),
  address: t.Optional(t.String()),
  isActive: t.Optional(t.Boolean()),
});

export const updateWarehouseBodySchema = t.Object({
  code: t.Optional(t.String({ minLength: 1 })),
  name: t.Optional(t.String({ minLength: 1 })),
  address: t.Optional(t.String()),
  isActive: t.Optional(t.Boolean()),
});
