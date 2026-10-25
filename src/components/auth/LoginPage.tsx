import React, { useState } from "react";
import {
  Coffee,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Globe,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useKernel } from "@/kernel/KernelContext";

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { branding, locale, availableLocales, setLocale, t } = useKernel();
  const [username, setUsername] = useState<string>("user_procurement");
  const [password, setPassword] = useState<string>("password123");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      login(username);
      setIsLoading(false);
    }, 250);
  };

  const workflowStages = [
    {
      code: `01 / ${branding.documentPrefixPR}`,
      title: t("plugin.purchaseRequests.name"),
      desc: "DRAFT → SUBMITTED",
    },
    {
      code: "02 / REV",
      title: "APPROVER CLEARANCE",
      desc: "APPROVED / REJECTED",
    },
    {
      code: `03 / ${branding.documentPrefixPO}`,
      title: t("plugin.purchaseOrders.name"),
      desc: "ORDERED → SUPPLIER",
    },
    {
      code: `04 / ${branding.documentPrefixGR}`,
      title: t("plugin.goodsReceipts.name"),
      desc: "RECEIVED → STOCK LEDGER",
    },
  ];

  return (
    <div
      style={{
        backgroundColor: "var(--kr-bg-main)",
        color: "var(--kr-text-main)",
      }}
      className="min-h-screen w-full flex flex-col lg:flex-row select-none"
    >
      {/* Sisi Kiri: Editorial Supply Manifest */}
      <div
        style={{
          backgroundColor: "var(--kr-bg-sidebar)",
          color: "var(--kr-text-sidebar)",
          borderColor: "var(--kr-border-sidebar)",
        }}
        className="lg:w-[46%] p-7 sm:p-12 lg:p-14 flex flex-col justify-between border-b lg:border-b-0 lg:border-r shrink-0"
      >
        <div>
          <div
            style={{ borderColor: "var(--kr-border-sidebar)" }}
            className="flex items-center justify-between border-b pb-5"
          >
            <div className="flex items-center gap-3">
              <div
                style={{
                  backgroundColor: "var(--kr-bg-sidebar-header)",
                  borderColor: "var(--kr-border-sidebar)",
                  color: "var(--kr-accent)",
                }}
                className="w-9 h-9 border flex items-center justify-center"
              >
                <Coffee className="w-4 h-4" />
              </div>
              <div>
                <div className="font-serif font-semibold text-xl tracking-tight flex items-center gap-2">
                  {branding.appName}
                  <span
                    style={{
                      backgroundColor: "var(--kr-bg-sidebar-header)",
                      borderColor: "var(--kr-border-sidebar)",
                      color: "var(--kr-accent)",
                    }}
                    className="font-mono text-[10px] font-medium uppercase px-1.5 py-0.5 border"
                  >
                    KERNEL v2.1
                  </span>
                </div>
                <div className="font-mono text-[10px] uppercase tracking-widest opacity-65">
                  {branding.appSubtitle}
                </div>
              </div>
            </div>
            <div className="hidden sm:block text-right font-mono text-[10px] opacity-60 leading-relaxed">
              <div>{t("login.docStamp")}</div>
              <div>{t("login.activeWarehouses")}</div>
            </div>
          </div>

          <div className="mt-10 lg:mt-14 space-y-5">
            <div
              style={{ color: "var(--kr-accent)" }}
              className="font-mono text-[11px] uppercase tracking-[0.18em] flex items-center gap-2"
            >
              <span
                style={{ backgroundColor: "var(--kr-accent)" }}
                className="inline-block w-5 h-[1px]"
              />
              <span>{t("login.ledgerSubtitle")}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-normal leading-[1.12] tracking-tight">
              {t("login.heroLine1")}
              <br />
              <span style={{ color: "var(--kr-accent)" }} className="italic">
                {t("login.heroLine2")}
              </span>
            </h1>

            <p className="text-xs sm:text-sm opacity-75 leading-relaxed max-w-md font-normal">
              {t("login.heroDesc")}
            </p>
          </div>
        </div>

        <div className="my-8 lg:my-0">
          <div className="font-mono text-[10px] uppercase tracking-widest opacity-60 mb-2.5">
            {t("login.chainTitle")}
          </div>
          <div
            style={{ borderColor: "var(--kr-border-sidebar)" }}
            className="grid grid-cols-1 sm:grid-cols-2 border-t border-l"
          >
            {workflowStages.map((stage) => (
              <div
                key={stage.code}
                style={{
                  borderColor: "var(--kr-border-sidebar)",
                  backgroundColor: "var(--kr-bg-sidebar-header)",
                }}
                className="p-3.5 border-r border-b"
              >
                <div
                  style={{ color: "var(--kr-accent)" }}
                  className="font-mono text-[10px] font-semibold"
                >
                  {stage.code}
                </div>
                <div className="text-xs font-semibold mt-1">{stage.title}</div>
                <div className="font-mono text-[10px] opacity-60 mt-0.5 leading-snug">
                  {stage.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{ borderColor: "var(--kr-border-sidebar)" }}
          className="flex items-center justify-between text-[11px] font-mono opacity-60 border-t pt-4"
        >
          <span>MICROKERNEL // {branding.appName.toUpperCase()}</span>
          <span>{branding.orgName.toUpperCase()}</span>
        </div>
      </div>

      {/* Sisi Kanan: Formulir Masuk */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-16">
        <div className="w-full max-w-md">
          {/* Top Document Tag & Scalable Language Dropdown */}
          <div
            style={{ borderColor: "var(--kr-border)" }}
            className="flex items-center justify-between border-b pb-3 mb-7 gap-2"
          >
            <span
              style={{ color: "var(--kr-text-muted)" }}
              className="font-mono text-[10px] uppercase tracking-widest truncate"
            >
              {t("login.formTag")}
            </span>

            <div
              style={{
                backgroundColor: "var(--kr-bg-surface)",
                borderColor: "var(--kr-border)",
              }}
              className="flex items-center border px-2 py-1 shrink-0"
            >
              <Globe
                style={{ color: "var(--kr-text-muted)" }}
                className="w-3.5 h-3.5 mr-1.5 shrink-0"
              />
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                aria-label={t("common.language")}
                style={{
                  backgroundColor: "var(--kr-bg-surface)",
                  color: "var(--kr-text-main)",
                }}
                className="font-mono text-[10px] font-bold uppercase focus:outline-none cursor-pointer"
              >
                {availableLocales.map((loc) => (
                  <option key={loc.code} value={loc.code}>
                    {loc.code.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-7">
            <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight">
              {t("login.welcomeTitle")}
            </h2>
            <p
              style={{ color: "var(--kr-text-muted)" }}
              className="text-xs sm:text-sm mt-1"
            >
              {t("login.welcomeDesc")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block font-mono text-[10px] font-semibold uppercase tracking-widest mb-1.5"
              >
                {t("login.usernameLabel")}
              </label>
              <div className="relative">
                <div
                  style={{ color: "var(--kr-text-muted)" }}
                  className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
                >
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="user_procurement"
                  style={{
                    backgroundColor: "var(--kr-bg-surface)",
                    borderColor: "var(--kr-border)",
                    color: "var(--kr-text-main)",
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border text-sm font-mono focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block font-mono text-[10px] font-semibold uppercase tracking-widest"
                >
                  {t("login.passwordLabel")}
                </label>
                <span
                  style={{ color: "var(--kr-text-muted)" }}
                  className="font-mono text-[10px]"
                >
                  {t("login.defaultPassHint")}
                </span>
              </div>
              <div className="relative">
                <div
                  style={{ color: "var(--kr-text-muted)" }}
                  className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
                >
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    backgroundColor: "var(--kr-bg-surface)",
                    borderColor: "var(--kr-border)",
                    color: "var(--kr-text-main)",
                  }}
                  className="w-full pl-10 pr-11 py-2.5 border text-sm font-mono focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ color: "var(--kr-text-muted)" }}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center transition cursor-pointer"
                  aria-label="Toggle password"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 accent-[#261B16]"
                />
                <span
                  style={{ color: "var(--kr-text-muted)" }}
                  className="text-xs"
                >
                  {t("login.rememberShift")}
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                backgroundColor: "var(--kr-bg-sidebar)",
                color: "var(--kr-text-sidebar)",
              }}
              className="w-full py-3 px-4 text-xs font-mono uppercase tracking-widest font-semibold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <span>{t("login.submittingBtn")}</span>
              ) : (
                <>
                  <span>{t("login.submitBtn")}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
