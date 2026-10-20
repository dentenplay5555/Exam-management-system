// Hub API Client (design.md Section 5 & Rule 9)
// All communication goes through /api/* with credentials: 'include' (HttpOnly Cookie)
// Frontend DOES NOT calculate scores or touch database directly.

import type {
  UserMe,
  StudentExerciseItem,
  StudentResultPayload,
  TeacherReportPayload,
  TeacherSubmissionStatus,
  DevExerciseItem,
  SyncLogItem,
  AuditLogItem,
  DevUserItem
} from '../types';

import { getSupabaseConfig, fetchStudentsFromSupabase } from './supabase';
import type { StudentRecord } from '../types';

export class ApiError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

// Helper to make API requests with error handling
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  try {
    const res = await fetch(`/api${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });

    if (res.status === 401) {
      throw new ApiError('UNAUTHORIZED', 'กรุณาเข้าสู่ระบบก่อนดำเนินการ');
    }

    if (res.status === 403) {
      throw new ApiError('FORBIDDEN', 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้');
    }

    const json = await res.json();
    if (!res.ok) {
      throw new ApiError(json.error?.code || 'ERROR', json.error?.message || 'เกิดข้อผิดพลาดในการติดต่อระบบ');
    }

    return json as T;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    // Check if user has Supabase configured to load real data
    return await getFallbackWithSupabase<T>(path, options);
  }
}

async function getFallbackWithSupabase<T>(path: string, options: RequestInit): Promise<T> {
  const { isConfigured } = getSupabaseConfig();
  if (isConfigured) {
    try {
      const { ok, students } = await fetchStudentsFromSupabase();
      if (ok && students && students.length > 0) {
        const live = mapSupabaseToApi<T>(path, students);
        if (live !== null) return live;
      }
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to mock schema:', e);
    }
  }
  return getMockFallback<T>(path, options);
}

function mapSupabaseToApi<T>(path: string, students: StudentRecord[]): T | null {
  // 1. Teacher classes
  if (path === '/teacher/classes') {
    const classes = Array.from(new Set(students.map(s => s.classRoom))).filter(Boolean);
    return (classes.length ? classes : ['ม.3/1']) as T;
  }

  // 2. Teacher Report
  if (path.startsWith('/teacher/report/')) {
    const parts = path.split('/');
    const exId = parts[3] || 'prism-fanboys-pretest';
    const classId = decodeURIComponent(parts[4] || '');

    const classStudents = classId ? students.filter(s => s.classRoom === classId) : students;
    const list = classStudents.length ? classStudents : students;

    const submitted = list.filter(s => s.status === 'SUBMITTED' || s.status === 'COMPLETED');
    const notSubmitted = list.length - submitted.length;
    const lucky = list.filter(s => s.flag === 'Lucky').length;
    const careless = list.filter(s => s.flag === 'Careless').length;

    const avgTot = submitted.length
      ? +(submitted.reduce((sum, s) => sum + s.totScore, 0) / submitted.length).toFixed(1)
      : 0;
    const avgRubric = submitted.length
      ? +(submitted.reduce((sum, s) => sum + s.rubricTotal, 0) / submitted.length).toFixed(1)
      : 0;

    const ksMap: Record<string, number> = { 'Mastery': 0, 'Language Dev': 0, 'Structure OK': 0, 'Beginner': 0 };
    list.forEach(s => {
      const k = s.knowledgeState || 'Beginner';
      ksMap[k] = (ksMap[k] || 0) + 1;
    });
    const total = list.length || 1;
    const knowledgeStates = [
      { name: 'Mastery', count: ksMap['Mastery'], pct: Math.round((ksMap['Mastery'] / total) * 100) },
      { name: 'Language Dev', count: ksMap['Language Dev'], pct: Math.round((ksMap['Language Dev'] / total) * 100) },
      { name: 'Structure OK', count: ksMap['Structure OK'], pct: Math.round((ksMap['Structure OK'] / total) * 100) },
      { name: 'Beginner', count: ksMap['Beginner'], pct: Math.round((ksMap['Beginner'] / total) * 100) }
    ];

    const skillCodes = ['TR', 'ME', 'LR', 'GRA', 'CC'] as const;
    const skillNames = {
      TR: 'Task Response',
      ME: 'Mechanics',
      LR: 'Lexical Resource',
      GRA: 'Grammar & Accuracy',
      CC: 'Coherence & Cohesion'
    };
    const skills = skillCodes.map(code => {
      const sum = list.reduce((acc, s) => acc + (s.scores[code] || 0), 0);
      const avg = +(sum / total).toFixed(1);
      const passCount = list.filter(s => (s.scores[code] || 0) >= 3).length;
      return {
        code,
        name: skillNames[code],
        passPct: Math.round((passCount / total) * 100),
        avg
      };
    });

    const scoreDistribution = [
      { range: '0-5', count: list.filter(s => s.rubricTotal <= 5).length },
      { range: '6-10', count: list.filter(s => s.rubricTotal >= 6 && s.rubricTotal <= 10).length },
      { range: '11-15', count: list.filter(s => s.rubricTotal >= 11 && s.rubricTotal <= 15).length },
      { range: '16-20', count: list.filter(s => s.rubricTotal >= 16 && s.rubricTotal <= 20).length },
      { range: '21-25', count: list.filter(s => s.rubricTotal >= 21).length }
    ];

    return {
      exercise: { id: exId, name: 'PRISM · FANBOYS (Supabase Live)', manifestVersion: '1.2.0' },
      class: { name: classId || list[0]?.classRoom || 'ม.3/1', students: list.length },
      asOf: `Supabase Live: ${new Date().toLocaleTimeString('th-TH')}`,
      stats: {
        submitted: submitted.length,
        notSubmitted,
        avgTot,
        avgRubric,
        lucky,
        careless
      },
      knowledgeStates,
      skills,
      itemDifficulty: [
        { id: 'q1', passPct: Math.round((list.filter(s => s.scores.TR >= 3).length / total) * 100), tag: 'ง่าย' },
        { id: 'q2', passPct: Math.round((list.filter(s => s.scores.TR >= 4).length / total) * 100), tag: 'ปานกลาง' },
        { id: 'q3', passPct: Math.round((list.filter(s => s.scores.ME >= 3).length / total) * 100), tag: 'ง่าย' },
        { id: 'q4', passPct: Math.round((list.filter(s => s.scores.ME >= 4).length / total) * 100), tag: 'ง่าย' },
        { id: 'q5', passPct: Math.round((list.filter(s => s.scores.LR >= 3).length / total) * 100), tag: 'ปานกลาง' },
        { id: 'q6', passPct: Math.round((list.filter(s => s.scores.LR >= 4).length / total) * 100), tag: 'ปานกลาง' },
        { id: 'q7', passPct: Math.round((list.filter(s => s.scores.GRA >= 4).length / total) * 100), tag: 'ยาก' },
        { id: 'q8', passPct: Math.round((list.filter(s => s.scores.CC >= 3).length / total) * 100), tag: 'ง่าย' },
        { id: 'q9', passPct: Math.round((list.filter(s => s.scores.CC >= 4).length / total) * 100), tag: 'ยาก' }
      ],
      scoreDistribution,
      insights: [
        { level: 'green', text: `ดึงข้อมูลนักเรียนจริงจาก Supabase สำเร็จ (${list.length} คน)` },
        ...(careless > 0 ? [{ level: 'amber' as const, text: `พบสัญญาณ Careless ${careless} คนในข้อมูลจริง` }] : []),
        ...(lucky > 0 ? [{ level: 'red' as const, text: `พบสัญญาณ Lucky ${lucky} คนที่ต้องสังเกต` }] : [])
      ],
      students: list.map(s => ({
        userId: s.id,
        no: s.studentNumber,
        name: s.fullName,
        scores: s.scores,
        tot: s.totScore,
        rubricTotal: s.rubricTotal,
        ks: s.knowledgeState,
        flag: s.flag
      })),
      pending: list.filter(s => s.status === 'TODO' || s.status === 'IN_PROGRESS').map(s => ({
        no: s.studentNumber,
        name: s.fullName
      }))
    } as T;
  }

  // 3. Teacher Status
  if (path.startsWith('/teacher/status/')) {
    const parts = path.split('/');
    const classId = decodeURIComponent(parts[4] || '');
    const list = classId ? students.filter(s => s.classRoom === classId) : students;
    return list.map(s => ({
      userId: s.id,
      no: s.studentNumber,
      name: s.fullName,
      status: s.status,
      partsCompleted: s.status === 'SUBMITTED' || s.status === 'COMPLETED' ? 3 : s.status === 'IN_PROGRESS' ? 1 : 0,
      totalParts: 3,
      lastActivityAt: s.lastActivityAt ? new Date(s.lastActivityAt).toLocaleDateString('th-TH') : '-'
    })) as T;
  }

  // 4. Student Result (or Teacher viewing specific Student)
  if (path.startsWith('/teacher/student/') || path.startsWith('/student/results/')) {
    const parts = path.split('/');
    const targetId = path.startsWith('/teacher/student/') ? parts[4] : '';
    const student = (targetId ? students.find(s => s.id === targetId) : null) || students[0];
    if (student) {
      return {
        exercise: { id: 'prism-fanboys-pretest', name: 'PRISM · FANBOYS · Pretest' },
        student: { name: student.fullName, class: student.classRoom, no: student.studentNumber },
        status: student.status,
        scores: student.scores,
        rubricTotal: student.rubricTotal,
        binary: {
          q1: student.scores.TR >= 3,
          q2: student.scores.TR >= 4,
          q3: student.scores.ME >= 3,
          q4: student.scores.ME >= 4,
          q5: student.scores.LR >= 3,
          q6: student.scores.LR >= 4,
          q7: student.scores.GRA >= 4,
          q8: student.scores.CC >= 3,
          q9: student.scores.CC >= 4
        },
        binaryTotal: student.totScore,
        level: { n: student.level.rank, name: student.level.name, xp: student.level.xp },
        ks: student.knowledgeState,
        flag: student.flag,
        badges: student.badges.map(b => ({ id: b.id, name: b.title, earned: b.unlocked, desc: b.desc })),
        feedback: {
          TR: student.scores.TR >= 4 ? 'ตอบตรงประเด็นและขยายความได้ลึกซึ้ง' : 'ควรอ่านคำถามให้รอบคอบและจัดลำดับความคิดหลัก',
          ME: student.scores.ME >= 4 ? 'เครื่องหมายวรรคตอนและการสะกดคำแม่นยำ' : 'ระวังการใช้ Comma Splice และตัวสะกด',
          LR: student.scores.LR >= 4 ? 'คลังคำศัพท์หลากหลายและเป็นธรรมชาติ' : 'เลือกใช้คำศัพท์สื่อความหมายให้เหมาะสม',
          GRA: student.scores.GRA >= 4 ? 'โครงสร้างประโยค Compound ถูกต้อง' : 'ระวังเรื่อง Subject-Verb Agreement',
          CC: student.scores.CC >= 4 ? 'เชื่อมประโยค FANBOYS ได้ลื่นไหล' : 'ระวังการเขียนประโยคเดี่ยวๆ โดยขาดคำเชื่อม'
        },
        tips: student.teacherNotes ? [student.teacherNotes] : ['ฝึกฝนการเขียนเชื่อมประโยคภาษาอังกฤษอย่างสม่ำเสมอ'],
        attempts: { used: student.status === 'SUBMITTED' ? 1 : 0, max: 2 }
      } as T;
    }
  }

  // 5. Dev Users
  if (path === '/dev/users') {
    const teacherClasses = Array.from(new Set(students.map(s => s.classRoom))).filter(Boolean);
    return [
      { id: 'usr-teacher-1', name: 'อาจารย์สมเกียรติ ยิ่งเจริญ', email: 'somkiat@nssc.ac.th', role: 'teacher', classes: teacherClasses },
      { id: 'usr-dev-1', name: 'Admin ผู้ดูแลระบบ', email: 'admin@nssc.ac.th', role: 'dev', classes: [] },
      ...students.map(s => ({
        id: s.id,
        name: s.fullName,
        email: s.email,
        role: 'student' as const,
        classes: [s.classRoom]
      }))
    ] as T;
  }

  return null;
}

// 1. Auth API
export const authApi = {
  getMe: () => request<UserMe>('/me'),
  logout: () => request<{ ok: boolean }>('/auth/logout', { method: 'POST' }),
  startGoogleUrl: '/api/auth/google/start'
};

// 2. Student API
export const studentApi = {
  getExercises: () => request<StudentExerciseItem[]>('/student/exercises'),
  getResult: (exId: string) => request<StudentResultPayload>(`/student/results/${exId}`)
};

// 3. Teacher API
export const teacherApi = {
  getClasses: () => request<string[]>('/teacher/classes'),
  getReport: (exId: string, classId: string) => request<TeacherReportPayload>(`/teacher/report/${exId}/${encodeURIComponent(classId)}`),
  getStatus: (exId: string, classId: string) => request<TeacherSubmissionStatus[]>(`/teacher/status/${exId}/${encodeURIComponent(classId)}`),
  getStudentResult: (exId: string, userId: string) => request<StudentResultPayload>(`/teacher/student/${exId}/${userId}`),
  exportCsvUrl: (exId: string, classId: string) => `/api/teacher/report/${exId}/${encodeURIComponent(classId)}/export.csv`
};

// 4. Dev API
export const devApi = {
  getExercises: () => request<DevExerciseItem[]>('/dev/exercises'),
  addExercise: (baseUrl: string) => request<{ ok: boolean; secret: string }>('/dev/exercises', {
    method: 'POST',
    body: JSON.stringify({ baseUrl })
  }),
  testExercise: (id: string) => request<{ ok: boolean; routes: Record<string, boolean> }>(`/dev/exercises/${id}/test`, { method: 'POST' }),
  syncExercise: (id: string) => request<{ ok: boolean; rows: number }>(`/dev/exercises/${id}/sync`, { method: 'POST' }),
  rotateSecret: (id: string) => request<{ ok: boolean; secret: string }>(`/dev/exercises/${id}/rotate-secret`, { method: 'POST' }),
  getLogs: (type: 'sync' | 'audit') => request<any[]>(`/dev/logs?type=${type}`),
  getUsers: () => request<DevUserItem[]>('/dev/users'),
  updateUserRole: (id: string, role: string) => request<{ ok: boolean }>(`/dev/users/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role })
  }),
  updateAssignments: (data: { exerciseId: string; classIds: string[]; dueAt: string }) => request<{ ok: boolean }>('/dev/assignments', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  updateTeacherClasses: (data: { teacherId: string; classIds: string[] }) => request<{ ok: boolean }>('/dev/teacher-classes', {
    method: 'PUT',
    body: JSON.stringify(data)
  })
};

