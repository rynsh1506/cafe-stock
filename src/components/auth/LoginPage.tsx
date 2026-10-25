import React, { useState } from "react";
import {
  Coffee,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowRight,
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
    }, 350);
  };

  const handleQuickDemo = (role: UserRole, demoUsername: string): void => {
    setSelectedRole(role);
    setUsername(demoUsername);
    setPassword("password123");
    setIsLoading(true);
    setTimeout(() => {
      login(demoUsername, role);
      setIsLoading(false);
    }, 250);
  };

  const workflowStages = [
    {
      code: "01 / PR",
      title: "Purchase Request",
      desc: "Permintaan bahan baku dari gudang/barista",
    },
    {
      code: "02 / REV",
      title: "Otorisasi Approver",
      desc: "Verifikasi kebutuhan & persetujuan manajer",
    },
    {
      code: "03 / PO",
      title: "Purchase Order",
      desc: "Penerbitan surat pesanan resmi ke pemasok",
    },
    {
      code: "04 / GR",
      title: "Goods Receipt",
      desc: "Timbang terima fisik & mutasi stok gudang",
    },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F6F3EC] text-[#1A1411] select-none">
      {/* Sisi Kiri: Editorial Roastery Supply Manifest */}
      <div className="lg:w-[46%] bg-[#191310] text-[#EBE4DA] p-7 sm:p-12 lg:p-14 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#332720] shrink-0">
        {/* Top Ledger Stamp */}
        <div>
          <div className="flex items-center justify-between border-b border-[#332720] pb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#2A1E18] border border-[#523A2C] flex items-center justify-center text-[#D49B6A]">
                <Coffee className="w-4 h-4" />
              </div>
              <div>
                <div className="font-serif font-semibold text-xl text-[#F7F3EC] tracking-tight flex items-center gap-2">
                  CafeStock
                  <span className="font-mono text-[10px] font-medium uppercase px-1.5 py-0.5 bg-[#2A1E18] text-[#C89666] border border-[#473225]">
                    LEDGER v1.0
                  </span>
                </div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-[#8C7A6B]">
                  Roastery &amp; Bar Supply Chain
                </div>
              </div>
            </div>
            <div className="hidden sm:block text-right font-mono text-[10px] text-[#7D6C5E] leading-relaxed">
              <div>DOC // ARCHIVE-IDN</div>
              <div>2 GUDANG AKTIF</div>
            </div>
          </div>

          {/* Editorial Headline */}
          <div className="mt-10 lg:mt-14 space-y-5">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#C89666] flex items-center gap-2">
              <span className="inline-block w-5 h-[1px] bg-[#C89666]" />
              <span>Buku Induk Pengadaan &amp; Mutasi Gudang</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-normal text-[#F7F3EC] leading-[1.12] tracking-tight">
              Stok tertata,
              <br />
              <span className="italic text-[#D8A575]">
                racikan tetap terjaga.
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-[#B2A294] leading-relaxed max-w-md font-normal">
              Catatan operasional pengadaan biji kopi, susu segar, dan bahan
              pendukung bar. Setiap karung yang masuk tercatat dari pengajuan
              awal hingga bukti timbang terima di gudang.
            </p>
          </div>
        </div>

        {/* Architectural Ledger Grid: 4-Stage Procurement Flow */}
        <div className="my-8 lg:my-0">
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#8C7A6B] mb-2.5">
            Rantai Dokumen Transaksi (PRD Standard)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-l border-[#332720]">
            {workflowStages.map((stage) => (
              <div
                key={stage.code}
                className="p-3.5 border-r border-b border-[#332720] bg-[#1E1713]/60"
              >
                <div className="font-mono text-[10px] text-[#C89666] font-semibold">
                  {stage.code}
                </div>
                <div className="text-xs font-semibold text-[#F2ECE4] mt-1">
                  {stage.title}
                </div>
                <div className="text-[11px] text-[#8F7E70] mt-0.5 leading-snug">
                  {stage.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Colophon */}
        <div className="flex items-center justify-between text-[11px] font-mono text-[#786759] border-t border-[#332720] pt-4">
          <span>KELOMPOK 2 // PROCUREMENT LEDGER</span>
          <span>JAKARTA &amp; BANDUNG ROASTERY</span>
        </div>
      </div>

      {/* Sisi Kanan: Formulir Masuk & Kartu Akses Shift */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-16 bg-[#F6F3EC]">
        <div className="w-full max-w-md">
          {/* Top Document Tag */}
          <div className="flex items-center justify-between border-b border-[#D8CFC0] pb-3 mb-7">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#7A6A5B]">
              FORMULIR OTENTIKASI PETUGAS
            </span>
            <span className="font-mono text-[10px] font-semibold text-[#5A3825]">
              SEC-01
            </span>
          </div>

          <div className="mb-7">
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#1A1411] tracking-tight">
              Masuk ke Buku Kerja
            </h2>
            <p className="text-xs sm:text-sm text-[#6E5E50] mt-1">
              Gunakan kredensial petugas gudang atau manajer pemeriksa untuk
              mengakses dokumen pengadaan.
            </p>
          </div>

          {/* Form Login */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input Username */}
            <div>
              <label
                htmlFor="username"
                className="block font-mono text-[10px] font-semibold uppercase tracking-widest text-[#4F4035] mb-1.5"
              >
                ID Petugas / Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C7B6B]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="user_procurement"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FDFBF7] border border-[#CFC5B5] text-sm font-mono text-[#1A1411] placeholder-[#A89A8C] focus:outline-none focus:border-[#261B16] transition"
                />
              </div>
            </div>

            {/* Input Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block font-mono text-[10px] font-semibold uppercase tracking-widest text-[#4F4035]"
                >
                  Kata Sandi
                </label>
                <span className="font-mono text-[10px] text-[#8C7B6B]">
                  Default: password123
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C7B6B]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-2.5 bg-[#FDFBF7] border border-[#CFC5B5] text-sm font-mono text-[#1A1411] placeholder-[#A89A8C] focus:outline-none focus:border-[#261B16] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8C7B6B] hover:text-[#1A1411] transition cursor-pointer"
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
                  className="w-3.5 h-3.5 accent-[#261B16] border-[#CFC5B5]"
                />
                <span className="text-xs text-[#5E4F42]">
                  Simpan sesi shift pada perangkat ini
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#1F1612] hover:bg-[#33241D] active:bg-[#140E0B] text-[#F7F3EC] text-xs font-mono uppercase tracking-widest font-semibold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <span>MEMBUKA BUKU KERJA...</span>
              ) : (
                <>
                  <span>BUKA SESI KERJA</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Kartu Akses Cepat (Seeder Pass) */}
          <div className="mt-8 pt-6 border-t border-[#D8CFC0]">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[#6E5E50]">
                Kartu Akses Seeder (Klik untuk Masuk Cepat)
              </span>
              <span className="font-mono text-[10px] text-[#8C7B6B]">
                PRD SEC.2
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Pass 1: Staff USER */}
              <button
                type="button"
                onClick={() => handleQuickDemo("USER", "user_procurement")}
                className="p-3.5 text-left bg-[#FDFBF7] border border-[#CFC5B5] hover:border-[#1F1612] transition group cursor-pointer relative"
              >
                <div className="flex items-center justify-between border-b border-[#EAE3D5] pb-2 mb-2">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-[#E6EEF4] text-[#1E4A6D] border border-[#BDD2E4]">
                    ROLE: USER
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#9C8B7A] group-hover:text-[#1A1411] transition" />
                </div>
                <div className="text-xs font-bold text-[#1A1411]">
                  Budi Santoso
                </div>
                <div className="font-mono text-[11px] text-[#6E5E50] mt-0.5">
                  user_procurement
                </div>
                <div className="text-[11px] text-[#8C7B6B] mt-2 leading-snug">
                  Operasional Gudang: Buat PR, terbitkan PO, &amp; catat GR.
                </div>
              </button>

              {/* Pass 2: Manager APPROVER */}
              <button
                type="button"
                onClick={() => handleQuickDemo("APPROVER", "approver_manager")}
                className="p-3.5 text-left bg-[#FDFBF7] border border-[#CFC5B5] hover:border-[#1F1612] transition group cursor-pointer relative"
              >
                <div className="flex items-center justify-between border-b border-[#EAE3D5] pb-2 mb-2">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-[#F6E8D8] text-[#7C4218] border border-[#E2C4A3]">
                    ROLE: APPROVER
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#9C8B7A] group-hover:text-[#1A1411] transition" />
                </div>
                <div className="text-xs font-bold text-[#1A1411]">
                  Siti Aminah
                </div>
                <div className="font-mono text-[11px] text-[#6E5E50] mt-0.5">
                  approver_manager
                </div>
                <div className="text-[11px] text-[#8C7B6B] mt-2 leading-snug">
                  Manajer Roastery: Verifikasi &amp; Approve/Reject dokumen PR.
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
