import React, { useState } from "react";
import {
  Coffee,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types";

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState<string>("user_procurement");
  const [password, setPassword] = useState<string>("password123");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [selectedRole, setSelectedRole] = useState<UserRole>("USER");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      login(username, selectedRole);
      setIsLoading(false);
    }, 400);
  };

  const handleQuickDemo = (role: UserRole, demoUsername: string): void => {
    setSelectedRole(role);
    setUsername(demoUsername);
    setPassword("password123");
    setIsLoading(true);
    setTimeout(() => {
      login(demoUsername, role);
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#FAF7F2] text-[#2D241E] select-none">
      {/* Sisi Kiri: Hero Visual Cafe Sesuai Figma */}
      <div className="md:w-1/2 lg:w-5/12 bg-[#231712] text-[#EFE8E1] p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden shadow-2xl shrink-0">
        {/* Background Ambient Glow & Coffee Deco Pattern */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#5A3825]/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#7A4D33]/20 blur-3xl pointer-events-none" />

        {/* Top Branding */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#5A3825] border border-[#7A4D33] flex items-center justify-center text-[#E5B589] shadow-lg">
              <Coffee className="w-6 h-6" />
            </div>
            <div>
              <div className="font-serif font-bold text-2xl text-white tracking-wide flex items-center gap-2">
                CafeStock
                <span className="text-[11px] font-sans font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#45281A] text-[#D8A57A] border border-[#683C25]">
                  v1.0
                </span>
              </div>
              <div className="text-xs text-[#A69080]">
                Inventory & Procurement System
              </div>
            </div>
          </div>
        </div>

        {/* Middle Hero Slogan & Subtext dari Figma */}
        <div className="relative z-10 my-10 md:my-0 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3B261C] border border-[#5A3825] text-[#E5B589] text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dari Permintaan hingga Stok Terupdate</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
            Stok tertata,
            <br />
            <span className="text-[#D8A57A]">Racikan tetap terjaga.</span>
          </h1>

          <p className="text-sm sm:text-base text-[#D0C2B6] leading-relaxed max-w-md">
            Satu sistem terpusat yang mencatat seluruh siklus pengadaan bahan
            baku cafe—mulai dari Purchase Request, Approval manajerial, Purchase
            Order, hingga Goods Receipt dengan saldo stok yang akurat dan
            konsisten.
          </p>

          {/* Feature Highlights */}
          <div className="pt-2 space-y-2.5 text-xs text-[#E0D4C8]">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#D8A57A] shrink-0" />
              <span>
                Kontrak Payload Agregat tunggal untuk form transaksi cepat
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#D8A57A] shrink-0" />
              <span>Pemisahan Saldo Stok dan Riwayat Mutasi (Audit Trail)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#D8A57A] shrink-0" />
              <span>Otorisasi role ketat di backend (USER & APPROVER)</span>
            </div>
          </div>
        </div>

        {/* Bottom Hero Info */}
        <div className="relative z-10 text-[11px] text-[#8C7665] border-t border-[#38261E] pt-4">
          Kelompok 2 • Inventory Procurement System © 2026
        </div>
      </div>

      {/* Sisi Kanan: Form Login Sesuai Figma */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          {/* Header Form */}
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#231712]">
              Selamat datang kembali.
            </h2>
            <p className="text-xs sm:text-sm text-[#7D6B5D] mt-1.5">
              Masuk ke akun Anda untuk mengelola pengadaan dan stok gudang.
            </p>
          </div>

          {/* Form Login */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Input Username */}
            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="block text-xs font-bold uppercase tracking-wider text-[#5A4537]"
              >
                Username atau Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A39282]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#DDD2C4] rounded-xl text-sm text-[#231712] placeholder-[#B5A597] focus:outline-none focus:border-[#7A4D33] focus:ring-2 focus:ring-[#7A4D33]/15 transition shadow-xs"
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-wider text-[#5A4537]"
                >
                  Kata Sandi
                </label>
                <a
                  href="#help"
                  onClick={(e) => e.preventDefault()}
                  className="text-xs text-[#8C5D3B] hover:text-[#5A3825] font-semibold hover:underline"
                >
                  Lupa kata sandi?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A39282]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-2.5 bg-white border border-[#DDD2C4] rounded-xl text-sm text-[#231712] placeholder-[#B5A597] focus:outline-none focus:border-[#7A4D33] focus:ring-2 focus:ring-[#7A4D33]/15 transition shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#A39282] hover:text-[#5A3825] transition"
                  aria-label="Tampilkan kata sandi"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#5A3825] border-[#DDD2C4] focus:ring-[#7A4D33] accent-[#5A3825]"
                />
                <span className="text-xs text-[#6B5A4D]">
                  Ingat perangkat ini
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#5A3825] hover:bg-[#45281A] active:bg-[#341F14] text-white rounded-xl text-sm font-bold tracking-wide transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <span>Memproses Masuk...</span>
              ) : (
                <>
                  <span>Masuk ke Akun</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts Sesuai PRD Bagian 2 */}
          <div className="pt-4 border-t border-[#EDE4D8] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A7566] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#5A3825]" />
                Pilih Akun Demo Seeder (1-Klik Langsung Masuk)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Demo Account 1: Staff USER */}
              <button
                type="button"
                onClick={() => handleQuickDemo("USER", "user_procurement")}
                className="p-3 text-left rounded-xl border border-[#E0D5C7] bg-white hover:border-[#7A4D33] hover:bg-[#FAF4ED] transition shadow-xs group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2E1F16] group-hover:text-[#5A3825]">
                    Staff Gudang
                  </span>
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#2D3748] text-[#90CDF4]">
                    USER
                  </span>
                </div>
                <div className="text-[11px] text-[#8C7665] mt-1 font-mono">
                  user_procurement
                </div>
                <div className="text-[10px] text-[#A8988B] mt-0.5 leading-tight">
                  Buat PR, Buat PO, Catat GR
                </div>
              </button>

              {/* Demo Account 2: Manager APPROVER */}
              <button
                type="button"
                onClick={() => handleQuickDemo("APPROVER", "approver_manager")}
                className="p-3 text-left rounded-xl border border-[#E0D5C7] bg-white hover:border-[#7A4D33] hover:bg-[#FAF4ED] transition shadow-xs group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2E1F16] group-hover:text-[#5A3825]">
                    Manager Reviewer
                  </span>
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#4A321E] text-[#F3C592]">
                    APPROVER
                  </span>
                </div>
                <div className="text-[11px] text-[#8C7665] mt-1 font-mono">
                  approver_manager
                </div>
                <div className="text-[10px] text-[#A8988B] mt-0.5 leading-tight">
                  Review & Approve/Reject PR
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
