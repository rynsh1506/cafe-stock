import React, { useState } from "react";
import {
  Coffee,
  Lock,
  User,
  Mail,
  BadgeCheck,
  Eye,
  EyeOff,
  ArrowRight,
  Globe,
  UserPlus,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useKernel } from "@/kernel/KernelContext";
import { TranslationKey } from "@/kernel/i18n";
import { UserRole } from "@/types";

export const LoginPage: React.FC = () => {
  const { hasInitializedAccount, registerAccount, loginWithPassword } =
    useAuth();
  const { branding, locale, availableLocales, setLocale, t } = useKernel();

  const [mode, setMode] = useState<"LOGIN" | "REGISTER">(
    hasInitializedAccount ? "LOGIN" : "REGISTER",
  );

  // Login Form State (Starts empty like a real production app)
  const [loginIdentifier, setLoginIdentifier] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // First-Run Setup / Register Form State
  const [fullName, setFullName] = useState<string>("");
  const [regUsername, setRegUsername] = useState<string>("");
  const [regEmail, setRegEmail] = useState<string>("");
  const [regPassword, setRegPassword] = useState<string>("");
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>("");
  const [regRole, setRegRole] = useState<UserRole>("APPROVER");

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const isFirstRunSetup = !hasInitializedAccount;
  const activeMode = isFirstRunSetup ? "REGISTER" : mode;

  const handleLoginSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    setErrorMessage("");
    const res = loginWithPassword(loginIdentifier, loginPassword, rememberMe);
    if (!res.ok && res.errorKey) {
      setErrorMessage(t(res.errorKey as TranslationKey));
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    setErrorMessage("");

    if (regPassword !== regConfirmPassword) {
      setErrorMessage(t("login.errPassMismatch"));
      return;
    }

    const res = registerAccount(
      {
        name: fullName,
        username: regUsername,
        email: regEmail,
        password: regPassword,
        role: isFirstRunSetup ? "APPROVER" : regRole,
      },
      true,
    );

    if (!res.ok && res.errorKey) {
      setErrorMessage(t(res.errorKey as TranslationKey));
    }
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
      {/* Left Side: Editorial Supply Manifest */}
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

      {/* Right Side: First-Run Account Setup OR Standard Login */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-16">
        <div className="w-full max-w-md">
          {/* Top Document Tag & Compact Language Code Dropdown */}
          <div
            style={{ borderColor: "var(--kr-border)" }}
            className="flex items-center justify-between border-b pb-3 mb-6 gap-2"
          >
            <span
              style={{
                color: isFirstRunSetup
                  ? "var(--kr-accent)"
                  : "var(--kr-text-muted)",
              }}
              className="font-mono text-[10px] font-semibold uppercase tracking-widest truncate"
            >
              {isFirstRunSetup ? t("login.setupTag") : t("login.formTag")}
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

          <div className="mb-6">
            <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight">
              {isFirstRunSetup
                ? t("login.setupTitle")
                : activeMode === "REGISTER"
                  ? t("login.registerTitle")
                  : t("login.welcomeTitle")}
            </h2>
            <p
              style={{ color: "var(--kr-text-muted)" }}
              className="text-xs sm:text-sm mt-1 leading-relaxed"
            >
              {isFirstRunSetup
                ? t("login.setupDesc")
                : activeMode === "REGISTER"
                  ? t("login.registerDesc")
                  : t("login.welcomeDesc")}
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 border border-[#9E2A20] bg-[#FCEAE8] text-[#9E2A20] font-mono text-xs">
              {errorMessage}
            </div>
          )}

          {activeMode === "REGISTER" ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block font-mono text-[10px] font-semibold uppercase tracking-widest mb-1">
                  {t("login.fullNameLabel")}
                </label>
                <div className="relative">
                  <div
                    style={{ color: "var(--kr-text-muted)" }}
                    className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
                  >
                    <BadgeCheck className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="cth: Muhammad Riyansyah"
                    style={{
                      backgroundColor: "var(--kr-bg-surface)",
                      borderColor: "var(--kr-border)",
                      color: "var(--kr-text-main)",
                    }}
                    className="w-full pl-10 pr-4 py-2.5 border text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] font-semibold uppercase tracking-widest mb-1">
                    {t("login.usernameLabel")}
                  </label>
                  <div className="relative">
                    <div
                      style={{ color: "var(--kr-text-muted)" }}
                      className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                    >
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      required
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="admin_utama"
                      style={{
                        backgroundColor: "var(--kr-bg-surface)",
                        borderColor: "var(--kr-border)",
                        color: "var(--kr-text-main)",
                      }}
                      className="w-full pl-9 pr-3 py-2.5 border text-xs font-mono focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[10px] font-semibold uppercase tracking-widest mb-1">
                    {t("login.emailLabel")}
                  </label>
                  <div className="relative">
                    <div
                      style={{ color: "var(--kr-text-muted)" }}
                      className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="admin@perusahaan.id"
                      style={{
                        backgroundColor: "var(--kr-bg-surface)",
                        borderColor: "var(--kr-border)",
                        color: "var(--kr-text-main)",
                      }}
                      className="w-full pl-9 pr-3 py-2.5 border text-xs font-mono focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {!isFirstRunSetup && (
                <div>
                  <label className="block font-mono text-[10px] font-semibold uppercase tracking-widest mb-1">
                    {t("login.roleLabel")}
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    style={{
                      backgroundColor: "var(--kr-bg-surface)",
                      borderColor: "var(--kr-border)",
                      color: "var(--kr-text-main)",
                    }}
                    className="w-full px-3 py-2.5 border font-mono text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="APPROVER">{t("login.roleApprover")}</option>
                    <option value="USER">{t("login.roleUser")}</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] font-semibold uppercase tracking-widest mb-1">
                    {t("login.passwordLabel")}
                  </label>
                  <div className="relative">
                    <div
                      style={{ color: "var(--kr-text-muted)" }}
                      className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                    >
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{
                        backgroundColor: "var(--kr-bg-surface)",
                        borderColor: "var(--kr-border)",
                        color: "var(--kr-text-main)",
                      }}
                      className="w-full pl-9 pr-9 py-2.5 border text-xs font-mono focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ color: "var(--kr-text-muted)" }}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[10px] font-semibold uppercase tracking-widest mb-1">
                    {t("login.confirmPassLabel")}
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      backgroundColor: "var(--kr-bg-surface)",
                      borderColor: "var(--kr-border)",
                      color: "var(--kr-text-main)",
                    }}
                    className="w-full px-3 py-2.5 border text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  backgroundColor: "var(--kr-bg-sidebar)",
                  color: "var(--kr-text-sidebar)",
                }}
                className="w-full mt-2 py-3 px-4 text-xs font-mono uppercase tracking-widest font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>
                  {isFirstRunSetup
                    ? t("login.createFirstBtn")
                    : t("login.registerBtn")}
                </span>
              </button>

              {!isFirstRunSetup && (
                <div
                  style={{ borderColor: "var(--kr-border)" }}
                  className="pt-4 border-t text-center"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage("");
                      setMode("LOGIN");
                    }}
                    className="font-mono text-xs underline cursor-pointer"
                  >
                    {t("login.switchToLogin")}
                  </button>
                </div>
              )}
            </form>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
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
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="Username / Email"
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
                <label
                  htmlFor="password"
                  className="block font-mono text-[10px] font-semibold uppercase tracking-widest mb-1.5"
                >
                  {t("login.passwordLabel")}
                </label>
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
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
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
                style={{
                  backgroundColor: "var(--kr-bg-sidebar)",
                  color: "var(--kr-text-sidebar)",
                }}
                className="w-full py-3 px-4 text-xs font-mono uppercase tracking-widest font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t("login.submitBtn")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div
                style={{ borderColor: "var(--kr-border)" }}
                className="pt-4 border-t text-center"
              >
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage("");
                    setMode("REGISTER");
                  }}
                  className="font-mono text-xs underline cursor-pointer"
                >
                  {t("login.switchToRegister")}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
