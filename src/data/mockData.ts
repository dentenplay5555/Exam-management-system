import type { StudentRecord, ExerciseDefinition, SyncLogEntry, AuditLogEntry, BinaryItemResult } from '../types';

export const EXERCISES_LIST: ExerciseDefinition[] = [
  {
    id: 'prism-fanboys-pretest',
    name: 'PRISM · FANBOYS · Pretest (วินิจฉัยพื้นฐาน)',
    seriesId: 'prism-writing',
    phase: 'Pretest',
    status: 'active',
    dueDate: '2026-10-25T23:59:00',
    totalStudents: 144,
    submittedStudents: 132,
    manifestVersion: '1.2.0',
    baseUrl: 'https://prism-pretest.nssc-english.workers.dev',
    health: 'healthy',
    lastSyncAt: '2 นาทีที่แล้ว',
    contractVerified: true,
  },
  {
    id: 'prism-fanboys-c1',
    name: 'PRISM · FANBOYS · Cycle 1 (Coordinating Conjunctions)',
    seriesId: 'prism-writing',
    phase: 'Cycle 1',
    status: 'active',
    dueDate: '2026-10-30T23:59:00',
    totalStudents: 144,
    submittedStudents: 98,
    manifestVersion: '1.2.0',
    baseUrl: 'https://prism-cycle1.nssc-english.workers.dev',
    health: 'healthy',
    lastSyncAt: '5 นาทีที่แล้ว',
    contractVerified: true,
  },
  {
    id: 'prism-fanboys-c2',
    name: 'PRISM · FANBOYS · Cycle 2 (Compound Sentence Mastery)',
    seriesId: 'prism-writing',
    phase: 'Cycle 2',
    status: 'upcoming',
    dueDate: '2026-11-05T23:59:00',
    totalStudents: 144,
    submittedStudents: 0,
    manifestVersion: '1.1.0',
    baseUrl: 'https://prism-cycle2.nssc-english.workers.dev',
    health: 'healthy',
    lastSyncAt: '1 ชั่วโมงที่แล้ว',
    contractVerified: true,
  },
  {
    id: 'prism-fanboys-post',
    name: 'PRISM · FANBOYS · Post-Test (แบบวัดสัมฤทธิผลปลายภาค)',
    seriesId: 'prism-writing',
    phase: 'Post-test',
    status: 'upcoming',
    dueDate: '2026-11-20T23:59:00',
    totalStudents: 144,
    submittedStudents: 0,
    manifestVersion: '1.0.0',
    baseUrl: 'https://prism-posttest.nssc-english.workers.dev',
    health: 'healthy',
    lastSyncAt: '3 ชั่วโมงที่แล้ว',
    contractVerified: true,
  }
];

export function computeBinaryItems(scores: { TR: number; ME: number; LR: number; GRA: number; CC: number }): BinaryItemResult[] {
  return [
    { id: 'q1', label: 'Item 1: TR Pass', ruleDesc: 'TR ≥ 3 (ตอบโจทย์ใจความหลัก)', passed: scores.TR >= 3, skillRef: 'TR', threshold: 3 },
    { id: 'q2', label: 'Item 2: TR Mastery', ruleDesc: 'TR ≥ 4 (พัฒนาประเด็นลึกซึ้ง)', passed: scores.TR >= 4, skillRef: 'TR', threshold: 4 },
    { id: 'q3', label: 'Item 3: ME Pass', ruleDesc: 'ME ≥ 3 (เครื่องหมาย & ตัวพิมพ์ใหญ่ถูกต้อง)', passed: scores.ME >= 3, skillRef: 'ME', threshold: 3 },
    { id: 'q4', label: 'Item 4: LR Pass', ruleDesc: 'LR ≥ 3 (เลือกใช้คำศัพท์สื่อความเหมาะสม)', passed: scores.LR >= 3, skillRef: 'LR', threshold: 3 },
    { id: 'q5', label: 'Item 5: LR Mastery', ruleDesc: 'LR ≥ 4 (คำศัพท์สละสลวยหลากหลาย)', passed: scores.LR >= 4, skillRef: 'LR', threshold: 4 },
    { id: 'q6', label: 'Item 6: GRA Pass', ruleDesc: 'GRA ≥ 3 (โครงสร้างประโยค Compound ถูกต้อง)', passed: scores.GRA >= 3, skillRef: 'GRA', threshold: 3 },
    { id: 'q7', label: 'Item 7: GRA Mastery', ruleDesc: 'GRA ≥ 4 (ไวยากรณ์ซับซ้อนไร้ข้อผิดพลาด)', passed: scores.GRA >= 4, skillRef: 'GRA', threshold: 4 },
    { id: 'q8', label: 'Item 8: CC Pass', ruleDesc: 'CC ≥ 3 (เชื่อมประโยคด้วย FANBOYS ได้ถูกต้อง)', passed: scores.CC >= 3, skillRef: 'CC', threshold: 3 },
    { id: 'q9', label: 'Item 9: CC Mastery', ruleDesc: 'CC ≥ 4 (การลำดับตรรกะและความต่อเนื่องระดับสูง)', passed: scores.CC >= 4, skillRef: 'CC', threshold: 4 },
  ];
}

