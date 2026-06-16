<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# StudyLa — Dokumentasi Sistem

**Platform belajar untuk ibu bapa pandu anak menggunakan Kaedah 3 Lapisan.**
Dimiliki dan dibangunkan oleh **DCK Tech**. Status: Aktif — Fasa Beta, stabil, tiada perubahan aktif besar.

> Dokumen ini diaudit terus daripada kod sumber (Jun 2026) — bukan sekadar catatan ingatan. Rujuk seksyen **Known Issues** untuk isu sebenar yang dijumpai dalam kod.

---

## 1. Tujuan & Overview

StudyLa membantu ibu bapa **mengajar anak sendiri di rumah** menggunakan kaedah berstruktur 3 lapisan, supaya anak faham proses berfikir — bukan sekadar hafal jawapan atau minta jawapan terus. Parent yang pegang device dan jadi "coach", dipandu skrip dan soalan panduan yang disediakan sistem.

| Perkara | Butiran |
|---|---|
| **Pengguna sasaran** | Ibu bapa anak sekolah rendah Malaysia (Tahun 1–5) |
| **Kurikulum** | KSSR Semakan 2017 |
| **Subjek** | Matematik, Bahasa Melayu, Bahasa Inggeris, Sains (4 subjek, 38 topik) |
| **URL Production** | https://studyla.vercel.app |
| **GitHub** | https://github.com/zainijasni/studyla.git |
| **Port Development** | localhost:3001 |
| **Admin Email** | zaini.jasni@gmail.com (hardcoded — lihat Known Issues) |

---

## 2. Tech Stack (terus dari package.json)

| Bahagian | Teknologi |
|---|---|
| **Framework** | Next.js 16.2.6 (App Router), React 19.2.4 |
| **Styling** | Tailwind CSS v4 (`@tailwindcss/postcss`) |
| **Backend / DB** | Supabase (PostgreSQL + Auth), klien `@supabase/supabase-js` |
| **AI Jana Soalan** | Google Gemini 2.0 Flash, diakses **via OpenRouter** (bukan terus Google API) |
| **Deployment** | Vercel, auto-deploy dari `master` |
| **PWA** | Custom service worker (`public/sw.js`), manifest di `public/manifest.json` |
| **Utils** | `clsx` + `tailwind-merge` (helper `cn()`), `lucide-react`, `class-variance-authority` |
| **Build config** | `next.config.mjs` set `typescript.ignoreBuildErrors: true` — TS errors tak block deploy |

Path alias: `@/*` → `./src/*` (jsconfig.json).

---

## 3. Struktur Folder (sebenar)

```
studyla/
├── src/
│   ├── app/
│   │   ├── page.js                     ← Landing page (/)
│   │   ├── loading.js                  ← Global loading fallback (skeleton)
│   │   ├── layout.js                   ← Root layout, font Plus Jakarta Sans, PWA metadata
│   │   ├── login/page.js
│   │   ├── daftar/page.js              ← Pendaftaran (nama, email, no. telefon, password)
│   │   ├── onboarding/page.js          ← 3-step: welcome → tambah anak → pilih subjek
│   │   ├── dashboard/
│   │   │   ├── page.js
│   │   │   └── loading.js
│   │   ├── profil-anak/
│   │   │   ├── tambah/page.js
│   │   │   └── [id]/page.js            ← Edit + padam profil anak
│   │   ├── pilih-sesi/page.js          ← Grid 2×2 subjek + senarai topik
│   │   ├── sesi/page.js                ← Sesi belajar 3-layer (fail paling besar/kompleks)
│   │   ├── laporan/page.js             ← Statistik, streak, status per topik
│   │   ├── tetapan/page.js             ← Tukar nama & kata laluan
│   │   ├── bantuan/page.js             ← FAQ accordion + CTA feedback
│   │   ├── feedback/page.js            ← Borang 6-soalan, satu skrin per soalan
│   │   ├── admin/page.js               ← Panel admin (5 tab)
│   │   └── api/
│   │       ├── generate-question/route.js
│   │       └── admin/
│   │           ├── data/route.js
│   │           ├── bulk-generate/route.js
│   │           └── delete-user/route.js
│   ├── components/
│   │   ├── Sidebar.js                  ← Desktop nav (hidden md:block)
│   │   ├── BottomNav.js                ← Mobile nav (md:hidden)
│   │   └── RegisterSW.js               ← Daftar service worker on mount
│   └── lib/
│       ├── supabase.js                 ← Klien Supabase browser (anon key)
│       ├── gemini.js                   ← Wrapper OpenRouter (bukan @google/generative-ai walaupun ada dalam deps)
│       └── utils.js                    ← `cn()` helper sahaja
├── docs/
│   ├── studyla-schema.sql              ← Schema rasmi (SUMBER KEBENARAN untuk DB)
│   ├── master-content.md               ← Rujukan content/prompt (identik dgn fail bawah)
│   └── belajarbersama-master-content.md ← Sama 810 baris — nama lama projek sebelum rebrand
├── public/
│   ├── sw.js                           ← Service worker custom (cache-first untuk static, network-first untuk HTML)
│   ├── manifest.json
│   └── logo.png, icon-192.png, icon-512.png, apple-touch-icon.png
├── CLAUDE.md                           ← (fail ini)
└── package.json
```

