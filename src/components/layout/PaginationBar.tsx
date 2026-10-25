import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useKernel } from "@/kernel/KernelContext";

interface PaginationBarProps {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export const PaginationBar: React.FC<PaginationBarProps> = ({
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
}) => {
  const { t } = useKernel();

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startItem = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, safePage * pageSize);

  return (
    <div
      style={{
        backgroundColor: "var(--kr-bg-elevated)",
        borderColor: "var(--kr-border)",
        color: "var(--kr-text-main)",
      }}
      className="px-4 py-2.5 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 font-mono text-[11px]"
    >
      <div className="flex flex-wrap items-center gap-3">
        <span style={{ color: "var(--kr-text-muted)" }}>
          {t("common.showing")} <strong>{startItem}</strong>–
          <strong>{endItem}</strong> {t("common.of")}{" "}
          <strong>{totalItems}</strong>
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <span
              style={{ color: "var(--kr-text-muted)" }}
              className="text-[10px]"
            >
              {t("common.rowsPerPage")}
            </span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              style={{
                backgroundColor: "var(--kr-bg-surface)",
                borderColor: "var(--kr-border)",
                color: "var(--kr-text-main)",
              }}
              className="px-2 py-0.5 border font-mono text-[10px] font-bold cursor-pointer focus:outline-none"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-1.5">
        <button
          type="button"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
          style={{
            backgroundColor: "var(--kr-bg-surface)",
            borderColor: "var(--kr-border)",
          }}
          className="px-2.5 py-1 border font-mono text-[10px] font-semibold uppercase inline-flex items-center gap-1 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-3 h-3" />
          <span>{t("common.prev")}</span>
        </button>

        <span className="px-2.5 py-1 font-mono text-[10px] font-bold">
          {t("common.page")} {safePage} / {totalPages}
        </span>

        <button
          type="button"
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(safePage + 1)}
          style={{
            backgroundColor: "var(--kr-bg-surface)",
            borderColor: "var(--kr-border)",
          }}
          className="px-2.5 py-1 border font-mono text-[10px] font-semibold uppercase inline-flex items-center gap-1 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
        >
          <span>{t("common.next")}</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