export const SKILL_METADATA = {
  TR: {
    name: 'Task Response',
    nameTh: 'การตอบตรงโจทย์ & พัฒนาใจความ',
    color: '#38bdf8', // Sky
    desc: 'ความสามารถในการระบุประเด็น ตอบตรงคำถาม และขยายไอเดียอย่างมีเหตุผล',
    recommendations: {
      high: 'รักษาคุณภาพการให้เหตุผลที่ลึกซึ้ง ยอดเยี่ยมมาก!',
      medium: 'พยายามยกตัวอย่างสนับสนุนข้อโต้แย้งให้ชัดเจนขึ้นอีกนิด',
      low: 'ควรอ่านคำถามให้รอบคอบและจัดลำดับความคิดหลักก่อนเริ่มเขียน'
    }
  },
  ME: {
    name: 'Mechanics',
    nameTh: 'เครื่องหมายวรรคตอน & ตัวสะกด',
    color: '#10b981', // Emerald
    desc: 'การใช้อักษรพิมพ์ใหญ่ (Capitalization), จุลภาค (Comma) หน้า FANBOYS และจุด Full stop',
    recommendations: {
      high: 'เครื่องหมายวรรคตอนและการสะกดคำแม่นยำ ไร้ที่ติ!',
      medium: 'ระวังการใช้ Comma Splice และอย่าลืมใส่ Comma หน้า FANBOYS เสมอ',
      low: 'ทบทวนการขึ้นต้นประโยคด้วยตัวพิมพ์ใหญ่ และตรวจการสะกดคำศัพท์พื้นฐาน'
    }
  },
  LR: {
    name: 'Lexical Resource',
    nameTh: 'คลังคำศัพท์ & การเลือกใช้คำ',
    color: '#818cf8', // Indigo
    desc: 'ความหลากหลาย ความแม่นยำ และความเป็นธรรมชาติในการเลือกใช้คำศัพท์ภาษาอังกฤษ',
    recommendations: {
      high: 'เลือกใช้คำศัพท์ที่หลากหลาย สละสลวย และตรงความหมายมาก',
      medium: 'ลองใช้คำพ้องความหมาย (Synonyms) เพื่อหลีกเลี่ยงการใช้คำเดิมซ้ำๆ',
      low: 'จดจำคำศัพท์กลุ่ม Transition Words และ Conjunctions เพิ่มเติม'
    }
  },
  GRA: {
    name: 'Grammar & Accuracy',
    nameTh: 'ไวยากรณ์ & โครงสร้างประโยค',
    color: '#f59e0b', // Amber
    desc: 'ความถูกต้องของ Tense, Subject-Verb Agreement และโครงสร้างประโยค Compound/Complex',
    recommendations: {
      high: 'โครงสร้างประโยคถูกต้องและกล้าใช้ประโยคซับซ้อนได้อย่างน่าประทับใจ',
      medium: 'ระวังเรื่อง Subject-Verb Agreement เมื่อประธานมีความยาว',
      low: 'เน้นฝึกแต่งประโยคความเดียว (Simple Sentence) ให้คล่องก่อนเชื่อมประโยค'
    }
  },
  CC: {
    name: 'Coherence & Cohesion',
    nameTh: 'ความเชื่อมโยง & ลำดับตรรกะ',
    color: '#ec4899', // Pink
    desc: 'การใช้คำเชื่อมประสาน FANBOYS (For, And, Nor, But, Or, Yet, So) และการจัดย่อหน้า',
    recommendations: {
      high: 'การลำดับความคิดลื่นไหล อ่านง่าย และเชื่อมประโยคได้อย่างมีชั้นเชิง',
      medium: 'เลือกคำเชื่อมให้ตรงกับความสัมพันธ์ของเนื้อหา เช่น Contrast ใช้ But/Yet',
      low: 'ระวังการเขียนประโยคเดี่ยวๆ โดยขาดคำเชื่อมโยงใจความ'
    }
  }
};