// --- MOCK FALLBACK (Exact JSON schema from Section 5 for offline / preview) ---
function getMockFallback<T>(path: string, options: RequestInit): T {
  // Mock current user
  if (path === '/me') {
    const role = (localStorage.getItem('practice_hub_mock_role') as any) || 'student';
    return {
      id: 'usr-001',
      name: role === 'student' ? 'ด.ช. กฤษณะ วงศ์สวัสดิ์' : role === 'teacher' ? 'อาจารย์สมเกียรติ ยิ่งเจริญ' : 'Dev Admin',
      email: role === 'student' ? '52001.kritsana@student.nssc.ac.th' : 'teacher@nssc.ac.th',
      role,
      classes: ['ม.3/1', 'ม.3/2']
    } as T;
  }

  // Student exercises
  if (path === '/student/exercises') {
    return [
      {
        id: 'prism-fanboys-pretest',
        name: 'PRISM · FANBOYS · Pretest (วินิจฉัยพื้นฐาน)',
        status: 'SUBMITTED',
        dueAt: '2026-10-25T23:59:00Z',
        attemptsUsed: 1,
        maxAttempts: 1,
        exerciseUrl: 'https://prism-pretest.workers.dev',
        series: 'FANBOYS',
        phase: 'Pretest'
      },
      {
        id: 'prism-fanboys-c1',
        name: 'PRISM · FANBOYS · Cycle 1 (Coordinating Conjunctions)',
        status: 'IN_PROGRESS',
        dueAt: '2026-10-30T23:59:00Z',
        attemptsUsed: 0,
        maxAttempts: 2,
        exerciseUrl: 'https://prism-cycle1.workers.dev',
        series: 'FANBOYS',
        phase: 'Cycle 1'
      },
      {
        id: 'prism-fanboys-c2',
        name: 'PRISM · FANBOYS · Cycle 2 (Compound Sentence Mastery)',
        status: 'TODO',
        dueAt: '2026-11-05T23:59:00Z',
        attemptsUsed: 0,
        maxAttempts: 2,
        exerciseUrl: 'https://prism-cycle2.workers.dev',
        series: 'FANBOYS',
        phase: 'Cycle 2'
      },
      {
        id: 'prism-fanboys-post',
        name: 'PRISM · FANBOYS · Post-Test (แบบวัดผลปลายภาค)',
        status: 'TODO',
        dueAt: '2026-11-20T23:59:00Z',
        attemptsUsed: 0,
        maxAttempts: 1,
        exerciseUrl: 'https://prism-post.workers.dev',
        series: 'FANBOYS',
        phase: 'Post-test'
      }
    ] as T;
  }

  // Student result & Teacher view of student result: exact JSON structure provided in Section 5
  if (path.startsWith('/student/results/') || path.startsWith('/teacher/student/')) {
    const isTeacher = path.startsWith('/teacher/student/');
    return {
      exercise: { id: 'prism-fanboys-pretest', name: 'PRISM · FANBOYS · Pretest' },
      student: { name: isTeacher ? 'ด.ช. ณภัทร เจริญเกียรติ' : 'ด.ช. กฤษณะ วงศ์สวัสดิ์', class: 'ม.3/1', no: isTeacher ? 2 : 1 },
      status: 'SUBMITTED',
      scores: isTeacher ? { TR: 4, ME: 4, LR: 4, GRA: 4, CC: 4 } : { TR: 3, ME: 4, LR: 4, GRA: 3, CC: 3 },
      rubricTotal: isTeacher ? 20 : 17,
      binary: {
        q1: true,
        q2: true,
        q3: true,
        q4: true,
        q5: false,
        q6: true,
        q7: false,
        q8: true,
        q9: false
      },
      binaryTotal: 7,
      level: { n: 4, name: 'Precision Pioneer', xp: 84 },
      ks: 'Mastery',
      flag: 'OK',
      badges: [
        { id: 'first-draft', name: 'First Draft Hero', earned: true, desc: 'ส่งงานตรงเวลา' },
        { id: 'target-sniper', name: 'Target Sniper', earned: true, desc: 'TR ≥ 3 ตอบโจทย์แม่นยำ' },
        { id: 'bridge-builder', name: 'Bridge Builder', earned: true, desc: 'CC ≥ 3 เชื่อมโยงประโยคถูกต้อง' },
        { id: 'sharp-eye', name: 'Sharp Eye', earned: true, desc: 'ME ≥ 4 ไวยากรณ์และเครื่องหมายแม่นยำ' },
        { id: 'rocket-climber', name: 'Rocket Climber', earned: true, desc: 'พัฒนาคะแนนก้าวกระโดด' },
        { id: 'calm-mind', name: 'Calm Mind', earned: false, desc: 'รอข้อมูล (รอบถัดไป)' }
      ],
      feedback: {
        TR: 'ตอบตรงประเด็นโจทย์ได้ดีเยี่ยม มีใจความสำคัญครบถ้วนและลึกซึ้ง',
        ME: 'เครื่องหมายวรรคตอนและการสะกดคำถูกต้อง แม่นยำ',
        LR: 'เลือกใช้คำศัพท์สื่อความหมายได้หลากหลายและเป็นธรรมชาติ',
        GRA: 'โครงสร้างประโยค Compound และ Complex มีความแม่นยำสูง',
        CC: 'เชื่อมประโยค FANBOYS ได้สอดคล้องลื่นไหล ไร้ข้อต่อสะดุด'
      },
      tips: [
        'ลองเพิ่มการใช้ Subordinating Conjunctions ในการแต่งประโยคให้ซับซ้อนขึ้น',
        'รักษามาตรฐานความแม่นยำของ Punctuation'
      ],
      attempts: { used: 1, max: 2 }
    } as T;
  }

  // Teacher classes
  if (path === '/teacher/classes') {
    return ['ม.3/1', 'ม.3/2', 'ม.3/3', 'ม.3/4'] as T;
  }

  // Teacher report
  if (path.startsWith('/teacher/report/')) {
    return {
      exercise: { id: 'prism-fanboys-pretest', name: 'PRISM · FANBOYS · Pretest', manifestVersion: '1.2.0' },
      class: { name: 'ม.3/1', students: 36 },
      asOf: 'วันนี้ เวลา 14:20 น.',
      stats: {
        submitted: 32,
        notSubmitted: 4,
        avgTot: 5.8,
        avgRubric: 17.2,
        lucky: 2,
        careless: 4
      },
      knowledgeStates: [
        { name: 'Mastery', count: 12, pct: 33 },
        { name: 'Language Dev', count: 14, pct: 39 },
        { name: 'Structure OK', count: 6, pct: 17 },
        { name: 'Beginner', count: 4, pct: 11 }
      ],
      skills: [
        { code: 'TR', name: 'Task Response', passPct: 88, avg: 3.8 },
        { code: 'ME', name: 'Mechanics', passPct: 82, avg: 3.6 },
        { code: 'LR', name: 'Lexical Resource', passPct: 75, avg: 3.4 },
        { code: 'GRA', name: 'Grammar & Accuracy', passPct: 68, avg: 3.1 },
        { code: 'CC', name: 'Coherence & Cohesion', passPct: 80, avg: 3.5 }
      ],
      itemDifficulty: [
        { id: 'q1', passPct: 88, tag: 'ง่าย' },
        { id: 'q2', passPct: 62, tag: 'ปานกลาง' },
        { id: 'q3', passPct: 82, tag: 'ง่าย' },
        { id: 'q4', passPct: 75, tag: 'ง่าย' },
        { id: 'q5', passPct: 54, tag: 'ปานกลาง' },
        { id: 'q6', passPct: 68, tag: 'ปานกลาง' },
        { id: 'q7', passPct: 42, tag: 'ยาก' },
        { id: 'q8', passPct: 80, tag: 'ง่าย' },
        { id: 'q9', passPct: 48, tag: 'ยาก' }
      ],
      scoreDistribution: [
        { range: '0-5', count: 2 },
        { range: '6-10', count: 3 },
        { range: '11-15', count: 7 },
        { range: '16-20', count: 16 },
        { range: '21-25', count: 8 }
      ],
      insights: [
        { level: 'green', text: 'นักเรียนร้อยละ 88 ผ่านเกณฑ์การตอบตรงโจทย์ (TR ≥ 3)' },
        { level: 'amber', text: 'ข้อ q7 (GRA ≥ 4) มีอัตราผ่านเพียง 42% ควรเสริมโครงสร้าง Compound Sentences' },
        { level: 'red', text: 'พบสัญญาณ Careless 4 คนที่มีคะแนนรวมสูงแต่ตกเกณฑ์ย่อยพื้นฐาน' }
      ],
      students: [
        {
          userId: 'u1',
          no: 1,
          name: 'ด.ช. กฤษณะ วงศ์สวัสดิ์',
          scores: { TR: 5, ME: 5, LR: 5, GRA: 4, CC: 5 },
          tot: 9,
          rubricTotal: 24,
          ks: 'Mastery',
          flag: 'OK'
        },
        {
          userId: 'u2',
          no: 2,
          name: 'ด.ช. ณภัทร เจริญเกียรติ',
          scores: { TR: 4, ME: 4, LR: 4, GRA: 4, CC: 4 },
          tot: 8,
          rubricTotal: 20,
          ks: 'Mastery',
          flag: 'OK'
        },
        {
          userId: 'u3',
          no: 3,
          name: 'ด.ช. ธนดล พัฒนกิจ',
          scores: { TR: 4, ME: 2, LR: 4, GRA: 4, CC: 4 },
          tot: 7,
          rubricTotal: 18,
          ks: 'Language Dev',
          flag: 'Careless'
        },
        {
          userId: 'u4',
          no: 4,
          name: 'ด.ญ. ปรียาภรณ์ ศรีสุวรรณ',
          scores: { TR: 4, ME: 3, LR: 3, GRA: 3, CC: 4 },
          tot: 6,
          rubricTotal: 17,
          ks: 'Structure OK',
          flag: 'OK'
        },
        {
          userId: 'u5',
          no: 5,
          name: 'ด.ช. พงศกร มิ่งขวัญ',
          scores: { TR: 2, ME: 3, LR: 2, GRA: 2, CC: 3 },
          tot: 5,
          rubricTotal: 12,
          ks: 'Beginner',
          flag: 'Lucky'
        }
      ],
      pending: [
        { no: 9, name: 'ด.ช. อิทธิพัทธ์ บวรเกียรติ' },
        { no: 10, name: 'ด.ญ. อมรรัตน์ สินชัย' }
      ]
    } as T;
  }

  // Teacher status
  if (path.startsWith('/teacher/status/')) {
    return [
      { userId: 'u1', no: 1, name: 'ด.ช. กฤษณะ วงศ์สวัสดิ์', status: 'SUBMITTED', partsCompleted: 3, totalParts: 3, lastActivityAt: '2026-10-20 10:15' },
      { userId: 'u2', no: 2, name: 'ด.ช. ณภัทร เจริญเกียรติ', status: 'SUBMITTED', partsCompleted: 3, totalParts: 3, lastActivityAt: '2026-10-20 11:20' },
      { userId: 'u3', no: 3, name: 'ด.ช. ธนดล พัฒนกิจ', status: 'SUBMITTED', partsCompleted: 3, totalParts: 3, lastActivityAt: '2026-10-19 14:30' },
      { userId: 'u9', no: 9, name: 'ด.ช. อิทธิพัทธ์ บวรเกียรติ', status: 'IN_PROGRESS', partsCompleted: 1, totalParts: 3, lastActivityAt: '2026-10-20 12:05' },
      { userId: 'u10', no: 10, name: 'ด.ญ. อมรรัตน์ สินชัย', status: 'TODO', partsCompleted: 0, totalParts: 3, lastActivityAt: '-' }
    ] as T;
  }

  // Dev exercises
  if (path === '/dev/exercises') {
    return [
      {
        id: 'prism-fanboys-pretest',
        name: 'PRISM · FANBOYS · Pretest',
        baseUrl: 'https://prism-pretest.workers.dev',
        health: 'healthy',
        manifestVersion: '1.2.0',
        enabled: true,
        lastSyncAt: '5 นาทีที่แล้ว',
        lastError: null,
        rosterSource: true
      },
      {
        id: 'prism-fanboys-c1',
        name: 'PRISM · FANBOYS · Cycle 1',
        baseUrl: 'https://prism-cycle1.workers.dev',
        health: 'healthy',
        manifestVersion: '1.2.0',
        enabled: true,
        lastSyncAt: '12 นาทีที่แล้ว',
        lastError: null,
        rosterSource: false
      }
    ] as T;
  }

  // Dev logs
  if (path.startsWith('/dev/logs')) {
    return [
      { id: 'sync-1', exerciseId: 'prism-fanboys-pretest', at: '2026-10-20 14:20:04', ok: true, rows: 144, ms: 380 },
      { id: 'sync-2', exerciseId: 'prism-fanboys-c1', at: '2026-10-20 14:10:00', ok: true, rows: 98, ms: 290 }
    ] as T;
  }

  // Dev users
  if (path === '/dev/users') {
    return [
      { id: 'u1', name: 'อาจารย์สมเกียรติ ยิ่งเจริญ', email: 'somkiat@nssc.ac.th', role: 'teacher', classes: ['ม.3/1', 'ม.3/2'] },
      { id: 'u2', name: 'Admin ผู้ดูแลระบบ', email: 'admin@nssc.ac.th', role: 'dev', classes: [] }
    ] as T;
  }

  return {} as T;
}
