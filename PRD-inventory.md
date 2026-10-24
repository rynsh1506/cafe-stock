# Product Requirements Document

## **Inventory Procurement System**

> _Dari Purchase Request hingga Stok Gudang Terupdate_

| **Item**    | **Detail**                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------- |
| Versi       | 1.0 (Draft)                                                                                 |
| Tanggal     | 3 Oktober 2026                                                                              |
| Status      | Draft untuk review                                                                          |
| Cakupan     | Aplikasi end-to-end: backend, API contract, integrasi frontend, data, testing, dan delivery |
| Stack acuan | TypeScript + Hono/Elysia, PostgreSQL, Drizzle ORM / Raw SQL                                 |

### KELOMPOK 2

1. Muhammad Riyansyah (1925190)
2. Riko Toni (19251787)
3. Andika Pratama Nugroho (19251695)
4. Darmawan 19252324
5. Reza adjriel ( 19250907 )

## 1. Ringkasan Produk

### 1.1 Latar Belakang

Saat ini permintaan pembelian barang antar Warehouse dan Purchasing dilakukan lewat spreadsheet dan komunikasi manual. Akibatnya status permintaan sulit dilacak, persetujuan tidak terdokumentasi, penerimaan barang parsial sering salah catat, dan stok per gudang tidak akurat.

### 1.2 Visi Produk

Satu sistem terpusat yang mencatat seluruh siklus procurement secara konsisten, dapat diaudit, dan mudah diintegrasikan ke aplikasi frontend.

```text
Purchase Request -> Approval -> Purchase Order -> Goods Receipt -> Inventory Updated
```

### 1.3 Tujuan

- Menggantikan spreadsheet dengan alur procurement yang tercatat dan tervalidasi.
- Menjamin konsistensi data: Goods Receipt, PO, stok, dan movement tidak boleh berada dalam kondisi setengah terupdate.
- Menyediakan stok akurat per Product per Warehouse beserta riwayat pergerakannya.
- Menyederhanakan integrasi FE: create/update memakai satu payload JSON agregat (header + items).
- Menegakkan role dan otorisasi di backend (USER dan APPROVER).

### 1.4 Non-Goals

- Registrasi, lupa password, verifikasi email, OAuth.
- Pembayaran, notifikasi email, upload file, reporting kompleks.
- Microservices, message queue, Kubernetes.
- Pengeluaran stok (issue/transfer/adjustment) — hanya PURCHASE_RECEIPT pada versi ini.

### 1.5 Metrik Keberhasilan

| **Metrik**                                  | **Target**                    |
| ------------------------------------------- | ----------------------------- |
| Akurasi stok setelah Goods Receipt          | 100% (saldo = total movement) |
| Data parsial akibat kegagalan proses        | 0 kasus (atomic transaction)  |
| Business rule inti ter-cover automated test | Seluruh skenario di bagian 11 |
| Waktu demo alur utama end-to-end            | < 10 menit tanpa setup manual |

## 2. Pengguna dan Peran

| **Role** | **Deskripsi**                          | **Kemampuan**                                                                                             |
| -------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| USER     | Staff yang membuat kebutuhan pembelian | Login; buat, ubah (saat DRAFT), submit PR; lihat PR dan PO; buat PO; catat Goods Receipt; lihat inventory |
| APPROVER | Pemegang authority persetujuan         | Login; lihat PR; approve atau reject PR; lihat inventory                                                  |

Akun dibuat lewat seeder (minimal 1 USER dan 1 APPROVER). Otorisasi divalidasi di backend pada setiap endpoint; frontend hanya menyembunyikan tombol sebagai kenyamanan, bukan sebagai proteksi.

## 3. Alur Bisnis Utama

1. USER login lalu membuat Purchase Request untuk 1 Warehouse dengan satu atau lebih Product (status DRAFT).
2. USER mengubah draft sesuai kebutuhan, lalu submit (SUBMITTED).
3. APPROVER meninjau dan approve (APPROVED) atau reject (REJECTED).
4. USER membuat Purchase Order dari PR yang APPROVED dengan memilih Supplier (PO berstatus DRAFT).
5. USER menandai PO sebagai ORDERED.
6. Barang datang (bisa bertahap): USER mencatat Goods Receipt terhadap PO.
7. Sistem otomatis menambah stok warehouse, mencatat Inventory Movement, memperbarui received quantity dan status PO (PARTIALLY_RECEIVED atau RECEIVED).