export const MOCK_STUDENTS: StudentRecord[] = [
  {
    id: 'std-01',
    studentNumber: 1,
    fullName: 'ด.ช. กฤษณะ วงศ์สวัสดิ์',
    email: '52001.kritsana@student.nssc.ac.th',
    classRoom: 'ม.3/1',
    status: 'SUBMITTED',
    lastActivityAt: '2026-10-20T10:15:00',
    scores: { TR: 5, ME: 5, LR: 5, GRA: 4, CC: 5 },
    rubricTotal: 24,
    totScore: 9,
    level: { rank: 5, name: 'CbKST Grandmaster', xp: 96, maxNextXp: 100 },
    knowledgeState: 'Mastery',
    flag: 'OK',
    growth: 4.8,
    risk: 'ต่ำ',
    devNeeds: [],
    badges: [
      { id: 'b1', title: 'First Draft Hero', desc: 'ส่งงานตรงเวลาเป็นคนแรกๆ ของห้อง', icon: '⚡', unlocked: true, rarity: 'common' },
      { id: 'b2', title: 'Target Sniper', desc: 'ทำคะแนน Task Response ระดับเต็ม (TR=5)', icon: '🎯', unlocked: true, rarity: 'rare' },
      { id: 'b3', title: 'Bridge Builder', desc: 'เชื่อมโยงประโยค FANBOYS สมบูรณ์แบบ (CC=5)', icon: '🌉', unlocked: true, rarity: 'rare' },
      { id: 'b4', title: 'Sharp Eye', desc: 'ไวยากรณ์และเครื่องหมายแม่นยำสูง (ME=5)', icon: '🔍', unlocked: true, rarity: 'epic' },
      { id: 'b5', title: 'Grandmaster Crown', desc: 'ผ่านครบ 9 Binary Items ของ CbKST', icon: '👑', unlocked: true, rarity: 'legendary' },
    ],
    teacherNotes: 'มีความพร้อมระดับสูงมาก แนะนำให้ส่งเสริมเขียน Complex sentences เพิ่มเติม'
  },
  {
    id: 'std-02',
    studentNumber: 2,
    fullName: 'ด.ช. ณภัทร เจริญเกียรติ',
    email: '52002.naphat@student.nssc.ac.th',
    classRoom: 'ม.3/1',
    status: 'SUBMITTED',
    lastActivityAt: '2026-10-20T11:20:00',
    scores: { TR: 4, ME: 4, LR: 4, GRA: 4, CC: 4 },
    rubricTotal: 20,
    totScore: 8,
    level: { rank: 4, name: 'Language Warrior', xp: 82, maxNextXp: 100 },
    knowledgeState: 'Mastery',
    flag: 'OK',
    growth: 3.5,
    risk: 'ต่ำ',
    devNeeds: ['CC'],
    badges: [
      { id: 'b1', title: 'First Draft Hero', desc: 'ส่งงานตรงเวลา', icon: '⚡', unlocked: true, rarity: 'common' },
      { id: 'b2', title: 'Target Sniper', desc: 'TR ≥ 4 ผ่านเกณฑ์ตอบโจทย์ลึกซึ้ง', icon: '🎯', unlocked: true, rarity: 'rare' },
      { id: 'b3', title: 'Bridge Builder', desc: 'เชื่อมประโยคได้ดี', icon: '🌉', unlocked: true, rarity: 'rare' },
      { id: 'b4', title: 'Sharp Eye', desc: 'ตรวจจับเครื่องหมายได้ดี', icon: '🔍', unlocked: true, rarity: 'epic' },
    ]
  },
  {
    id: 'std-03',
    studentNumber: 3,
    fullName: 'ด.ช. ธนดล พัฒนกิจ',
    email: '52003.thanadon@student.nssc.ac.th',
    classRoom: 'ม.3/1',
    status: 'SUBMITTED',
    lastActivityAt: '2026-10-19T14:30:00',
    scores: { TR: 4, ME: 2, LR: 4, GRA: 4, CC: 4 }, // High scores, but dropped ME
    rubricTotal: 18,
    totScore: 7,
    level: { rank: 4, name: 'Language Warrior', xp: 75, maxNextXp: 100 },
    knowledgeState: 'Language Dev',
    flag: 'Careless', // Anomalous careless slip
    growth: 2.1,
    risk: 'ปานกลาง',
    devNeeds: ['ME'],
    badges: [
      { id: 'b1', title: 'First Draft Hero', desc: 'ส่งงานตรงเวลา', icon: '⚡', unlocked: true, rarity: 'common' },
      { id: 'b2', title: 'Target Sniper', desc: 'TR ผ่านฉลุย', icon: '🎯', unlocked: true, rarity: 'rare' },
      { id: 'b3', title: 'Bridge Builder', desc: 'ความสอดคล้องดีเยี่ยม', icon: '🌉', unlocked: true, rarity: 'rare' },
    ],
    teacherNotes: 'เขียนเก่งมาก ลำดับความคิดเยี่ยม แต่ตกม้าตายเรื่องลืมจุด full stop และ comma หน้า but'
  },
  {
    id: 'std-04',
    studentNumber: 4,
    fullName: 'ด.ญ. ปรียาภรณ์ ศรีสุวรรณ',
    email: '52004.preeyaporn@student.nssc.ac.th',
    classRoom: 'ม.3/1',
    status: 'SUBMITTED',
    lastActivityAt: '2026-10-19T16:45:00',
    scores: { TR: 4, ME: 3, LR: 3, GRA: 3, CC: 4 },
    rubricTotal: 17,
    totScore: 6,
    level: { rank: 3, name: 'Coherence Crafter', xp: 68, maxNextXp: 100 },
    knowledgeState: 'Structure OK',
    flag: 'OK',
    growth: 3.0,
    risk: 'ต่ำ',
    devNeeds: ['LR', 'GRA'],
    badges: [
      { id: 'b1', title: 'First Draft Hero', desc: 'ส่งงานตรงเวลา', icon: '⚡', unlocked: true, rarity: 'common' },
      { id: 'b3', title: 'Bridge Builder', desc: 'เชื่อมโยงประโยค FANBOYS ดี', icon: '🌉', unlocked: true, rarity: 'rare' },
    ]
  },
  {
    id: 'std-05',
    studentNumber: 5,
    fullName: 'ด.ช. พงศกร มิ่งขวัญ',
    email: '52005.pongsakorn@student.nssc.ac.th',
    classRoom: 'ม.3/1',
    status: 'SUBMITTED',
    lastActivityAt: '2026-10-18T19:10:00',
    scores: { TR: 2, ME: 3, LR: 2, GRA: 2, CC: 3 }, // Low rubric, but passed items
    rubricTotal: 12,
    totScore: 5,
    level: { rank: 3, name: 'Coherence Crafter', xp: 52, maxNextXp: 100 },
    knowledgeState: 'Beginner',
    flag: 'Lucky', // Lucky guessing on binary checks
    growth: 1.2,
    risk: 'สูง',
    devNeeds: ['TR', 'LR', 'GRA'],
    badges: [
      { id: 'b1', title: 'First Draft Hero', desc: 'ส่งงานครบถ้วน', icon: '⚡', unlocked: true, rarity: 'common' },
    ],
    teacherNotes: 'ผ่านเกณฑ์โครงสร้างบางส่วน แต่งงเรื่องคำศัพท์และ Tense ควรนัดสอนเสริมกลุ่มย่อย'
  },
  {
    id: 'std-06',
    studentNumber: 6,
    fullName: 'ด.ญ. รมิดา เทพประทาน',
    email: '52006.ramida@student.nssc.ac.th',
    classRoom: 'ม.3/1',
    status: 'SUBMITTED',
    lastActivityAt: '2026-10-20T08:05:00',
    scores: { TR: 5, ME: 4, LR: 4, GRA: 4, CC: 4 },
    rubricTotal: 21,
    totScore: 8,
    level: { rank: 4, name: 'Language Warrior', xp: 85, maxNextXp: 100 },
    knowledgeState: 'Mastery',
    flag: 'OK',
    growth: 4.1,
    risk: 'ต่ำ',
    devNeeds: ['CC'],
    badges: [
      { id: 'b1', title: 'First Draft Hero', desc: 'ส่งงานตรงเวลา', icon: '⚡', unlocked: true, rarity: 'common' },
      { id: 'b2', title: 'Target Sniper', desc: 'TR=5 ตอบคำถามชัดเจน', icon: '🎯', unlocked: true, rarity: 'rare' },
      { id: 'b4', title: 'Sharp Eye', desc: 'ความถูกต้องแม่นยำสูง', icon: '🔍', unlocked: true, rarity: 'epic' },
    ]
  },
  {
    id: 'std-07',
    studentNumber: 7,
    fullName: 'ด.ช. วรเมธ กลิ่นประทุม',
    email: '52007.worameth@student.nssc.ac.th',
    classRoom: 'ม.3/1',
    status: 'SUBMITTED',
    lastActivityAt: '2026-10-19T21:15:00',
    scores: { TR: 3, ME: 3, LR: 2, GRA: 2, CC: 2 },
    rubricTotal: 12,
    totScore: 3,
    level: { rank: 2, name: 'Structure Architect', xp: 35, maxNextXp: 100 },
    knowledgeState: 'Beginner',
    flag: 'OK',
    growth: 1.5,
    risk: 'สูง',
    devNeeds: ['LR', 'GRA', 'CC'],
    badges: [
      { id: 'b1', title: 'First Draft Hero', desc: 'ส่งงานแรกเสร็จสิ้น', icon: '⚡', unlocked: true, rarity: 'common' },
    ]
  },
  {
    id: 'std-08',
    studentNumber: 8,
    fullName: 'ด.ญ. ศศิธร รัตนเวช',
    email: '52008.sasithorn@student.nssc.ac.th',
    classRoom: 'ม.3/1',
    status: 'SUBMITTED',
    lastActivityAt: '2026-10-20T09:40:00',
    scores: { TR: 4, ME: 4, LR: 3, GRA: 3, CC: 4 },
    rubricTotal: 18,
    totScore: 7,
    level: { rank: 4, name: 'Language Warrior', xp: 72, maxNextXp: 100 },
    knowledgeState: 'Structure OK',
    flag: 'OK',
    growth: 2.8,
    risk: 'ต่ำ',
    devNeeds: ['LR', 'GRA'],
    badges: [
      { id: 'b1', title: 'First Draft Hero', desc: 'ส่งงานครบถ้วน', icon: '⚡', unlocked: true, rarity: 'common' },
      { id: 'b2', title: 'Target Sniper', desc: 'TR ดีเยี่ยม', icon: '🎯', unlocked: true, rarity: 'rare' },
      { id: 'b3', title: 'Bridge Builder', desc: 'เชื่อมประโยคถูกต้อง', icon: '🌉', unlocked: true, rarity: 'rare' },
    ]
  },
  {
    id: 'std-09',
    studentNumber: 9,
    fullName: 'ด.ช. อิทธิพัทธ์ บวรเกียรติ',
    email: '52009.itthiphat@student.nssc.ac.th',
    classRoom: 'ม.3/1',
    status: 'IN_PROGRESS',
    lastActivityAt: '2026-10-20T12:05:00',
    scores: { TR: 2, ME: 2, LR: 2, GRA: 1, CC: 2 },
    rubricTotal: 9,
    totScore: 1,
    level: { rank: 1, name: 'Novice Draftsman', xp: 15, maxNextXp: 100 },
    knowledgeState: 'Beginner',
    flag: 'OK',
    growth: 0.5,
    risk: 'สูง',
    devNeeds: ['TR', 'ME', 'LR', 'GRA', 'CC'],
    badges: [],
    teacherNotes: 'ทำค้างไว้ที่ Part 2 แจ้งนักเรียนให้เข้ามาทำต่อก่อนหมดกำหนดส่ง'
  },
  {
    id: 'std-10',
    studentNumber: 10,
    fullName: 'ด.ญ. อมรรัตน์ สินชัย',
    email: '52010.amornrat@student.nssc.ac.th',
    classRoom: 'ม.3/1',
    status: 'TODO',
    lastActivityAt: '2026-10-15T09:00:00',
    scores: { TR: 0, ME: 0, LR: 0, GRA: 0, CC: 0 },
    rubricTotal: 0,
    totScore: 0,
    level: { rank: 1, name: 'Novice Draftsman', xp: 0, maxNextXp: 100 },
    knowledgeState: 'Beginner',
    flag: 'OK',
    growth: 0,
    risk: 'ไม่มีข้อมูล',
    devNeeds: ['TR', 'ME', 'LR', 'GRA', 'CC'],
    badges: [],
    teacherNotes: 'ยังไม่ได้เข้าเริ่มทำแบบฝึกหัด ส่งข้อความเตือนทางระบบแล้ว'
  },
  // Adding more students for ม.3/1 to complete a realistic roster
  {
    id: 'std-11',
    studentNumber: 11,
    fullName: 'ด.ช. ภานุวัฒน์ แซ่ลี้',
    email: '52011.panuwat@student.nssc.ac.th',
    classRoom: 'ม.3/1',
    status: 'SUBMITTED',
    lastActivityAt: '2026-10-20T10:30:00',
    scores: { TR: 4, ME: 4, LR: 3, GRA: 4, CC: 4 },
    rubricTotal: 19,
    totScore: 7,
    level: { rank: 4, name: 'Language Warrior', xp: 76, maxNextXp: 100 },
    knowledgeState: 'Mastery',
    flag: 'OK',
    growth: 3.2,
    risk: 'ต่ำ',
    devNeeds: ['LR'],
    badges: [
      { id: 'b1', title: 'First Draft Hero', desc: 'ส่งตรงเวลา', icon: '⚡', unlocked: true, rarity: 'common' },
      { id: 'b2', title: 'Target Sniper', desc: 'TR=4', icon: '🎯', unlocked: true, rarity: 'rare' },
    ]
  },
  {
    id: 'std-12',
    studentNumber: 12,
    fullName: 'ด.ญ. ชนัญชิดา ชัยชนะ',
    email: '52012.chananchida@student.nssc.ac.th',
    classRoom: 'ม.3/1',
    status: 'SUBMITTED',
    lastActivityAt: '2026-10-19T15:20:00',
    scores: { TR: 3, ME: 3, LR: 4, GRA: 2, CC: 4 },
    rubricTotal: 16,
    totScore: 6,
    level: { rank: 3, name: 'Coherence Crafter', xp: 65, maxNextXp: 100 },
    knowledgeState: 'Language Dev',
    flag: 'OK',
    growth: 2.7,
    risk: 'ปานกลาง',
    devNeeds: ['GRA'],
    badges: [
      { id: 'b1', title: 'First Draft Hero', desc: 'ส่งตรงเวลา', icon: '⚡', unlocked: true, rarity: 'common' },
      { id: 'b3', title: 'Bridge Builder', desc: 'CC=4', icon: '🌉', unlocked: true, rarity: 'rare' },
    ]
  },
  // Students for ม.3/2
  {
    id: 'std-21',
    studentNumber: 1,
    fullName: 'ด.ช. กิตติศักดิ์ เจริญพร',
    email: '52021.kittisak@student.nssc.ac.th',
    classRoom: 'ม.3/2',
    status: 'SUBMITTED',
    lastActivityAt: '2026-10-20T09:15:00',
    scores: { TR: 4, ME: 4, LR: 4, GRA: 3, CC: 4 },
    rubricTotal: 19,
    totScore: 7,
    level: { rank: 4, name: 'Language Warrior', xp: 78, maxNextXp: 100 },
    knowledgeState: 'Mastery',
    flag: 'OK',
    growth: 3.4,
    risk: 'ต่ำ',
    devNeeds: ['GRA'],
    badges: [{ id: 'b1', title: 'First Draft Hero', desc: 'ส่งตรงเวลา', icon: '⚡', unlocked: true, rarity: 'common' }]
  },
  {
    id: 'std-22',
    studentNumber: 2,
    fullName: 'ด.ญ. สุภัสสรา มีสุข',
    email: '52022.supatsara@student.nssc.ac.th',
    classRoom: 'ม.3/2',
    status: 'SUBMITTED',
    lastActivityAt: '2026-10-20T11:00:00',
    scores: { TR: 5, ME: 5, LR: 4, GRA: 5, CC: 5 },
    rubricTotal: 24,
    totScore: 9,
    level: { rank: 5, name: 'CbKST Grandmaster', xp: 98, maxNextXp: 100 },
    knowledgeState: 'Mastery',
    flag: 'OK',
    growth: 4.9,
    risk: 'ต่ำ',
    devNeeds: [],
    badges: [
      { id: 'b1', title: 'First Draft Hero', desc: 'ส่งตรงเวลา', icon: '⚡', unlocked: true, rarity: 'common' },
      { id: 'b5', title: 'Grandmaster Crown', desc: 'คะแนนเต็มทุกมิติ', icon: '👑', unlocked: true, rarity: 'legendary' }
    ]
  },
  {
    id: 'std-23',
    studentNumber: 3,
    fullName: 'ด.ช. ธีรภัทร ชาญวิทย์',
    email: '52023.theeraphat@student.nssc.ac.th',
    classRoom: 'ม.3/2',
    status: 'SUBMITTED',
    lastActivityAt: '2026-10-18T13:40:00',
    scores: { TR: 2, ME: 2, LR: 2, GRA: 2, CC: 2 },
    rubricTotal: 10,
    totScore: 0,
    level: { rank: 1, name: 'Novice Draftsman', xp: 10, maxNextXp: 100 },
    knowledgeState: 'Beginner',
    flag: 'OK',
    growth: 0.8,
    risk: 'สูง',
    devNeeds: ['TR', 'ME', 'LR', 'GRA', 'CC'],
    badges: []
  }
];