---

## 4. Database Schema (terus dari `docs/studyla-schema.sql`)

```sql
user_profiles   id (= auth.users.id), email, full_name, plan ('free'|'premium'), created_at
children        id, parent_id → user_profiles, name, year (1–5), created_at
questions       id, subject, year, topic, layer (1|2|3), question_text, question_breakdown (jsonb),
                parent_script, answer, answer_steps (jsonb), explanation, source, difficulty,
                is_approved, created_at
sessions        id, child_id, parent_id, subject, topic, year, total_questions, correct_count,
                duration_minutes, completed, created_at
session_questions  id, session_id, question_id, layer_reached, stuck_at_layer, attempts, correct,
                    time_seconds, created_at
topic_progress  id, child_id, subject, topic, year,
                status ('mastered'|'progressing'|'struggling'|'not_started'|'backtrack_needed'),
                sessions_count, last_session_at, updated_at  — UNIQUE(child_id, subject, topic)
feedback        id, user_id, answers (jsonb), created_at   (tiada dalam .sql — dibuat manual via Supabase dashboard)
```

RLS aktif pada semua jadual utama: `auth.uid() = parent_id` (children/sessions), `auth.uid() = id` (user_profiles), join melalui `children`/`sessions` untuk `session_questions`/`topic_progress`. Auto-trigger `on_auth_user_created` cipta row `user_profiles` bila user baru sign up.

### `questions` — 3 layer per soalan
Satu set soalan = 3 row (layer 1/2/3) berkongsi `question_text` yang sama. App group balik ikut `question_text` (lihat `groupSoalanByLayers()` dalam `sesi/page.js`).

### `sessions.correct_count` = "Faham Sendiri", bukan "jawab betul"
Logic dalam `sesi/page.js` (`finishSession`): soalan dikira **fahamSendiri** hanya jika betul pada cubaan **pertama** (tiada tekan "Cuba Lagi"). Soalan yang betul selepas "Cuba Lagi" dikira "Dengan Bantuan" — betul, tapi tidak masuk `correct_count`.

```
peratus = fahamSendiriCount / total_questions * 100
status  = peratus >= 80 ? 'mastered' : peratus >= 50 ? 'progressing' : 'struggling'
```

---

## 5. Halaman & Logic Penting

### Landing (`/`)
Sniff `localStorage` (cari key dengan `'auth-token'`) secara **synchronous** sebelum render — kalau ada, papar spinner dulu (elak flash landing page) sementara `getSession()` confirm dan redirect ke `/dashboard`.