### 3.1 State Machine

| **Entitas**      | **Transisi yang valid**                                                        |
| ---------------- | ------------------------------------------------------------------------------ |
| Purchase Request | DRAFT -> SUBMITTED -> APPROVED \| REJECTED                                     |
| Purchase Order   | DRAFT -> ORDERED -> PARTIALLY_RECEIVED -> RECEIVED; DRAFT/ORDERED -> CANCELLED |

Transisi di luar tabel di atas harus ditolak dengan error bisnis yang jelas.

## 4. Kebutuhan Fungsional

### 4.1 Autentikasi

- Login dengan username dan password; mengembalikan token (JWT/Bearer).
- Endpoint 'me' untuk mengambil data user terautentikasi beserta role.
- Password disimpan sebagai hash, tidak pernah dikembalikan di response.

### 4.2 Master Data (Product, Supplier, Warehouse)

| **Master** | **Field utama**                 | **Aturan**                                                           |
| ---------- | ------------------------------- | -------------------------------------------------------------------- |
| Product    | sku, name, unit, is_active      | SKU unik. Product non-aktif tidak bisa dipakai di transaksi baru.    |
| Supplier   | name, email, phone, is_active   | Supplier non-aktif tidak bisa dipakai di PO baru.                    |
| Warehouse  | code, name, location, is_active | Code unik. Warehouse non-aktif tidak bisa dipakai di transaksi baru. |

Kemampuan: Create, List, Detail, Update. Tidak ada hard delete; penonaktifan lewat is_active.

### 4.3 Purchase Request

- Satu PR untuk tepat 1 Warehouse dan berisi 1..N item.
- Nomor otomatis, contoh PR-2026-000001 (unik).
- Saat DRAFT: boleh ubah warehouse, tambah/ubah/hapus item.
- Submit ditolak jika tidak punya item.
- Setelah SUBMITTED: tidak bisa diedit oleh USER.
- Approve/Reject hanya oleh APPROVER dan hanya dari status SUBMITTED.
- Quantity setiap item > 0; Product tidak boleh duplikat dalam satu PR; Product dan Warehouse harus aktif.
- Edit draft hanya oleh pembuat PR (assumption, lihat bagian 12).

### 4.4 Purchase Order

- Hanya dapat dibuat dari PR berstatus APPROVED.
- Satu PR hanya boleh menghasilkan 1 PO (unique constraint pada purchase_request_id).
- Item PO disalin dari item PR (product dan quantity); supplier ditentukan saat pembuatan PO; supplier harus aktif.
- Warehouse PO mengikuti warehouse PR.
- Nomor otomatis, contoh PO-2026-000001.
- Aksi 'Mark as Ordered': DRAFT menjadi ORDERED.
- PO CANCELLED atau RECEIVED tidak dapat menerima barang.

### 4.5 Goods Receipt

- Wajib mereferensikan Purchase Order; boleh berisi beberapa Product dalam satu receipt.
- Product harus ada di PO; quantity > 0.
- Total diterima per product tidak boleh melebihi ordered quantity (contoh: ordered 100, sudah 80, receipt baru 30 -> ditolak).
- PO hanya bisa menerima barang jika berstatus ORDERED atau PARTIALLY_RECEIVED.
- Nomor otomatis, contoh GR-2026-000001.
- Status PO dihitung otomatis: belum ada penerimaan = ORDERED; sebagian = PARTIALLY_RECEIVED; semua product penuh = RECEIVED.

### 4.6 Inventory

- Saldo stok per Product per Warehouse (tabel inventory_balances).
- Riwayat setiap perubahan stok di inventory_movements (append-only, tidak pernah diedit atau dihapus).
- Tampilan: stok per Warehouse, stok per Product (lintas warehouse), dan daftar movement dengan filter.
- Movement type saat ini: PURCHASE_RECEIPT dengan reference ke nomor GR.

### 4.7 Audit Trail dan Idempotency

