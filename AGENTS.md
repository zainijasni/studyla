<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# StudyLa — Dokumentasi Sistem

**Platform belajar untuk ibu bapa pandu anak menggunakan Kaedah 3 Lapisan.**
Dimiliki dan dibangunkan oleh **DCK Tech**.

---

## 📋 Maklumat Projek

| Perkara | Butiran |
|---|---|
| **URL Production** | https://studyla.vercel.app |
| **GitHub** | https://github.com/zainijasni/studyla.git |
| **Port Development** | localhost:3001 |
| **Admin Email** | zaini.jasni@gmail.com |

---

## 🛠️ Tech Stack

| Bahagian | Teknologi |
|---|---|
| **Frontend** | Next.js 16.2.6, React 19.2.4, Tailwind CSS v4 |
| **Backend / Database** | Supabase (PostgreSQL + Auth) |
| **AI Model** | Gemini 2.0 Flash via OpenRouter (`google/gemini-2.0-flash-001`) |
| **Deployment** | Vercel (auto-deploy dari GitHub) |
| **PWA** | Service Worker via `RegisterSW.js` |

---

## 📂 Struktur Folder

```
studyla/
├── src/
│   ├── app/
│   │   ├── page.js                    ← Landing page
│   │   ├── login/page.js
│   │   ├── daftar/page.js
│   │   ├── dashboard/page.js
│   │   ├── onboarding/page.js
│   │   ├── profil-anak/
│   │   │   ├── tambah/page.js
│   │   │   └── [id]/page.js
│   │   ├── pilih-sesi/page.js
│   │   ├── sesi/page.js               ← Sesi belajar (teras)
│   │   ├── laporan/page.js
│   │   ├── tetapan/page.js
│   │   ├── bantuan/page.js
│   │   ├── feedback/page.js
│   │   ├── admin/page.js
│   │   └── api/
│   │       ├── generate-question/route.js
│   │       └── admin/
│   │           ├── data/route.js
│   │           ├── bulk-generate/route.js
│   │           └── delete-user/route.js
│   ├── components/
│   │   ├── Sidebar.js                 ← Desktop nav (hidden md:block)
│   │   ├── BottomNav.js               ← Mobile nav (md:hidden)
│   │   └── RegisterSW.js
│   └── lib/
│       ├── supabase.js
│       ├── gemini.js                  ← OpenRouter wrapper
│       └── utils.js
├── CLAUDE.md
├── AGENTS.md                          ← (this file)
└── package.json
```

---

## 🗄️ Database Schema (Supabase)

| Jadual | Fungsi |
|---|---|
| `children` | Profil anak — `id, name, year, parent_id, created_at` |
| `questions` | Soalan per layer — `id, subject, topic, year, layer (1/2/3), question_text, question_breakdown, parent_script, answer, answer_steps, source, is_approved, created_at` |
| `sessions` | Rekod sesi belajar — `id, child_id, subject, topic, correct_count, total_questions, completed, created_at` |
| `topic_progress` | Kemajuan per topik — `child_id, subject, topic, mastery_status (mastered/progressing/struggling), last_session_at` |
| `feedback` | Maklum balas pengguna — `id, user_id, answers (jsonb), created_at` |

### `questions` — 3 Layer per soalan
Satu set soalan = 3 row dalam DB (layer 1, 2, 3), berkongsi `question_text`.
- **Layer 1** — Faham Soalan (guiding questions)
- **Layer 2** — Cara Selesaikan (method steps, no answer)
- **Layer 3** — Cuba Jawab (full worked solution)

### `sessions` — correct_count = Faham Sendiri
`correct_count` ≠ "berapa soalan betul". Ia mengira **faham sendiri** — soalan yang betul pada cubaan pertama tanpa tekan "Cuba Lagi".

---

## 📱 Halaman & Features

### Landing Page (`/`)
- Spinner awal jika pengguna mungkin log masuk (sniff localStorage auth-token)
- Redirect ke `/dashboard` jika sesi aktif
- Footer: "Dimiliki dan dibangunkan oleh DCK Tech"

### Dashboard (`/dashboard`)
- Senarai profil anak (tambah/edit/padam)
- Logo besar untuk branding
- Start sesi belajar per anak

### Pilih Sesi (`/pilih-sesi`)
- Grid 2×2 untuk 4 subjek (semua nampak sekaligus)
- Pilih subjek → topik → tahun → start
- Progress per topik ditunjukkan ("X/Y faham")

### Sesi Belajar (`/sesi`)
- 3 fasa: Layer 1 → Layer 2 → Layer 3 (Cuba Jawab)
- Header menunjukkan nama subjek + topik
- "Cuba Lagi" untuk soalan yang tidak faham (ulang dari Layer 1)
- **Selesai screen**: flat layout, % Faham Sendiri dalam hero pill frosted glass

### Laporan (`/laporan`)
- Statistik per anak: sesi, streak, ketepatan
- Status per topik: Dah Faham / Dalam Proses / Perlu Bantuan
- Sets `localStorage.setItem('studyla_laporan_visited', 'true')` bila dibuka

### Tetapan (`/tetapan`)
- Tukar kata laluan