### Sesi Belajar (`/sesi`) — logic paling kompleks
- **Question pooling**: sebelum mula sesi, kira berapa banyak soalan (layer 1) wujud untuk `subject+topic+year`. `MIN_POOL = 3`, `POOL_TARGET = 300`.
  - Pool ≥ 3 → serve dari DB dengan random offset (elak ulang soalan sama).
  - Pool < 3 **dan** tiada generation dalam 5 minit lepas → panggil `/api/generate-question` (AI generate 3 soalan baru = 9 row).
  - Pool < 3 **tapi** ada generation baru-baru ini (cooldown) → tunggu 4 saat, `window.location.reload()` — elak ramai user trigger AI serentak untuk topik sama.
- **Skoring**: lihat seksyen 4 di atas. `results` state dikemaskini async — `finishSession()` terima `lastCorrect`/`lastCubaan` sebagai parameter dan append manual ke `allResults` supaya soalan terakhir tidak terlepas dalam kiraan (state closure issue yang sudah diperbetulkan).
- Semua DB write dalam `finishSession()` dibalut `try/catch` — kalau gagal, `setSelesai(true)` tetap jalan supaya parent tak stuck pada loading screen.
- Tekan "Berhenti" (✕ pada header) terus `router.push('/dashboard')` **tanpa konfirmasi** dan **tanpa padam** row `sessions` yang sudah dicipta di awal sesi (lihat Known Issues #5).

### Laporan (`/laporan`)
Set `localStorage.studyla_laporan_visited = 'true'` selepas data load — flag ini jadi prasyarat untuk trigger feedback.

### Feedback (`/feedback`)
Trigger muncul pada selesai screen `/sesi` **hanya jika ketiga-tiga** syarat ini benar:
1. `localStorage.studyla_sessions_completed >= 5`
2. `localStorage.studyla_laporan_visited === 'true'`
3. `localStorage.studyla_feedback_done !== 'true'`

### Admin (`/admin`) — `zaini.jasni@gmail.com` sahaja
5 tab: Overview, Pengguna, Sesi Terkini, Soalan, Feedback. Data dari `GET /api/admin/data` (guna service role key, bypass RLS). Ada juga "Bulk Generate" dan "Seed Popular Topics" untuk pra-isi bank soalan.

---

## 6. API Routes

| Route | Auth | Fungsi |
|---|---|---|
| `POST /api/generate-question` | Tiada (public) | Jana 3 soalan AI (9 row) via OpenRouter, simpan ke `questions` |
| `GET /api/admin/data` | Bearer token, cek email admin | Semua data admin (users, sessions, questions, feedback, stock count) |
| `POST /api/admin/bulk-generate` | Bearer token, cek email admin | Jana soalan pukal, sehingga 20 batch (~60 soalan) sekali panggil |
| `POST /api/admin/delete-user` | Bearer token, cek email admin | Padam children → sessions → topic_progress → auth user (⚠️ ada bug, lihat Known Issues #1) |

`/api/generate-question` **tidak ada auth check** — sesiapa boleh panggil terus dan trigger AI generation (kos OpenRouter). Cooldown 5-minit dalam `sesi/page.js` mengurangkan risiko, tapi endpoint sendiri tidak rate-limited atau auth-gated.

---

## 7. Navigasi

Dua komponen berasingan — **kena update kedua-dua** bila tambah halaman:

| Komponen | Guna | Label nav utama |
|---|---|---|
| `Sidebar.js` | Desktop (`hidden md:block`) | "Profil Anak" → `/dashboard`, "Kemajuan", "Tetapan", "Bantuan" |
| `BottomNav.js` | Mobile (`md:hidden`) | "Utama" → `/dashboard`, "Kemajuan", "Bantuan", "Tetapan" |

Catatan: label item pertama **tidak konsisten** antara dua komponen ("Profil Anak" vs "Utama") dan urutan item pun berbeza (Sidebar: Kemajuan→Tetapan→Bantuan; BottomNav: Kemajuan→Bantuan→Tetapan) — kosmetik sahaja, tidak fungsional, tapi boleh disamakan.

Admin link ditambah secara berasingan dalam kedua komponen, conditional pada `user.email === ADMIN_EMAIL`.

---

## 8. Environment Variables

Ditakrif dalam `.env.local` (nama sahaja, tiada value didedah):

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=        # ⚠️ tidak digunakan dalam kod — lihat Known Issues #3
OPENROUTER_API_KEY=    # digunakan sebenar dalam src/lib/gemini.js
```

---

## 9. Known Issues (dijumpai semasa audit kod, Jun 2026)

1. **Bug — `delete-user` query column salah.** `src/app/api/admin/delete-user/route.js:36` query `children` dengan `.eq('user_id', userId)`, tapi nama column sebenar dalam schema (dan digunakan di semua tempat lain) adalah `parent_id`. Akibat: cleanup `topic_progress`/`sessions`/`children` sebelum padam user akan **tidak jumpa apa-apa row** (Supabase pulangkan ralat atau senarai kosong), jadi data anak/sesi jadi **orphaned** walaupun auth user berjaya dipadam.
2. **RPC tak wujud — `increment_topic_sessions`.** Dipanggil dalam `sesi/page.js:536` (`supabase.rpc('increment_topic_sessions', ...)`), tetapi function ini **tidak ditakrifkan** dalam `docs/studyla-schema.sql` mahupun fail lain dalam repo. Dibalut `.catch(() => {})` jadi gagal senyap setiap kali — column `topic_progress.sessions_count` berkemungkinan kekal `0`/stale untuk semua rekod.
3. **Env var tidak digunakan — `GEMINI_API_KEY`.** Wujud dalam `.env.local` tapi kod hanya guna `OPENROUTER_API_KEY` (`src/lib/gemini.js`). Gemini diakses melalui OpenRouter, bukan terus. Package `@google/generative-ai` pun ada dalam `package.json` tapi tidak diimport di mana-mana.
4. **Fail dokumentasi pendua.** `docs/master-content.md` dan `docs/belajarbersama-master-content.md` adalah **identik** (810 baris). "BelajarBersama" nampaknya nama projek asal sebelum rebrand ke "StudyLa" — satu daripadanya patut dipadam atau digabung.
5. **Sesi ditinggalkan jadi row "orphan".** Row `sessions` dicipta serta-merta bila sesi mula (`completed: false`). Kalau parent tekan "Berhenti" sebelum habis, row itu kekal `completed: false` selama-lamanya — tidak dipadam, tidak ditanda. `laporan/page.js` filter `eq('completed', true)` jadi tak nampak di UI, tapi jadual `sessions` terkumpul row tak guna dari masa ke masa.
6. **State tidak guna — `passwordLama` dalam `tetapan/page.js`.** `useState` untuk "kata laluan lama" ditakrif (baris 15) tapi field untuk dia **tidak pernah dirender** dalam form — Supabase `updateUser({password})` tidak perlukan kata laluan lama pun (sah selagi sesi aktif), jadi ini cuma dead state, bukan security gap.
7. **Butang "Naik Taraf ke Premium" tidak berfungsi.** Dalam `Sidebar.js`, butang ini tiada `onClick` handler — UI placeholder sahaja. Schema sudah ada column `user_profiles.plan` ('free'/'premium') tapi tiada logic kat mana-mana yang baca/tulis column ini. Monetisasi belum diimplementasi (rujuk seksyen Strategi Bisnes di bawah — semuanya masih cadangan, bukan dibina).
8. **`ADMIN_EMAIL` hardcoded berulang.** String `'zaini.jasni@gmail.com'` ditulis berasingan dalam sekurang-kurangnya 6 fail (`Sidebar.js`, `BottomNav.js`, `admin/page.js`, dan 3 fail route admin). Tiada satu sumber kebenaran (constant/env var) — risiko terlepas pandang kalau email admin bertukar.
9. **`POST /api/generate-question` tiada auth check.** Tidak macam endpoint admin yang lain, endpoint ni boleh dipanggil oleh sesiapa tanpa token, trigger panggilan AI berbayar (OpenRouter). Cooldown 5-minit di client-side (`sesi/page.js`) mengurangkan risiko abuse tapi tidak menghalangnya pada level API.

---

## 10. Ringkasan Git History (42 commit, urutan kronologi)

| Fasa | Perubahan utama |
|---|---|
| **Foundation** | `Create Next App` boilerplate → StudyLa v1.0 penuh (AI question gen + redesigned UI) dalam satu commit besar |
| **Stabilkan build** | Disable ESLint/TypeScript error semasa Vercel build, lazy Supabase init untuk elak build crash |
| **PWA** | Tambah service worker, installable di Android/iOS, fix layout supaya content tak tertutup bottom nav |
| **Admin tooling** | Admin dashboard (user mgmt, sesi, soalan), bulk AI generate, smart question pooling (generate hanya bila pool < 9, recycle pada 300) |
| **Cost control AI** | Turunkan `MIN_POOL` ke 3 + cooldown generation 5 minit — elak panggilan AI berlebihan |
| **UX laporan** | Streak, carta 7-hari, accuracy per subjek, cadangan pintar |
| **Speed** | Tukar semua `getUser()` (network call) → `getSession()` (local cache) merentas semua halaman; skeleton screen ganti spinner |
| **Onboarding** | 3-step flow untuk user baru (welcome → tambah anak → pilih subjek) |
| **Growth/branding** | Landing page, logo lebih besar, grid 2×2 subjek (dari scroll tab), credit "DCK Tech" |
| **Data pengguna** | Tambah no. telefon semasa daftar, admin boleh lihat detail user |
| **Honest scoring** (terbaru) | Skema "Faham Sendiri" gantikan kiraan "betul" naif — kira hanya cubaan pertama tanpa "Cuba Lagi" sebagai kefahaman sebenar |
| **Feedback system** (terbaru) | Borang 6-soalan in-app, trigger bersyarat (5 sesi + lawat laporan), tab admin untuk baca respons, placement diperbaiki (atas fold, atas butang) |
| **Polish mobile** (terbaru) | Fix selesai screen — peratusan dalam hero pill frosted-glass, buang negative-margin overlap yang tutup teks pada mobile |
| **Dokumentasi** (terbaru) | Konsolidasi AGENTS.md + dokumen bisnes ke dalam satu CLAUDE.md (commit sebelum audit ini) |

---

## 11. Design System

| Elemen | Nilai |
|---|---|
| **Primary** | Violet (`violet-700`/`violet-800`), accent rose `#BE185D` (login/daftar CTA) |
| **Background** | Slate (`slate-50`, `slate-100`) |
| **Status colors** | Emerald = mastered/success, Amber = progressing/warning, Red = struggling |
| **Mobile layout** | `h-screen flex flex-col overflow-hidden` + BottomNav, `pb-20`/`pb-24` untuk elak overlap |
| **Desktop layout** | `md:ml-60` offset untuk Sidebar (lebar `w-60`) |
| **Hero pattern** | Gradient `from-violet-800 via-purple-800 to-indigo-900` + frosted glass pill (`bg-white/15 backdrop-blur-sm rounded-2xl`) |
| **Font** | Plus Jakarta Sans (Google Font via `next/font`) |

---

## 12. Penting untuk AI Agent

1. **Setiap halaman baru** — kena tambah ke **kedua-dua** `Sidebar.js` DAN `BottomNav.js`.
2. **`sessions.correct_count`** = bilangan "Faham Sendiri" (cubaan pertama betul), **bukan** jumlah jawapan betul keseluruhan.
3. **Nama column ialah `parent_id`**, bukan `user_id`, dalam jadual `children`/`sessions` — jangan ulang bug di Known Issues #1.
4. **localStorage keys yang app pakai**: `studyla_feedback_done`, `studyla_laporan_visited`, `studyla_sessions_completed`.
5. **Admin check**: `user.email === 'zaini.jasni@gmail.com'` — hardcoded, berulang di banyak fail (lihat Known Issues #8).
6. **Landing page** guna sync localStorage sniff (cari `'auth-token'` dalam key) untuk elak flash sebelum `getSession()` settle.
7. **`docs/studyla-schema.sql` adalah sumber kebenaran DB** — bukan apa yang ditulis dalam dokumen lama/ingatan. `feedback` table tiada dalam fail SQL ini (dicipta manual via dashboard).
8. Sebelum guna/rujuk `increment_topic_sessions` RPC atau `GEMINI_API_KEY`, sedar ia **tidak berfungsi/tidak digunakan** sekarang (Known Issues #2, #3).

---

## 13. Workflow Git

```bash
git add .
git commit -m "Describe changes"
git push origin master
# Vercel auto-deploy
```

---

---

# Strategi Bisnes & Monetisasi

> Seksyen ini adalah **dokumen strategi/cadangan**, bukan refleksi apa yang sudah dibina dalam kod. Tiada satu pun model monetisasi di bawah ini diimplementasi pada masa audit (Jun 2026) — column `user_profiles.plan` wujud dalam schema tapi tidak digunakan di mana-mana logic.

## Masalah yang Diselesaikan

> *"Anak dapat soalan, terus give up atau tanya jawapan je."*
> *"Ibu bapa nak bantu, tapi tak tahu cara nak explain dengan betul."*
> *"Buat homework sama — esoknya lupa. Tiada progress."*

## Kaedah 3 Lapisan

```
LAYER 1 — 🧠 FAHAM SOALAN — Bantu anak faham apa yang soalan minta.
LAYER 2 — 💡 CARA SELESAIKAN — Tunjuk kaedah langkah demi langkah.
LAYER 3 — ✏️ CUBA JAWAB — Anak cuba sendiri. Betul → teruskan. Tak faham → ulang Layer 1.
```

## Subjek & Kurikulum

KSSR Semakan 2017 (Tahun 1–5) · 4 subjek · 38 topik: Matematik (12), Bahasa Melayu (8), Bahasa Inggeris (8), Sains (10).

## Pengguna Sasaran

Ibu bapa urban/suburban (anak 6–11 tahun), pusat tuisyen kecil. Saiz pasaran: ~1.4 juta pelajar sekolah rendah Tahun 1–5 (KPM); pasaran edtech Malaysia dijangka USD 350 juta menjelang 2027.

## Strategi Monetisasi (Cadangan)

**Model A — Freemium Subscription** (disyorkan): Free (1 anak, 2 subjek, 5 sesi/bulan) vs Premium RM15/bulan (semua tanpa had) / RM120/tahun.

**Model B — Lesen Institusi (B2B)**: Pusat tuisyen RM150–350/bulan, sekolah custom.

**Model C — Pay-Per-Report**: RM2–5 sekali bayar untuk export laporan PDF.

**Model D — Tajaan Korporat/CSR**: Sponsor akses percuma komuniti B40.

**Model E — Kandungan Premium** (masa depan): Video tutorial, bengkel online, e-book panduan.

## Kelebihan Berbanding Pesaing

| Ciri | StudyLa | Platform Lain |
|---|---|---|
| Kaedah 3 Lapisan (guided) | ✅ | ❌ |
| Ibu bapa terlibat aktif | ✅ | ❌ |
| Soalan dijana AI (dinamik) | ✅ | Terhad |
| KSSR Semakan Malaysia | ✅ | Sebahagian |
| PWA — tanpa App Store | ✅ | Kebanyakan perlu install |
| Harga berpatutan | RM15/bulan (cadangan) | RM30–80/bulan |

## Pelan Pembangunan (Cadangan)

| Keutamaan | Ciri |
|---|---|
| 🔴 Tinggi | Gamifikasi (badge, streak reward), notifikasi push, export PDF laporan |
| 🟡 Sederhana | Tahun 6 & UPSR, dashboard pusat tuisyen (B2B) |
| 🟢 Masa depan | Versi Bahasa Inggeris penuh, pasaran Singapura/Indonesia |

## Metrik Kejayaan (Sasaran)

| Metrik | Sasaran |
|---|---|
| Sesi per anak / minggu | ≥ 3 sesi |
| Retention 30-hari | >40% |
| Topik "Dah Faham" per anak | ≥ 5 topik/bulan |
| Conversion Freemium → Premium | 5–10% |

---

*Kemaskini: Jun 2026 · DCK Tech · zaini.jasni@gmail.com · Diaudit terus daripada kod sumber*