export const MOCK_SYNC_LOGS: SyncLogEntry[] = [
  {
    id: 'sync-101',
    exerciseId: 'prism-fanboys-pretest',
    timestamp: '2026-10-20 14:20:04',
    durationMs: 412,
    rowsAffected: 144,
    status: 'SUCCESS',
    details: 'Incremental sync verified: 144 submissions upserted, HMAC signature valid'
  },
  {
    id: 'sync-100',
    exerciseId: 'prism-fanboys-c1',
    timestamp: '2026-10-20 14:15:10',
    durationMs: 388,
    rowsAffected: 98,
    status: 'SUCCESS',
    details: 'Pull completed: 98 student attempts retrieved from Cloudflare Worker'
  },
  {
    id: 'sync-099',
    exerciseId: 'prism-fanboys-c2',
    timestamp: '2026-10-20 13:00:22',
    durationMs: 250,
    rowsAffected: 0,
    status: 'SUCCESS',
    details: 'No new attempts since last cursor (idempotent skip)'
  },
  {
    id: 'sync-098',
    exerciseId: 'prism-fanboys-pretest',
    timestamp: '2026-10-20 12:45:00',
    durationMs: 820,
    rowsAffected: 12,
    status: 'WARNING',
    details: '2 rows marked inconsistent (score exceeds manifest max, flagged in audit log)'
  }
];

export const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-201',
    actor: 'teacher@nssc.ac.th (อาจารย์สมเกียรติ)',
    action: 'EXPORT_CSV',
    target: 'class:ม.3/1 | exercise:prism-fanboys-pretest',
    timestamp: '2026-10-20 14:02:15',
    ip: '172.68.24.11'
  },
  {
    id: 'aud-200',
    actor: 'dev_admin (System Cron)',
    action: 'AUTOMATED_SYNC',
    target: 'exercise:prism-fanboys-pretest',
    timestamp: '2026-10-20 14:00:00',
    ip: 'Cloudflare Worker Scheduled'
  },
  {
    id: 'aud-199',
    actor: 'admin@nssc.ac.th (Dev/Admin)',
    action: 'REGISTER_EXERCISE',
    target: 'https://prism-cycle2.nssc-english.workers.dev',
    timestamp: '2026-10-20 11:30:45',
    ip: '1.46.128.92'
  },
  {
    id: 'aud-198',
    actor: 'admin@nssc.ac.th (Dev/Admin)',
    action: 'ROTATE_SECRET',
    target: 'exercise:prism-fanboys-c1',
    timestamp: '2026-10-20 10:12:00',
    ip: '1.46.128.92'
  }
];