### Bantuan (`/bantuan`)
- FAQ accordion dalam 5 seksyen
- CTA untuk isi feedback

### Feedback (`/feedback`)
- 6 soalan (rating bintang, pilihan, teks)
- Satu soalan per skrin + progress bar
- Submit → simpan ke `feedback` table + set `localStorage.studyla_feedback_done = 'true'`

### Admin (`/admin`) — zaini.jasni@gmail.com sahaja
- 5 tab: Overview, Pengguna, Sesi Terkini, Soalan, Feedback
- Data diambil dari `/api/admin/data` (service role key, bypass RLS)

---

## 🔢 Sistem Pemarkahan (Faham Sendiri)

```
Betul pada cubaan pertama  → fahamSendiri = true  → dikira dalam %
Betul selepas Cuba Lagi    → fahamSendiri = false → dikira sebagai "Dengan Bantuan"
```

`peratus = fahamSendiriCount / total * 100`

Status dalam `topic_progress`:
- `mastered` — ≥80%
- `progressing` — 50–79%
- `struggling` — <50%

---

## 📊 Trigger Feedback

Feedback prompt muncul pada selesai screen **hanya jika**:
1. `sessionCount >= 5` (dah habis ≥5 sesi)
2. `localStorage.studyla_laporan_visited === 'true'` (dah lawat laporan)
3. `localStorage.studyla_feedback_done !== 'true'` (belum pernah isi)

---

## 🧭 Navigasi

Dua sistem navigasi berasingan — **kedua-dua perlu dikemaskini** bila tambah halaman baru:

| Komponen | Guna | Item |
|---|---|---|
| `Sidebar.js` | Desktop (`hidden md:block`) | Utama, Kemajuan, Bantuan, Tetapan, Admin (jika admin) |
| `BottomNav.js` | Mobile (`md:hidden`) | Utama, Kemajuan, Bantuan, Tetapan, Admin (jika admin) |

---

## 🤖 Jana Soalan AI

**API Route:** `POST /api/generate-question`

```json
{ "subject": "matematik", "topic": "pecahan", "year": 3 }
```

- Memanggil Gemini 2.0 Flash via OpenRouter
- Jana 3 soalan berbeza sekaligus
- Simpan 9 rows ke DB (3 soalan × 3 layers)
- Jika tiada soalan dalam DB untuk topik+tahun, `sesi/page.js` trigger auto-generate (10–15 saat)

**38 Topik tersedia** (4 subjek × ~10 topik):
- Matematik: nombor-bulat, tambah-tolak, darab-bahagi, wang, masa-waktu, ukuran, pecahan, perpuluhan, peratus, luas-perimeter, data-graf, nisbah
- Bahasa Melayu: ejaan-bm, tatabahasa-asas, tatabahasa-lanjut, pemahaman, karangan, simpulan-bahasa, karangan-fakta, ayat-majmuk
- Bahasa Inggeris: vocabulary, phonics-spelling, grammar-basic, grammar-tenses, reading-comprehension, writing, grammar-advanced, letter-writing
- Sains: deria, haiwan, tumbuhan, cuaca, jirim, manusia-badan, cahaya-bunyi, daya-gerak, ekosistem, bumi-sumber

---

## 🔐 API Routes

| Route | Fungsi |
|---|---|
| `POST /api/generate-question` | Jana soalan AI + simpan ke DB |
| `GET /api/admin/data` | Semua data admin (auth: Bearer token) |
| `POST /api/admin/bulk-generate` | Jana soalan secara pukal |
| `POST /api/admin/delete-user` | Padam user (profile dulu, baru auth) |

---

## ⚙️ Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENROUTER_API_KEY=
```

---

## 🎨 Design System

| Elemen | Nilai |
|---|---|
| **Primary** | Violet (`violet-700`, `violet-800`) |
| **Background** | Slate (`slate-50`, `slate-100`) |
| **Success** | Emerald (`emerald-500`) |
| **Warning** | Amber |
| **Mobile layout** | `h-screen flex flex-col overflow-hidden` + BottomNav `pb-20` |
| **Desktop layout** | `md:ml-52` untuk sidebar offset |
| **Hero pattern** | Gradient bg + frosted glass pill (`bg-white/15 backdrop-blur-sm rounded-2xl`) |

---

## 🔄 Workflow Git

```bash
git add .
git commit -m "Describe changes"
git push origin master
# Vercel auto-deploy
```

---

## 📌 Penting untuk AI Agent

1. **Setiap halaman baru** — kena tambah ke **kedua-dua** `Sidebar.js` DAN `BottomNav.js`
2. **`correct_count` dalam sessions** = Faham Sendiri count (bukan sekadar jawab betul)
3. **localStorage keys**: `studyla_feedback_done`, `studyla_laporan_visited`
4. **Admin check**: `user.email === 'zaini.jasni@gmail.com'` (hardcoded)
5. **Landing page**: Guna sync localStorage sniff untuk elak flash sebelum `getSession()` settle
6. **Selesai screen**: Flat layout — % dalam hero pill, tiada negative margin overlap

---

*Kemaskini: Jun 2026*