- Audit log mencatat aksi penting (create, submit, approve, reject, create PO, ordered, receive) beserta pelaku dan waktu.
- Idempotency key pada endpoint create Goods Receipt agar retry dari FE (klik ganda, jaringan putus) tidak menambah stok dua kali.

## 5. Kontrak Integrasi Frontend (Payload Agregat)

Keputusan utama: operasi create dan update dokumen transaksi memakai satu JSON besar yang memuat header sekaligus items. FE tidak perlu memanggil banyak endpoint kecil (add item, edit item, delete item) dan tidak perlu mengelola urutan pemanggilan.

### 5.1 Prinsip

- Create dan Update PR: satu request berisi header + array items.
- Update draft bersifat full replace: items yang dikirim menjadi kondisi akhir (item yang tidak dikirim dihapus, item baru ditambah, quantity berubah ikut). Dilakukan dalam satu transaksi database.
- Response selalu mengembalikan dokumen utuh (header + items + nama/kode master terkait) sehingga FE langsung bisa render tanpa fetch tambahan.
- Aksi perubahan status (submit, approve, reject, ordered) adalah endpoint aksi terpisah tanpa body besar.

### 5.2 Contoh Payload

**Create / Update Purchase Request:**

`POST /purchase-requests      |  PUT /purchase-requests/:id`

```json
{
  "warehouseId": "wh_jkt",
  "items": [
    { "productId": "prd_oil", "quantity": 100 },
    { "productId": "prd_gloves", "quantity": 50 }
  ]
}
```

**Create Purchase Order:**

`POST /purchase-orders`

```json
{ "purchaseRequestId": "pr_001", "supplierId": "sup_001" }
```

**Create Goods Receipt (header Idempotency-Key):**

`POST /goods-receipts`

```json
{
  "purchaseOrderId": "po_001",
  "items": [{ "productId": "prd_oil", "quantity": 60 }]
}
```

### 5.3 Daftar Kemampuan Endpoint (acuan, nama final bebas)

| **Modul**                      | **Endpoint**                                                                                         | **Akses**              |
| ------------------------------ | ---------------------------------------------------------------------------------------------------- | ---------------------- |
| Auth                           | POST /auth/login; GET /auth/me                                                                       | Publik; terautentikasi |
| Product / Supplier / Warehouse | POST, GET (list), GET /:id, PUT /:id                                                                 | Terautentikasi         |
| Inventory                      | GET /inventory/balances?warehouseId= ; GET /inventory/balances?productId= ; GET /inventory/movements | Terautentikasi         |
| Purchase Request               | POST; GET; GET /:id; PUT /:id; POST /:id/submit                                                      | USER                   |
| Approval                       | POST /purchase-requests/:id/approve ; /reject                                                        | APPROVER               |
| Purchase Order                 | POST; GET; GET /:id; POST /:id/mark-ordered                                                          | USER                   |
| Goods Receipt                  | POST; GET /:id                                                                                       | USER                   |

### 5.4 Kontrak Error

Semua error memakai format konsisten dengan code yang stabil (dipakai FE untuk logika) dan message yang manusiawi.

```json
{
  "error": {
    "code": "RECEIVED_QUANTITY_EXCEEDS_ORDERED",
    "message": "Total received quantity cannot exceed ordered quantity.",
    "details": [
      { "field": "items[0].quantity", "issue": "max remaining is 20" }
    ]
  }
}
```

| **Kategori**                      | **HTTP** | **Contoh code**                                                                      |
| --------------------------------- | -------- | ------------------------------------------------------------------------------------ |
| Validasi input                    | 400/422  | VALIDATION_ERROR                                                                     |
| Belum login / token salah         | 401      | UNAUTHENTICATED                                                                      |
| Role tidak berhak                 | 403      | FORBIDDEN_ROLE                                                                       |
| Data tidak ditemukan              | 404      | PURCHASE_REQUEST_NOT_FOUND                                                           |
| Pelanggaran state / aturan bisnis | 409/422  | PURCHASE_REQUEST_NOT_APPROVED, PURCHASE_ORDER_ALREADY_EXISTS, PURCHASE_REQUEST_EMPTY |

### 5.5 Pagination dan Filter

