import { generateQuestions } from '@/lib/gemini'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const ADMIN_EMAIL = 'zaini.jasni@gmail.com'

const SUBJECT_LABEL = {
  'matematik': 'Matematik',
  'bahasa-melayu': 'Bahasa Melayu',
  'bahasa-inggeris': 'English (Bahasa Inggeris)',
  'sains': 'Sains',
}

const TOPIC_LABEL = {
  'nombor-bulat': 'Nombor Bulat — Nilai Tempat, Bundar, Bandingkan & Susun Nombor',
  'tambah-tolak': 'Operasi Tambah dan Tolak — Termasuk Operasi Bergabung',
  'darab-bahagi': 'Operasi Darab dan Bahagi — Termasuk Operasi Bergabung',
  'wang': 'Wang — Tambah, Tolak, Darab, Bahagi melibatkan sen dan ringgit',
  'masa-waktu': 'Masa dan Waktu — Baca jam, Kira tempoh masa, Kalendar',
  'ukuran': 'Ukuran — Panjang (cm/m/km), Jisim (g/kg), Isipadu Cecair (ml/l)',
  'pecahan': 'Pecahan — Tambah, Tolak, Bandingkan Pecahan (termasuk penyebut berbeza, KPK)',
  'perpuluhan': 'Perpuluhan — Tambah, Tolak, Darab, Bahagi nombor perpuluhan',
  'peratus': 'Peratus — Tukar pecahan/perpuluhan kepada peratus, hitung peratus daripada kuantiti',
  'luas-perimeter': 'Luas dan Perimeter — Segiempat, Segitiga, Bentuk Gabungan',
  'data-graf': 'Data dan Graf — Graf Palang, Pictograf, Jadual Kekerapan',
  'nisbah': 'Nisbah dan Kadaran — Nisbah mudah, Selesaikan masalah nisbah',
  'ejaan-bm': 'Ejaan dan Sebutan — Kata Berimbuhan Awalan dan Akhiran',
  'tatabahasa-asas': 'Tatabahasa Asas — Kata Nama Am, Kata Nama Khas, Kata Kerja',
  'tatabahasa-lanjut': 'Tatabahasa Lanjut — Kata Adjektif, Kata Hubung, Penjodoh Bilangan',
  'pemahaman': 'Pemahaman Petikan — Soalan Literal dan Inferens',
  'karangan': 'Karangan Berdasarkan Gambar — Karangan berformat (minimum 3 perenggan)',
  'simpulan-bahasa': 'Simpulan Bahasa dan Peribahasa — Makna dan penggunaan dalam ayat',
  'karangan-fakta': 'Karangan Fakta dan Imaginatif — Struktur, isi, bahasa yang tepat',
  'ayat-majmuk': 'Ayat Majmuk dan Penjodoh Bilangan — Bina ayat menggunakan kata hubung',
  'vocabulary': 'Vocabulary in Context — Synonyms, Antonyms, Word Meaning from Context',
  'phonics-spelling': 'Phonics and Spelling — Common spelling patterns, dictation-style questions',
  'grammar-basic': 'Grammar Basics — Nouns, Pronouns, Verbs, Adjectives in sentences',
  'grammar-tenses': 'Grammar — Present, Past, Future Tenses and Subject-Verb Agreement',
  'reading-comprehension': 'Reading Comprehension — Inference and literal questions from passage',
  'writing': 'Guided Writing — Picture-based Story (3 paragraphs, structured)',
  'grammar-advanced': 'Grammar — Conjunctions, Prepositions, Complex Sentence Structure',
  'letter-writing': 'Informal Letter Writing — Format, greeting, body, closing',
  'deria': 'Deria dan Fungsinya — 5 deria, organ deria, cara deria berfungsi',
  'haiwan': 'Haiwan — Pengelasan, ciri-ciri, keperluan asas, adaptasi',
  'tumbuhan': 'Tumbuhan — Bahagian tumbuhan, proses fotosintesis, pembiakan',
  'cuaca': 'Cuaca dan Alam Sekitar — Jenis cuaca, ciri, alat ukur cuaca, kesan',
  'jirim': 'Jirim — Pepejal, Cecair, Gas, Sifat dan Perubahan Jirim',
  'manusia-badan': 'Sistem Badan Manusia — Sistem Pencernaan, Pernafasan, Peredaran Darah',
  'cahaya-bunyi': 'Cahaya dan Bunyi — Sifat cahaya, sumber bunyi, amplitud dan frekuensi',
  'daya-gerak': 'Daya dan Gerakan — Daya tolak, tarik, graviti, geseran, spring',
  'ekosistem': 'Ekosistem dan Rantai Makanan — Produsen, Pengguna, Pengurai, Habitat',
  'bumi-sumber': 'Bumi dan Sumber Asli — Lapisan bumi, sumber boleh diperbaharui, pemuliharaan',
}

