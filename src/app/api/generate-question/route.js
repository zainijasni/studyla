import { generateQuestions } from '@/lib/gemini'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ─── Label map ────────────────────────────────────────────────────────────────

const SUBJECT_LABEL = {
  'matematik': 'Matematik',
  'bahasa-melayu': 'Bahasa Melayu',
  'bahasa-inggeris': 'English (Bahasa Inggeris)',
  'sains': 'Sains',
}

const TOPIC_LABEL = {
  // Matematik
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
  // Bahasa Melayu
  'ejaan-bm': 'Ejaan dan Sebutan — Kata Berimbuhan Awalan dan Akhiran',
  'tatabahasa-asas': 'Tatabahasa Asas — Kata Nama Am, Kata Nama Khas, Kata Kerja',
  'tatabahasa-lanjut': 'Tatabahasa Lanjut — Kata Adjektif, Kata Hubung, Penjodoh Bilangan',
  'pemahaman': 'Pemahaman Petikan — Soalan Literal dan Inferens',
  'karangan': 'Karangan Berdasarkan Gambar — Karangan berformat (minimum 3 perenggan)',
  'simpulan-bahasa': 'Simpulan Bahasa dan Peribahasa — Makna dan penggunaan dalam ayat',
  'karangan-fakta': 'Karangan Fakta dan Imaginatif — Struktur, isi, bahasa yang tepat',
  'ayat-majmuk': 'Ayat Majmuk dan Penjodoh Bilangan — Bina ayat menggunakan kata hubung',
  // Bahasa Inggeris
  'vocabulary': 'Vocabulary in Context — Synonyms, Antonyms, Word Meaning from Context',
  'phonics-spelling': 'Phonics and Spelling — Common spelling patterns, dictation-style questions',
  'grammar-basic': 'Grammar Basics — Nouns, Pronouns, Verbs, Adjectives in sentences',
  'grammar-tenses': 'Grammar — Present, Past, Future Tenses and Subject-Verb Agreement',
  'reading-comprehension': 'Reading Comprehension — Inference and literal questions from passage',
  'writing': 'Guided Writing — Picture-based Story (3 paragraphs, structured)',
  'grammar-advanced': 'Grammar — Conjunctions, Prepositions, Complex Sentence Structure',
  'letter-writing': 'Informal Letter Writing — Format, greeting, body, closing',
  // Sains
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
  // Legacy IDs (backward compat)
  'pecahan-t3': 'Pecahan — Tambah dan Tolak Pecahan Wajar (penyebut berbeza, guna KPK)',
  'perpuluhan-peratus': 'Perpuluhan dan Peratus',
  'tatabahasa': 'Tatabahasa — Kata Hubung dan Ayat Majmuk',
  'grammar': 'Grammar — Tenses and Sentence Structure',
}

// ─── Build prompt ─────────────────────────────────────────────────────────────

function buildPrompt(subject, topic, year) {
  const subjectLabel = SUBJECT_LABEL[subject] || subject
  const topicLabel = TOPIC_LABEL[topic] || topic
  const lang = subject === 'bahasa-inggeris' ? 'English' : 'Bahasa Malaysia'

  return `You are an expert educational content creator for Malaysian primary school students following KSSR Semakan 2017 curriculum.

Generate 3 DIFFERENT exam-style questions for:
- Subject: ${subjectLabel}
- Topic: ${topicLabel}
- Year: Tahun ${year}
- Language: ${lang}

Each question uses the StudyLa 3-Layer Framework:
- Layer 1 (Faham Soalan): Help child UNDERSTAND what the question is asking
- Layer 2 (Cara Selesaikan): Show the METHOD/STEPS without giving the answer
- Layer 3 (Cuba Jawab): Show full worked solution format for parent reference

Rules:
- Questions must be exam-style (like real school exam format)
- Use realistic Malaysian names (Ahmad, Siti, Hafiz, Ain, Puan Ros, Kedai Pak Ali etc)
- question_breakdown = guiding questions parent asks child (4-5 short questions)
- parent_script = short encouraging phrase parent says (max 2 sentences, informal BM)
- answer_steps for Layer 2 = steps WITHOUT the final answer (just method)
- answer_steps for Layer 3 = complete worked solution lines
- Make all 3 questions DIFFERENT (different numbers, different context)

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

// ─── Parse JSON robustly ──────────────────────────────────────────────────────

function parseJSON(text) {
  // Strip markdown code blocks
  let clean = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()

  // Cuba parse terus
  try {
    return JSON.parse(clean)
  } catch {
    // Cuba cari array dalam text
    const match = clean.match(/\[[\s\S]*\]/)
    if (match) return JSON.parse(match[0])
    throw new Error('Tidak jumpa JSON array dalam response')
  }
}

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(request) {
  try {
    const { subject, topic, year } = await request.json()

    if (!subject || !topic || !year) {
      return NextResponse.json({ error: 'subject, topic, year diperlukan' }, { status: 400 })
    }

    const prompt = buildPrompt(subject, topic, year)
    const rawText = await generateQuestions(prompt)

    let questions
    try {
      questions = parseJSON(rawText)
    } catch (e) {
      console.error('JSON parse error:', e.message)
      console.error('Raw response:', rawText.substring(0, 500))
      return NextResponse.json({ error: 'Response bukan JSON valid' }, { status: 500 })
    }

    // Normalize — handle array atau single object
    if (!Array.isArray(questions)) questions = [questions]
    questions = questions.filter(q => q?.question_text)

    if (questions.length === 0) {
      return NextResponse.json({ error: 'Tiada soalan dijanakan' }, { status: 500 })
    }

    // Save ke Supabase
    const rows = []
    for (const q of questions) {
      rows.push(
        {
          subject, topic, year: parseInt(year), layer: 1,
          question_text: q.question_text,
          question_breakdown: q.layer1?.question_breakdown || [],
          parent_script: q.layer1?.parent_script || '',
          answer: q.layer3?.answer || '',
          answer_steps: q.layer1?.answer_steps || [],
          source: 'ai-realtime', is_approved: true,
        },
        {
          subject, topic, year: parseInt(year), layer: 2,
          question_text: q.question_text,
          question_breakdown: q.layer2?.question_breakdown || [],
          parent_script: q.layer2?.parent_script || '',
          answer: q.layer3?.answer || '',
          answer_steps: q.layer2?.answer_steps || [],
          source: 'ai-realtime', is_approved: true,
        },
        {
          subject, topic, year: parseInt(year), layer: 3,
          question_text: q.question_text,
          question_breakdown: [],
          parent_script: q.layer3?.parent_script || '',
          answer: q.layer3?.answer || '',
          answer_steps: q.layer3?.answer_steps || [],
          source: 'ai-realtime', is_approved: true,
        }
      )
    }

    const { error: insertError } = await supabaseAdmin.from('questions').insert(rows)
    if (insertError) {
      console.error('Supabase insert error:', insertError)
      return NextResponse.json({ error: 'Gagal simpan soalan' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      generated: questions.length,
      message: `${questions.length} soalan berjaya dijanakan.`
    })

  } catch (err) {
    console.error('Generate question error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
