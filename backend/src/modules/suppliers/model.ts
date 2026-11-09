import { t } from "elysia";

export interface CreateSupplierInput {
  code: string;
  name: string;
  contactEmail?: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
}

export interface UpdateSupplierInput {
  code?: string;
  name?: string;
  contactEmail?: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
}

export interface ListSuppliersQuery {
  page?: string;
  limit?: string;
  search?: string;
  isActive?: string;
}

export const createSupplierBodySchema = t.Object({
  code: t.String({ minLength: 1 }),
  name: t.String({ minLength: 1 }),
  contactEmail: t.Optional(t.String()),
  phone: t.Optional(t.String()),
  address: t.Optional(t.String()),
  isActive: t.Optional(t.Boolean()),
});

export const updateSupplierBodySchema = t.Object({
  code: t.Optional(t.String({ minLength: 1 })),
  name: t.Optional(t.String({ minLength: 1 })),
  contactEmail: t.Optional(t.String()),
  phone: t.Optional(t.String()),
  address: t.Optional(t.String()),
  isActive: t.Optional(t.Boolean()),
});