function buildPrompt(subject, topic, year) {
  const lang = subject === 'bahasa-inggeris' ? 'English' : 'Bahasa Malaysia'
  return `You are an expert educational content creator for Malaysian primary school students following KSSR Semakan 2017 curriculum.

Generate 3 DIFFERENT exam-style questions for:
- Subject: ${SUBJECT_LABEL[subject] || subject}
- Topic: ${TOPIC_LABEL[topic] || topic}
- Year: Tahun ${year}
- Language: ${lang}

Each question uses the StudyLa 3-Layer Framework:
- Layer 1 (Faham Soalan): Help child UNDERSTAND what the question is asking
- Layer 2 (Cara Selesaikan): Show the METHOD/STEPS without giving the answer
- Layer 3 (Cuba Jawab): Show full worked solution format for parent reference

Rules:
- Questions must be exam-style (like real school exam format)
- Use realistic Malaysian names (Ahmad, Siti, Hafiz, Ain, Puan Ros, Kedai Pak Ali etc)
- Make all 3 questions DIFFERENT (different numbers, different context, different difficulty)
- question_breakdown = guiding questions parent asks child (4-5 short questions)
- parent_script = short encouraging phrase parent says (max 2 sentences, informal BM)
- answer_steps for Layer 2 = steps WITHOUT the final answer (just method)
- answer_steps for Layer 3 = complete worked solution lines

Return ONLY a valid JSON array. No explanation. No markdown. Just raw JSON.

[
  {
    "question_text": "full question text here",
    "layer1": {
      "question_breakdown": ["guiding question 1?", "question 2?", "question 3?", "question 4?"],
      "parent_script": "short parent script here"
    },
    "layer2": {
      "question_breakdown": ["method question 1?", "method question 2?", "method question 3?"],
      "answer_steps": ["Step description 1", "Step description 2", "Step description 3"],
      "parent_script": "short parent script here"
    },
    "layer3": {
      "answer_steps": ["working line 1", "working line 2", "working line 3"],
      "answer": "final answer with unit",
      "parent_script": "short parent script here"
    }
  }
]`
}

function parseJSON(text) {
  let clean = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
  try { return JSON.parse(clean) } catch {
    const match = clean.match(/\[[\s\S]*\]/)
    if (match) return JSON.parse(match[0])
    throw new Error('Tiada JSON array')
  }
}

export async function POST(request) {
  const supabaseAuth = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const authHeader = request.headers.get('Authorization')
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user }, error: authErr } = await supabaseAuth.auth.getUser(
    authHeader.replace('Bearer ', '')
  )
  if (authErr || !user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { subject, topic, year, batches = 5 } = await request.json()
  if (!subject || !topic || !year) {
    return NextResponse.json({ error: 'subject, topic, year diperlukan' }, { status: 400 })
  }

  const maxBatches = Math.min(batches, 20) // max 20 batches = 60 soalan per call
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  let totalGenerated = 0
  const errors = []

  for (let i = 0; i < maxBatches; i++) {
    try {
      const prompt = buildPrompt(subject, topic, year)
      const rawText = await generateQuestions(prompt)

      let questions
      try {
        questions = parseJSON(rawText)
      } catch {
        errors.push(`Batch ${i + 1}: JSON parse failed`)
        continue
      }

      if (!Array.isArray(questions)) questions = [questions]
      questions = questions.filter(q => q?.question_text)

      if (questions.length === 0) {
        errors.push(`Batch ${i + 1}: No valid questions`)
        continue
      }

      const rows = []
      for (const q of questions) {
        rows.push(
          { subject, topic, year: parseInt(year), layer: 1, question_text: q.question_text, question_breakdown: q.layer1?.question_breakdown || [], parent_script: q.layer1?.parent_script || '', answer: q.layer3?.answer || '', answer_steps: q.layer1?.answer_steps || [], source: 'ai-bulk', is_approved: true },
          { subject, topic, year: parseInt(year), layer: 2, question_text: q.question_text, question_breakdown: q.layer2?.question_breakdown || [], parent_script: q.layer2?.parent_script || '', answer: q.layer3?.answer || '', answer_steps: q.layer2?.answer_steps || [], source: 'ai-bulk', is_approved: true },
          { subject, topic, year: parseInt(year), layer: 3, question_text: q.question_text, question_breakdown: [], parent_script: q.layer3?.parent_script || '', answer: q.layer3?.answer || '', answer_steps: q.layer3?.answer_steps || [], source: 'ai-bulk', is_approved: true }
        )
      }

      const { error: insertErr } = await admin.from('questions').insert(rows)
      if (insertErr) {
        errors.push(`Batch ${i + 1}: DB insert failed`)
      } else {
        totalGenerated += questions.length
      }
    } catch (err) {
      errors.push(`Batch ${i + 1}: ${err.message}`)
    }
  }

  return NextResponse.json({
    success: true,
    generated: totalGenerated,
    batches: maxBatches,
    errors: errors.length > 0 ? errors : undefined,
    message: `${totalGenerated} soalan berjaya dijanakan untuk ${TOPIC_LABEL[topic] || topic} Tahun ${year}.`,
  })
}