Endpoint list mendukung page, limit, dan filter dasar (status, warehouse, product, rentang tanggal). Format response list: data, meta (page, limit, total).

## 6. Desain Data

Skema mengikuti ERD terlampir. Ringkasan relasi penting:

| **Relasi**                           | **Penjelasan**                                                                           |
| ------------------------------------ | ---------------------------------------------------------------------------------------- |
| purchase_requests -> items           | 1:N; unique (purchase_request_id, product_id) mencegah product ganda                     |
| purchase_orders -> purchase_requests | 1:1; unique pada purchase_request_id menjamin satu PR hanya satu PO                      |
| goods_receipts -> purchase_orders    | N:1; satu PO boleh banyak receipt (partial)                                              |
| inventory_balances                   | unique (warehouse_id, product_id); nilai stok saat ini, tidak negatif (CHECK stock >= 0) |
| inventory_movements                  | append-only; sumber kebenaran riwayat; reference_type + reference_id menunjuk GR         |
| audit_logs                           | jejak aksi: entity, action, pelaku, waktu                                                |
| idempotency_keys                     | unique (user_id, method, request_path, idempotency_key); menyimpan response untuk replay |

### 6.1 Constraint dan Index

- CHECK quantity > 0 pada seluruh tabel item.
- Foreign key di semua relasi; unique pada sku, warehouse code, request_number, po_number, gr_number.
- Index pada status PR/PO, warehouse_id, product_id, dan created_at untuk list dan movement.
- Seluruh schema dibangun dari migration; seeder menyediakan user, master data awal, dan stok awal.

### 6.2 Catatan Perbaikan ERD (perlu diputuskan sebelum implementasi)

- Tipe kolom tidak konsisten: received_by, goods_receipt_id, entity_id, performed_by bertipe integer padahal PK-nya varchar. Samakan semua id (disarankan UUID atau ULID).
- purchase_order_items hanya punya quantity. Tambahkan received_quantity (atau hitung dari SUM goods_receipt_items). Rekomendasi: kolom received_quantity + CHECK received_quantity <= quantity agar validasi dan query status murah.
- inventory_movements belum punya movement_type; tambahkan (nilai: PURCHASE_RECEIPT). Quantity bertanda (+/-) untuk mendukung jenis movement lain di masa depan.
- purchase_orders tidak menyimpan warehouse_id; diturunkan dari PR. Jika ingin query cepat tanpa join, tambahkan warehouse_id.
- users.role dan password: simpan hash (bcrypt/argon2).
- purchase_request_items dan goods_receipt_items sebaiknya memiliki created_at/updated_at agar konsisten.

## 7. Konsistensi Data pada Goods Receipt

Goods Receipt menyentuh beberapa tabel sekaligus. Seluruh langkah dijalankan dalam satu database transaction; jika satu langkah gagal, semuanya rollback.

```sql
BEGIN
  1. Lock PO (SELECT ... FOR UPDATE) dan validasi status
  2. Validasi tiap item: ada di PO, qty > 0, total tidak melebihi ordered
  3. Insert goods_receipts + goods_receipt_items
  4. Update purchase_order_items.received_quantity
  5. Hitung ulang status PO (ORDERED / PARTIALLY_RECEIVED / RECEIVED)
  6. Upsert inventory_balances (stock = stock + qty)
  7. Insert inventory_movements (PURCHASE_RECEIPT, +qty, ref GR)
  8. Insert audit_logs
COMMIT
```

- Row lock pada PO mencegah dua receipt bersamaan melebihi ordered quantity (race condition).
- Idempotency-Key mencegah duplikasi akibat retry.
- Invariant yang selalu benar: saldo stok = jumlah seluruh movement; received_quantity = jumlah seluruh receipt item.

## 8. Kebutuhan Non-Fungsional

| **Aspek**       | **Kebutuhan**                                                                                                                    |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Keamanan        | Hash password, token berkedaluwarsa, otorisasi role di backend, validasi input di semua endpoint, tidak ada secret di repository |
| Keandalan       | Operasi multi-tabel atomic; migration reproducible                                                                               |
| Performa        | List ber-pagination, index sesuai pola query; respons endpoint umum < 300 ms pada data uji                                       |
| Maintainability | Pemisahan layer (route, service/business logic, repository); business rule di service, bukan di route                            |
| Observability   | Log terstruktur dengan request id; error tidak membocorkan stack trace ke client                                                 |
| Portabilitas    | Docker Compose untuk app + PostgreSQL; satu perintah untuk migrate dan seed                                                      |

