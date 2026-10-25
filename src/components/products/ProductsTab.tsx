import React, { useState } from "react";
import {
  Package,
  Plus,
  Search,
  Building2,
  Warehouse as WarehouseIcon,
  CheckCircle2,
  AlertTriangle,
  X,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import { useKernel } from "@/kernel/KernelContext";
import { PaginationBar } from "@/components/layout/PaginationBar";

type MasterSubTab = "PRODUCTS" | "SUPPLIERS" | "WAREHOUSES";

export const ProductsTab: React.FC = () => {
  const {
    products,
    suppliers,
    warehouses,
    inventoryBalances,
    addProduct,
    toggleProductStatus,
    addSupplier,
    toggleSupplierStatus,
    addWarehouse,
    toggleWarehouseStatus,
  } = useStore();
  const { currentUser } = useAuth();
  const { branding, t } = useKernel();

  const [subTab, setSubTab] = useState<MasterSubTab>("PRODUCTS");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [prodPage, setProdPage] = useState<number>(1);
  const [prodPageSize, setProdPageSize] = useState<number>(10);
  const [supPage, setSupPage] = useState<number>(1);
  const [supPageSize, setSupPageSize] = useState<number>(6);
  const [whPage, setWhPage] = useState<number>(1);
  const [whPageSize, setWhPageSize] = useState<number>(6);

  // Add Product Form State
  const [sku, setSku] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [unit, setUnit] = useState<string>("KG");
  const [minStock, setMinStock] = useState<string>("20");
  const [category, setCategory] = useState<string>("Coffee Beans");

  // Add Supplier Form State
  const [supName, setSupName] = useState<string>("");
  const [supEmail, setSupEmail] = useState<string>("");
  const [supPhone, setSupPhone] = useState<string>("");

  // Add Warehouse Form State
  const [whCode, setWhCode] = useState<string>("");
  const [whName, setWhName] = useState<string>("");
  const [whLocation, setWhLocation] = useState<string>("");

  const categories = [
    "ALL",
    ...Array.from(new Set(products.map((p) => p.category))),
  ];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      selectedCategory === "ALL" || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const paginatedProducts = filteredProducts.slice(
    (prodPage - 1) * prodPageSize,
    prodPage * prodPageSize,
  );
  const paginatedSuppliers = suppliers.slice(
    (supPage - 1) * supPageSize,
    supPage * supPageSize,
  );
  const paginatedWarehouses = warehouses.slice(
    (whPage - 1) * whPageSize,
    whPage * whPageSize,
  );

  const getTotalStock = (productId: string): number =>
    inventoryBalances
      .filter((b) => b.productId === productId)
      .reduce((acc, item) => acc + item.stock, 0);

  const handleCreateProduct = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!sku.trim() || !name.trim()) {
      return;
    }
    addProduct(
      {
        sku,
        name,
        unit,
        minStock: Number(minStock) || 0,
        category,
      },
      currentUser.username,
    );
    setSku("");
    setName("");
    setMinStock("20");
    setShowAddModal(false);
  };

  const handleCreateSupplier = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!supName.trim() || !supEmail.trim()) {
      return;
    }
    addSupplier(
      {
        name: supName,
        email: supEmail,
        phone: supPhone || "-",
      },
      currentUser.username,
    );
    setSupName("");
    setSupEmail("");
    setSupPhone("");
    setShowAddModal(false);
  };

  const handleCreateWarehouse = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!whCode.trim() || !whName.trim()) {
      return;
    }
    addWarehouse(
      {
        code: whCode,
        name: whName,
        location: whLocation || "-",
      },
      currentUser.username,
    );
    setWhCode("");
    setWhName("");
    setWhLocation("");
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        style={{ borderColor: "var(--kr-border)" }}
        className="border-b pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div>
          <div
            style={{ color: "var(--kr-text-muted)" }}
            className="font-mono text-[10px] uppercase tracking-widest flex items-center gap-2"
          >
            <Package
              style={{ color: "var(--kr-accent)" }}
              className="w-3.5 h-3.5"
            />
            <span>MOD-02 // MASTER DATA REGISTRY</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight mt-1">
            {t("plugin.products.name")}
          </h1>
          <p
            style={{ color: "var(--kr-text-muted)" }}
            className="text-xs sm:text-sm mt-1 max-w-2xl"
          >
            {t("mod.products.desc")}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          style={{
            backgroundColor: "var(--kr-bg-sidebar)",
            color: "var(--kr-text-sidebar)",
          }}
          className="px-4 py-2.5 font-mono text-xs uppercase tracking-wider font-semibold flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus style={{ color: "var(--kr-accent)" }} className="w-3.5 h-3.5" />
          <span>
            {subTab === "PRODUCTS"
              ? `${t("mod.products.addSku")} ${branding.itemTerm}`
              : subTab === "SUPPLIERS"
                ? t("mod.products.addSupplier")
                : t("mod.products.addWarehouse")}
          </span>
        </button>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          style={{
            backgroundColor: "var(--kr-bg-surface)",
            borderColor: "var(--kr-border)",
          }}
          className="flex flex-wrap border"
        >
          <button
            type="button"
            onClick={() => setSubTab("PRODUCTS")}
            style={{
              backgroundColor:
                subTab === "PRODUCTS" ? "var(--kr-bg-sidebar)" : "transparent",
              color:
                subTab === "PRODUCTS"
                  ? "var(--kr-text-sidebar)"
                  : "var(--kr-text-main)",
            }}
            className="px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition"
          >
            <Package className="w-3.5 h-3.5" />
            <span>
              {t("common.sku")} ({products.length})
            </span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab("SUPPLIERS")}
            style={{
              backgroundColor:
                subTab === "SUPPLIERS" ? "var(--kr-bg-sidebar)" : "transparent",
              color:
                subTab === "SUPPLIERS"
                  ? "var(--kr-text-sidebar)"
                  : "var(--kr-text-main)",
              borderColor: "var(--kr-border)",
            }}
            className="px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-2 border-l cursor-pointer transition"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>
              {t("common.suppliers")} ({suppliers.length})
            </span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab("WAREHOUSES")}
            style={{
              backgroundColor:
                subTab === "WAREHOUSES"
                  ? "var(--kr-bg-sidebar)"
                  : "transparent",
              color:
                subTab === "WAREHOUSES"
                  ? "var(--kr-text-sidebar)"
                  : "var(--kr-text-main)",
              borderColor: "var(--kr-border)",
            }}
            className="px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-2 border-l cursor-pointer transition"
          >
            <WarehouseIcon className="w-3.5 h-3.5" />
            <span>
              {t("common.warehouses")} ({warehouses.length})
            </span>
          </button>
        </div>

        {subTab === "PRODUCTS" && (
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search
                style={{ color: "var(--kr-text-muted)" }}
                className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setProdPage(1);
                }}
                placeholder={t("common.searchPlaceholder")}
                style={{
                  backgroundColor: "var(--kr-bg-surface)",
                  borderColor: "var(--kr-border)",
                  color: "var(--kr-text-main)",
                }}
                className="w-full sm:w-56 pl-8 pr-3 py-1.5 border font-mono text-xs focus:outline-none"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setProdPage(1);
              }}
              style={{
                backgroundColor: "var(--kr-bg-surface)",
                borderColor: "var(--kr-border)",
                color: "var(--kr-text-main)",
              }}
              className="px-3 py-1.5 border font-mono text-xs uppercase focus:outline-none cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "ALL" ? t("mod.products.allCategories") : cat}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Sub-Tab 1: PRODUCTS TABLE */}
      {subTab === "PRODUCTS" && (
        <div
          style={{
            backgroundColor: "var(--kr-bg-surface)",
            borderColor: "var(--kr-border)",
          }}
          className="border overflow-x-auto"
        >
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr
                style={{
                  backgroundColor: "var(--kr-bg-elevated)",
                  borderColor: "var(--kr-border)",
                  color: "var(--kr-text-muted)",
                }}
                className="border-b font-mono text-[10px] uppercase tracking-wider"
              >
                <th className="py-3 px-4">{t("common.sku")}</th>
                <th className="py-3 px-4">
                  {t("common.name")} {branding.itemTerm}
                </th>
                <th className="py-3 px-4">{t("common.category")}</th>
                <th className="py-3 px-4">{t("common.unit")}</th>
                <th className="py-3 px-4">{t("common.minStock")}</th>
                <th className="py-3 px-4">{t("common.totalStock")}</th>
                <th className="py-3 px-4">{t("common.status")}</th>
                <th className="py-3 px-4 text-right">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody
              style={{ borderColor: "var(--kr-border)" }}
              className="divide-y"
            >
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{ color: "var(--kr-text-muted)" }}
                    className="py-8 px-4 text-center font-mono text-xs"
                  >
                    {t("common.emptyRecords")}
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => {
                  const totalStock = getTotalStock(product.id);
                  const isLow = totalStock < product.minStock;
                  return (
                    <tr
                      key={product.id}
                      style={{ borderColor: "var(--kr-border)" }}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold whitespace-nowrap">
                        {product.sku}
                      </td>
                      <td className="py-3.5 px-4 font-semibold">
                        {product.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        {product.category}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold">
                        {product.unit}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {product.minStock} {product.unit}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold">
                        <span
                          className={`inline-flex items-center gap-1 ${
                            isLow ? "text-[#9E2A20]" : "text-[#1D593B]"
                          }`}
                        >
                          {isLow ? (
                            <AlertTriangle className="w-3.5 h-3.5" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          {totalStock} {product.unit}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 font-mono text-[10px] font-bold border ${
                            product.isActive
                              ? "bg-[#E7F2EC] text-[#1D593B] border-[#B2D3C1]"
                              : "bg-[#F2EFE9] text-[#786E65] border-[#D8D0C0]"
                          }`}
                        >
                          {product.isActive
                            ? t("common.active")
                            : t("common.inactive")}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            toggleProductStatus(
                              product.id,
                              currentUser.username,
                            )
                          }
                          style={{ borderColor: "var(--kr-border)" }}
                          className="px-2.5 py-1 border font-mono text-[10px] uppercase cursor-pointer hover:opacity-80"
                        >
                          {product.isActive
                            ? t("common.deactivate")
                            : t("common.activate")}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <PaginationBar
            currentPage={prodPage}
            totalItems={filteredProducts.length}
            pageSize={prodPageSize}
            onPageChange={setProdPage}
            onPageSizeChange={(s) => {
              setProdPageSize(s);
              setProdPage(1);
            }}
          />
        </div>
      )}

      {/* Sub-Tab 2: SUPPLIERS */}
      {subTab === "SUPPLIERS" && (
        <div
          style={{
            backgroundColor: "var(--kr-bg-surface)",
            borderColor: "var(--kr-border)",
          }}
          className="border"
        >
          {paginatedSuppliers.length === 0 ? (
            <div
              style={{ color: "var(--kr-text-muted)" }}
              className="p-8 text-center font-mono text-xs"
            >
              {t("common.emptyRecords")}
            </div>
          ) : (
            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {paginatedSuppliers.map((sup) => (
                <div
                  key={sup.id}
                  style={{
                    backgroundColor: "var(--kr-bg-main)",
                    borderColor: "var(--kr-border)",
                  }}
                  className="border p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        style={{ color: "var(--kr-text-muted)" }}
                        className="font-mono text-[10px] uppercase"
                      >
                        ID // {sup.id.toUpperCase()}
                      </span>
                      <span
                        className={`px-2 py-0.5 font-mono text-[9px] font-bold border ${
                          sup.isActive
                            ? "bg-[#E7F2EC] text-[#1D593B] border-[#B2D3C1]"
                            : "bg-[#FCEAE8] text-[#9E2A20] border-[#E6B8B3]"
                        }`}
                      >
                        {sup.isActive
                          ? t("common.active")
                          : t("common.inactive")}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg font-medium">
                      {sup.name}
                    </h3>
                    <div
                      style={{ color: "var(--kr-text-muted)" }}
                      className="font-mono text-xs mt-2 space-y-1"
                    >
                      <div>Email: {sup.email}</div>
                      <div>Phone: {sup.phone}</div>
                    </div>
                  </div>
                  <div
                    style={{ borderColor: "var(--kr-border)" }}
                    className="mt-4 pt-3 border-t flex justify-end"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        toggleSupplierStatus(sup.id, currentUser.username)
                      }
                      style={{ borderColor: "var(--kr-border)" }}
                      className="px-3 py-1 border font-mono text-[10px] uppercase cursor-pointer"
                    >
                      {sup.isActive
                        ? t("common.deactivate")
                        : t("common.activate")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <PaginationBar
            currentPage={supPage}
            totalItems={suppliers.length}
            pageSize={supPageSize}
            onPageChange={setSupPage}
            onPageSizeChange={(s) => {
              setSupPageSize(s);
              setSupPage(1);
            }}
          />
        </div>
      )}

      {/* Sub-Tab 3: WAREHOUSES */}
      {subTab === "WAREHOUSES" && (
        <div
          style={{
            backgroundColor: "var(--kr-bg-surface)",
            borderColor: "var(--kr-border)",
          }}
          className="border"
        >
          {paginatedWarehouses.length === 0 ? (
            <div
              style={{ color: "var(--kr-text-muted)" }}
              className="p-8 text-center font-mono text-xs"
            >
              {t("common.emptyRecords")}
            </div>
          ) : (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedWarehouses.map((wh) => {
                const whItems = inventoryBalances.filter(
                  (b) => b.warehouseId === wh.id,
                );
                const totalUnits = whItems.reduce((sum, i) => sum + i.stock, 0);
                return (
                  <div
                    key={wh.id}
                    style={{
                      backgroundColor: "var(--kr-bg-main)",
                      borderColor: "var(--kr-border)",
                    }}
                    className="border p-5"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 border border-[#C69249] text-[#8A4B14] bg-[#F9EFE0]">
                        {wh.code}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          toggleWarehouseStatus(wh.id, currentUser.username)
                        }
                        className={`font-mono text-[10px] font-semibold px-2 py-0.5 border cursor-pointer ${
                          wh.isActive
                            ? "text-[#1D593B] bg-[#E7F2EC] border-[#B2D3C1]"
                            : "text-[#9E2A20] bg-[#FCEAE8] border-[#E6B8B3]"
                        }`}
                      >
                        ●{" "}
                        {wh.isActive
                          ? t("common.active")
                          : t("common.inactive")}
                      </button>
                    </div>
                    <h3 className="font-serif text-xl font-medium mt-1">
                      {wh.name}
                    </h3>
                    <p
                      style={{ color: "var(--kr-text-muted)" }}
                      className="text-xs mt-1"
                    >
                      {wh.location}
                    </p>
                    <div
                      style={{ borderColor: "var(--kr-border)" }}
                      className="mt-4 pt-3 border-t flex items-center justify-between font-mono text-xs"
                    >
                      <span>SKU: {whItems.length}</span>
                      <span className="font-bold">
                        {t("common.totalStock")}: {totalUnits}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <PaginationBar
            currentPage={whPage}
            totalItems={warehouses.length}
            pageSize={whPageSize}
            onPageChange={setWhPage}
            onPageSizeChange={(s) => {
              setWhPageSize(s);
              setWhPage(1);
            }}
          />
        </div>
      )}

      {/* Modal Form Add Master Data */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div
            style={{
              backgroundColor: "var(--kr-bg-surface)",
              borderColor: "var(--kr-border)",
              color: "var(--kr-text-main)",
            }}
            className="w-full max-w-md border p-6 shadow-2xl"
          >
            <div
              style={{ borderColor: "var(--kr-border)" }}
              className="flex items-center justify-between border-b pb-3 mb-4"
            >
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider">
                {subTab === "PRODUCTS"
                  ? `${t("mod.products.addSku")} ${branding.itemTerm.toUpperCase()}`
                  : subTab === "SUPPLIERS"
                    ? t("mod.products.addSupplier")
                    : t("mod.products.addWarehouse")}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {subTab === "PRODUCTS" && (
              <form onSubmit={handleCreateProduct} className="space-y-3.5">
                <div>
                  <label className="block font-mono text-[10px] uppercase mb-1">
                    {t("common.sku")}
                  </label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="SKU-001"
                    style={{
                      backgroundColor: "var(--kr-bg-main)",
                      borderColor: "var(--kr-border)",
                      color: "var(--kr-text-main)",
                    }}
                    className="w-full px-3 py-2 border font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase mb-1">
                    {t("common.name")} {branding.itemTerm}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={branding.itemTerm}
                    style={{
                      backgroundColor: "var(--kr-bg-main)",
                      borderColor: "var(--kr-border)",
                      color: "var(--kr-text-main)",
                    }}
                    className="w-full px-3 py-2 border text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[10px] uppercase mb-1">
                      {t("common.unit")}
                    </label>
                    <input
                      type="text"
                      required
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="KG / PCS / LITER"
                      style={{
                        backgroundColor: "var(--kr-bg-main)",
                        borderColor: "var(--kr-border)",
                        color: "var(--kr-text-main)",
                      }}
                      className="w-full px-3 py-2 border font-mono text-xs uppercase"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase mb-1">
                      {t("common.minStock")}
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={minStock}
                      onChange={(e) => setMinStock(e.target.value)}
                      style={{
                        backgroundColor: "var(--kr-bg-main)",
                        borderColor: "var(--kr-border)",
                        color: "var(--kr-text-main)",
                      }}
                      className="w-full px-3 py-2 border font-mono text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase mb-1">
                    {t("common.category")}
                  </label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{
                      backgroundColor: "var(--kr-bg-main)",
                      borderColor: "var(--kr-border)",
                      color: "var(--kr-text-main)",
                    }}
                    className="w-full px-3 py-2 border text-xs"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    style={{ borderColor: "var(--kr-border)" }}
                    className="px-4 py-2 border font-mono text-xs uppercase cursor-pointer"
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    type="submit"
                    style={{
                      backgroundColor: "var(--kr-bg-sidebar)",
                      color: "var(--kr-text-sidebar)",
                    }}
                    className="px-4 py-2 font-mono text-xs font-bold uppercase cursor-pointer"
                  >
                    {t("common.save")}
                  </button>
                </div>
              </form>
            )}

            {subTab === "SUPPLIERS" && (
              <form onSubmit={handleCreateSupplier} className="space-y-3.5">
                <div>
                  <label className="block font-mono text-[10px] uppercase mb-1">
                    {t("common.supplier")}
                  </label>
                  <input
                    type="text"
                    required
                    value={supName}
                    onChange={(e) => setSupName(e.target.value)}
                    placeholder="Supplier Co."
                    style={{
                      backgroundColor: "var(--kr-bg-main)",
                      borderColor: "var(--kr-border)",
                      color: "var(--kr-text-main)",
                    }}
                    className="w-full px-3 py-2 border text-xs"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={supEmail}
                    onChange={(e) => setSupEmail(e.target.value)}
                    placeholder="order@supplier.com"
                    style={{
                      backgroundColor: "var(--kr-bg-main)",
                      borderColor: "var(--kr-border)",
                      color: "var(--kr-text-main)",
                    }}
                    className="w-full px-3 py-2 border font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    required
                    value={supPhone}
                    onChange={(e) => setSupPhone(e.target.value)}
                    placeholder="+62 811-0000-0000"
                    style={{
                      backgroundColor: "var(--kr-bg-main)",
                      borderColor: "var(--kr-border)",
                      color: "var(--kr-text-main)",
                    }}
                    className="w-full px-3 py-2 border font-mono text-xs"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    style={{ borderColor: "var(--kr-border)" }}
                    className="px-4 py-2 border font-mono text-xs uppercase cursor-pointer"
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    type="submit"
                    style={{
                      backgroundColor: "var(--kr-bg-sidebar)",
                      color: "var(--kr-text-sidebar)",
                    }}
                    className="px-4 py-2 font-mono text-xs font-bold uppercase cursor-pointer"
                  >
                    {t("common.save")}
                  </button>
                </div>
              </form>
            )}

            {subTab === "WAREHOUSES" && (
              <form onSubmit={handleCreateWarehouse} className="space-y-3.5">
                <div>
                  <label className="block font-mono text-[10px] uppercase mb-1">
                    Code
                  </label>
                  <input
                    type="text"
                    required
                    value={whCode}
                    onChange={(e) => setWhCode(e.target.value)}
                    placeholder="WH-01"
                    style={{
                      backgroundColor: "var(--kr-bg-main)",
                      borderColor: "var(--kr-border)",
                      color: "var(--kr-text-main)",
                    }}
                    className="w-full px-3 py-2 border font-mono text-xs uppercase"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase mb-1">
                    {t("common.warehouse")}
                  </label>
                  <input
                    type="text"
                    required
                    value={whName}
                    onChange={(e) => setWhName(e.target.value)}
                    placeholder="Main Warehouse"
                    style={{
                      backgroundColor: "var(--kr-bg-main)",
                      borderColor: "var(--kr-border)",
                      color: "var(--kr-text-main)",
                    }}
                    className="w-full px-3 py-2 border text-xs"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    required
                    value={whLocation}
                    onChange={(e) => setWhLocation(e.target.value)}
                    placeholder="Address"
                    style={{
                      backgroundColor: "var(--kr-bg-main)",
                      borderColor: "var(--kr-border)",
                      color: "var(--kr-text-main)",
                    }}
                    className="w-full px-3 py-2 border text-xs"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    style={{ borderColor: "var(--kr-border)" }}
                    className="px-4 py-2 border font-mono text-xs uppercase cursor-pointer"
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    type="submit"
                    style={{
                      backgroundColor: "var(--kr-bg-sidebar)",
                      color: "var(--kr-text-sidebar)",
                    }}
                    className="px-4 py-2 font-mono text-xs font-bold uppercase cursor-pointer"
                  >
                    {t("common.save")}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
