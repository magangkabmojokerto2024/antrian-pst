# Antrian PST (Next.js + Supabase)

Proyek ini adalah sistem antrian digital untuk Pelayanan Statistik Terpadu (PST) yang telah di-_rewrite_ menggunakan **Next.js 14** dan **Supabase**.

Awalnya proyek ini dibangun dengan Laravel (PHP), lalu dimigrasikan ke Next.js untuk mendukung deployment yang mulus di platform Serverless seperti Vercel.

## Fitur

- 🎟️ **Ambil Antrian (Publik):** Pengunjung dapat mengisi nama, instansi, dan memilih layanan.
- 📺 **Monitor Realtime (Publik):** Layar display antrian yang *auto-update* tanpa perlu di-_refresh_, menggunakan Supabase Realtime.
- 🔒 **Admin Panel (Secure):** Manajemen antrian (Panggil, Selesai, Skip, Recall) dan riwayat antrian, dilindungi dengan Supabase Auth.
- 📊 **Riwayat (Admin):** Merekam data dan statistik harian.

## Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router, Server Actions)
- **Database:** [Supabase PostgreSQL](https://supabase.com/)
- **Authentication:** Supabase Auth (Email & Password)
- **Realtime:** Supabase Realtime Channels
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)

---

## 🚀 Setup & Panduan Deployment

### 1. Persiapan Supabase (Database & Auth)

1. Buat project baru di [Supabase Dashboard](https://supabase.com/dashboard).
2. Pergi ke menu **SQL Editor**, dan jalankan script berikut untuk membuat tabel, function, dan RLS (Row Level Security):

```sql
-- 1. Create tables
CREATE TABLE services (
  id SERIAL PRIMARY KEY,
  code CHAR(1) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE queue_counters (
  id SERIAL PRIMARY KEY,
  service_id INT REFERENCES services(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  last_number SMALLINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(service_id, date)
);

CREATE TABLE queues (
  id BIGSERIAL PRIMARY KEY,
  service_id INT REFERENCES services(id) ON DELETE CASCADE,
  visitor_name VARCHAR(150) NOT NULL,
  institution VARCHAR(150),
  queue_number SMALLINT NOT NULL,
  queue_code VARCHAR(10) NOT NULL,
  status VARCHAR(10) DEFAULT 'waiting' CHECK (status IN ('waiting', 'called', 'served', 'skipped')),
  date DATE NOT NULL,
  called_at TIMESTAMPTZ,
  served_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_queues_date_service_status ON queues(date, service_id, status);

-- 2. Insert Default Services
INSERT INTO services (code, name, description) VALUES
  ('A', 'Konsultasi Statistik', 'Konsultasi terkait data dan statistik'),
  ('B', 'Permintaan Data', 'Permintaan data mikro/makro'),
  ('C', 'Layanan Lainnya', 'Layanan PST lainnya');

-- 3. Atomic counter function for new queues
CREATE OR REPLACE FUNCTION get_next_queue_number(p_service_id INT, p_date DATE)
RETURNS INT AS $$
DECLARE v_number INT;
BEGIN
  INSERT INTO queue_counters (service_id, date, last_number)
  VALUES (p_service_id, p_date, 1)
  ON CONFLICT (service_id, date) 
  DO UPDATE SET last_number = queue_counters.last_number + 1, updated_at = NOW()
  RETURNING last_number INTO v_number;
  RETURN v_number;
END;
$$ LANGUAGE plpgsql;

-- 4. View for Admin History
CREATE VIEW queue_history_summary AS
SELECT 
  date,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'served' THEN 1 ELSE 0 END) as served,
  SUM(CASE WHEN status = 'waiting' THEN 1 ELSE 0 END) as waiting,
  SUM(CASE WHEN status = 'skipped' THEN 1 ELSE 0 END) as skipped
FROM queues
GROUP BY date;

-- 5. Enable Realtime on queues table
ALTER PUBLICATION supabase_realtime ADD TABLE queues;

-- 6. Setup Row Level Security (RLS)
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read" ON services FOR SELECT USING (true);

ALTER TABLE queue_counters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read" ON queue_counters FOR SELECT USING (true);
CREATE POLICY "Auth All" ON queue_counters FOR ALL TO authenticated USING (true);

ALTER TABLE queues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read" ON queues FOR SELECT USING (true);
-- Visitors can insert queue, but we handle it via Server Actions
CREATE POLICY "Public Insert" ON queues FOR INSERT WITH CHECK (true);
-- Only authenticated admin can update queue status
CREATE POLICY "Admin Update" ON queues FOR UPDATE TO authenticated USING (true);
```

### 2. Setup Akun Admin (Supabase Auth)
Karena ini menggunakan Supabase Auth, Anda tidak perlu membuat form registrasi. Buat akun admin langsung dari dashboard:
1. Di Supabase, buka menu **Authentication** -> **Users**.
2. Klik **Add User** -> **Create New User**.
3. Masukkan Email & Password admin Anda. Uncheck "Auto Confirm User" jika perlu, atau pastikan verifikasi di-disable di Authentication settings.

### 3. Setup Lokal (Development)

1. Clone repositori ini.
2. Buat file `.env.local` berdasarkan `.env.local.example`.
3. Dapatkan keys dari Supabase (**Project Settings** -> **API**):
   - `NEXT_PUBLIC_SUPABASE_URL` -> URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` -> anon / public key
   - `SUPABASE_SERVICE_ROLE_KEY` -> service_role / secret key (jika butuh, sementara dikosongkan tidak apa)
4. Install _dependencies_:
   ```bash
   npm install
   ```
5. Jalankan server lokal:
   ```bash
   npm run dev
   ```

### 4. Deployment ke Vercel (Hobby Plan)

Proyek ini sudah dioptimalkan untuk Vercel:
1. Login ke [Vercel](https://vercel.com).
2. Buat _New Project_ dan import dari repositori GitHub proyek ini.
3. Di bagian **Environment Variables**, tambahkan:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Klik **Deploy**. Vercel akan otomatis mengenali Next.js dan mem-_build_ aplikasi Anda.
5. Selesai! Web antrian siap digunakan di URL Vercel yang diberikan.

---

_Catatan: Aplikasi ini secara khusus didesain dengan timezone WIB (UTC+7) di logic backend-nya, sehingga hari dan waktu antrian tetap akurat meskipun dideploy pada server Vercel (yang biasanya UTC)._