## 9. Arsitektur dan Struktur Proyek

```text
src/
  modules/
    auth/  products/  suppliers/  warehouses/
    inventory/  purchase-requests/  purchase-orders/  goods-receipts/
  db/            schema, migrations, seed
  middleware/    auth, role guard, idempotency, error handler
  lib/           number generator, response helper, errors
tests/           unit + integration (business rules)
docs/            OpenAPI, Postman/Bruno collection
README.md
```

Setiap modul berisi route (HTTP + validasi skema), service (business rule dan transaksi), dan repository (query). Penomoran dokumen (PR/PO/GR) memakai sequence per tahun di database agar bebas race condition.

## 10. Aplikasi Frontend (Konsumen API)

Meskipun cakupan tes awal hanya backend, produk ini ditujukan untuk dipakai staf. Kebutuhan layar berikut menjadi acuan agar kontrak API sesuai kebutuhan UI.

| **Layar**           | **Isi dan perilaku**                                                                                           |
| ------------------- | -------------------------------------------------------------------------------------------------------------- |
| Login               | Form username/password; simpan token; redirect sesuai role                                                     |
| Daftar PR           | Tabel dengan filter status/warehouse; badge status; aksi sesuai role                                           |
| Form PR             | Pilih warehouse, tabel item dinamis (tambah/hapus/ubah qty), simpan sebagai satu payload; submit               |
| Detail PR           | Header + item + riwayat; tombol Approve/Reject untuk APPROVER saat SUBMITTED; tombol Buat PO untuk PR APPROVED |
| Form PO             | Pilih supplier; item hanya-baca dari PR; tombol Mark as Ordered                                                |
| Detail PO + Receive | Ordered / Received / Remaining per item; form Goods Receipt dengan batas maksimal = remaining                  |
| Inventory           | Stok per warehouse atau per product; tab Movement dengan filter                                                |

## 11. Strategi Pengujian

Fokus pada test bisnis yang bermakna, bukan test trivial. Test integrasi memakai database PostgreSQL nyata (bukan mock) untuk memverifikasi constraint dan transaksi.

| **No** | **Skenario**                                                              | **Jenis**      |
| ------ | ------------------------------------------------------------------------- | -------------- |
| 1      | Tidak bisa submit PR tanpa item                                           | Integrasi      |
| 2      | Tidak bisa approve/reject PR yang bukan SUBMITTED                         | Integrasi      |
| 3      | USER tidak boleh approve (403)                                            | Integrasi      |
| 4      | PR tidak bisa diedit setelah SUBMITTED                                    | Integrasi      |
| 5      | Tidak bisa buat PO dari PR non-APPROVED                                   | Integrasi      |
| 6      | Tidak bisa buat lebih dari satu PO dari PR yang sama                      | Integrasi      |
| 7      | Tidak bisa receive melebihi ordered quantity (termasuk akumulasi receipt) | Integrasi      |
| 8      | Goods Receipt menambah stok warehouse dan membuat movement                | Integrasi      |
| 9      | PO menjadi PARTIALLY_RECEIVED lalu RECEIVED saat penuh                    | Integrasi      |
| 10     | Receive pada PO CANCELLED/RECEIVED ditolak                                | Integrasi      |
| 11     | Kegagalan di tengah receipt -> rollback, tidak ada data parsial           | Integrasi      |
| 12     | Idempotency-Key sama tidak menambah stok dua kali                         | Integrasi      |
| 13     | Product duplikat dalam PR ditolak; qty <= 0 ditolak                       | Unit/Integrasi |
| 14     | Product/Warehouse/Supplier non-aktif ditolak di transaksi baru            | Integrasi      |

## 12. Asumsi

