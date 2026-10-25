import React, { useState } from "react";
import { ShieldCheck, Search, RotateCcw } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { useKernel } from "@/kernel/KernelContext";
import { PaginationBar } from "@/components/layout/PaginationBar";

export const AuditLogsTab: React.FC = () => {
  const { auditLogs, resetStoreData } = useStore();
  const { t } = useKernel();

  const [entityFilter, setEntityFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [logPage, setLogPage] = useState<number>(1);
  const [logPageSize, setLogPageSize] = useState<number>(10);

  const entities = [
    "ALL",
    ...Array.from(new Set(auditLogs.map((l) => l.entity))),
  ];

  const filteredLogs = auditLogs.filter((log) => {
    const matchesEntity = entityFilter === "ALL" || log.entity === entityFilter;
    const matchesSearch =
      log.entityId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.performedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.details ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesEntity && matchesSearch;
  });

  const paginatedLogs = filteredLogs.slice(
    (logPage - 1) * logPageSize,
    logPage * logPageSize,
  );

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
            <ShieldCheck
              style={{ color: "var(--kr-accent)" }}
              className="w-3.5 h-3.5"
            />
            <span>MOD-07 // IMMUTABLE COMPLIANCE AUDIT TRAIL</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight mt-1">
            {t("plugin.auditLogs.name")}
          </h1>
          <p
            style={{ color: "var(--kr-text-muted)" }}
            className="text-xs sm:text-sm mt-1 max-w-2xl"
          >
            {t("mod.audit.desc")}
          </p>
        </div>

        <button
          type="button"
          onClick={resetStoreData}
          style={{
            backgroundColor: "var(--kr-bg-surface)",
            borderColor: "var(--kr-border)",
          }}
          className="px-3.5 py-2 border font-mono text-[11px] uppercase tracking-wider font-semibold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t("common.reset")}</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {entities.map((ent) => (
            <button
              key={ent}
              type="button"
              onClick={() => {
                setEntityFilter(ent);
                setLogPage(1);
              }}
              style={{
                backgroundColor:
                  entityFilter === ent
                    ? "var(--kr-bg-sidebar)"
                    : "var(--kr-bg-surface)",
                color:
                  entityFilter === ent
                    ? "var(--kr-text-sidebar)"
                    : "var(--kr-text-main)",
                borderColor: "var(--kr-border)",
              }}
              className="px-3 py-1.5 border font-mono text-[10px] font-semibold uppercase tracking-wider cursor-pointer"
            >
              {ent === "ALL"
                ? `${t("mod.audit.allEntities")} (${auditLogs.length})`
                : ent}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search
            style={{ color: "var(--kr-text-muted)" }}
            className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setLogPage(1);
            }}
            placeholder={t("mod.audit.searchPlaceholder")}
            style={{
              backgroundColor: "var(--kr-bg-surface)",
              borderColor: "var(--kr-border)",
              color: "var(--kr-text-main)",
            }}
            className="w-full pl-8 pr-3 py-1.5 border font-mono text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* Audit Log Table */}
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
              <th className="py-3 px-4">{t("mod.inv.recordedTime")}</th>
              <th className="py-3 px-4">{t("mod.audit.colEntity")}</th>
              <th className="py-3 px-4">{t("mod.audit.colRefId")}</th>
              <th className="py-3 px-4">{t("mod.audit.colAction")}</th>
              <th className="py-3 px-4">{t("mod.audit.colActor")}</th>
              <th className="py-3 px-4">{t("mod.audit.colDetails")}</th>
            </tr>
          </thead>
          <tbody
            style={{ borderColor: "var(--kr-border)" }}
            className="divide-y"
          >
            {paginatedLogs.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{ color: "var(--kr-text-muted)" }}
                  className="py-8 px-4 text-center font-mono text-xs"
                >
                  {t("common.emptyRecords")}
                </td>
              </tr>
            ) : (
              paginatedLogs.map((log) => (
                <tr key={log.id} style={{ borderColor: "var(--kr-border)" }}>
                  <td className="py-3.5 px-4 font-mono text-[11px] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] font-semibold">
                    {log.entity}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold whitespace-nowrap">
                    {log.entityId}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 font-mono text-[10px] font-bold border bg-[#F9EFE0] text-[#8A4B14] border-[#DEC19B]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    {log.performedBy}
                  </td>
                  <td className="py-3.5 px-4">{log.details ?? "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <PaginationBar
          currentPage={logPage}
          totalItems={filteredLogs.length}
          pageSize={logPageSize}
          onPageChange={setLogPage}
          onPageSizeChange={(s) => {
            setLogPageSize(s);
            setLogPage(1);
          }}
        />
      </div>
    </div>
  );
};
