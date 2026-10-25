import React, { useState } from "react";
import { ShieldCheck, Search, RotateCcw } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { useKernel } from "@/kernel/KernelContext";

export const AuditLogsTab: React.FC = () => {
  const { auditLogs, resetStoreData } = useStore();
  const { t } = useKernel();

  const [entityFilter, setEntityFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

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
          title="Reset seluruh data transaksi ke kondisi awal seeder"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Data Seeder</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {entities.map((ent) => (
            <button
              key={ent}
              type="button"
              onClick={() => setEntityFilter(ent)}
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
              {ent === "ALL" ? `SEMUA ENTITAS (${auditLogs.length})` : ent}
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
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari ID dokumen, aksi, petugas..."
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
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Entitas</th>
              <th className="py-3 px-4">ID Referensi</th>
              <th className="py-3 px-4">Aksi Sistem</th>
              <th className="py-3 px-4">Petugas</th>
              <th className="py-3 px-4">Rincian Kejadian</th>
            </tr>
          </thead>
          <tbody
            style={{ borderColor: "var(--kr-border)" }}
            className="divide-y"
          >
            {filteredLogs.map((log) => (
              <tr key={log.id} style={{ borderColor: "var(--kr-border)" }}>
                <td className="py-3.5 px-4 font-mono text-[11px] whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