- PR hanya dapat diedit dan disubmit oleh USER pembuatnya.
- Reject bersifat final; PR yang ditolak tidak bisa diajukan ulang (user membuat PR baru).
- Pembatalan PO (CANCELLED) diperbolehkan dari DRAFT atau ORDERED selama belum ada penerimaan; PO yang sudah PARTIALLY_RECEIVED tidak bisa dibatalkan.
- Goods Receipt yang sudah dibuat tidak dapat diedit atau dihapus (koreksi lewat mekanisme terpisah di versi berikutnya).
- Unit pada item mengikuti unit di master Product.
- USER boleh membuat PO dan menerima barang sesuai daftar kemampuan USER; APPROVER tidak mencatat Goods Receipt.
- Satu Warehouse per PR; PO mewarisi warehouse tersebut.
- Zona waktu disimpan UTC; ditampilkan sesuai zona waktu klien.

## 13. Risiko dan Mitigasi

| **Risiko**                                                        | **Mitigasi**                                                                                                       |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Race condition saat dua receipt bersamaan                         | Row lock pada PO + CHECK constraint di database                                                                    |
| Stok tidak sinkron dengan riwayat                                 | Balance hanya diubah dalam transaksi yang sama dengan insert movement; test invariant                              |
| Payload agregat besar membuat update tidak sengaja menghapus item | Semantik full replace didokumentasikan jelas; FE selalu mengirim state lengkap dari form; hanya berlaku saat DRAFT |
| Retry FE menggandakan receipt                                     | Idempotency-Key wajib pada Goods Receipt                                                                           |
| Inkonsistensi tipe id di ERD                                      | Diputuskan sebelum migration pertama (bagian 6.2)                                                                  |

## 14. Rencana Pengerjaan

| **Fase**                        | **Cakupan**                                                               | **Output**                      |
| ------------------------------- | ------------------------------------------------------------------------- | ------------------------------- |
| 1. Fondasi                      | Setup proyek, migration, seeder, auth, middleware error/role              | Login berjalan, DB reproducible |
| 2. Master data + Inventory read | Product, Supplier, Warehouse, view stok dan movement                      | CRUD master + inventory view    |
| 3. Purchase Request             | Create/update agregat, submit, approve, reject                            | Alur PR lengkap + test          |
| 4. Purchase Order               | Create dari PR, mark ordered, list/detail                                 | Alur PO + test                  |
| 5. Goods Receipt                | Transaksi atomic, partial receipt, status PO, stok, movement, idempotency | Alur receipt + test konsistensi |
| 6. Dokumentasi dan Delivery     | README, OpenAPI/Bruno, Docker Compose, skrip demo                         | Siap demo end-to-end            |

## 15. Kriteria Penerimaan dan Skenario Demo

- Seluruh endpoint wajib tersedia dan terdokumentasi (OpenAPI/Swagger atau Bruno/Postman).
- Project dapat dijalankan dari nol hanya dengan mengikuti README (install, env, migrate, seed, run, test).
- Seluruh skenario test pada bagian 11 lulus.
- Demo alur utama berjalan: login -> buat PR (payload tunggal) -> submit -> approve -> buat PO -> mark ordered -> receive parsial -> cek stok -> receive sisa -> cek status PO RECEIVED -> cek movement.

### 15.1 Isi README yang Wajib

Project Overview, Tech Stack, Project Structure, Database Design, Setup, Environment Variables, Migration, Seed, Run Application, Testing, API Documentation, minimal 3 Engineering Decisions, dan Assumptions.

### 15.2 Engineering Decisions yang Direncanakan

1. Payload agregat (header + items) untuk create/update agar integrasi FE sederhana dan atomic.
2. Inventory balance dipisah dari inventory movement: balance untuk baca cepat, movement sebagai riwayat append-only yang dapat diaudit.
3. Goods Receipt dalam satu transaksi dengan row lock dan idempotency key untuk mencegah data parsial dan duplikasi.

## 16. Pertanyaan Terbuka

- Apakah PR yang REJECTED boleh direvisi dan diajukan ulang, atau wajib dibuat baru?
- Apakah APPROVER boleh sekaligus membuat PR (separation of duties)?
- Apakah perlu field catatan/alasan pada reject dan pada Goods Receipt (nomor surat jalan)?
- Format final id: UUID atau ULID?
- Apakah diperlukan fitur cancel PO pada versi pertama?
