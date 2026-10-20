import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { StudentRecord } from '../types';
import { computeBinaryItems } from '../data/mockData';

const STORAGE_KEY_URL = 'practice_hub_supabase_url';
const STORAGE_KEY_ANON = 'practice_hub_supabase_anon';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
}

export function getSupabaseConfig(): SupabaseConfig {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envAnon = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = localStorage.getItem(STORAGE_KEY_URL) || '';
  const storedAnon = localStorage.getItem(STORAGE_KEY_ANON) || '';

  const url = storedUrl || envUrl;
  const anonKey = storedAnon || envAnon;

  return {
    url,
    anonKey,
    isConfigured: Boolean(url && anonKey)
  };
}

export function saveSupabaseConfig(url: string, anonKey: string) {
  localStorage.setItem(STORAGE_KEY_URL, url.trim());
  localStorage.setItem(STORAGE_KEY_ANON, anonKey.trim());
  clientInstance = null;
}

export function clearSupabaseConfig() {
  localStorage.removeItem(STORAGE_KEY_URL);
  localStorage.removeItem(STORAGE_KEY_ANON);
  clientInstance = null;
}

let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (clientInstance) return clientInstance;

  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  try {
    clientInstance = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
    return clientInstance;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

// Test live Supabase connection with user's schema
export async function testSupabaseConnection(): Promise<{ ok: boolean; message: string; dataCount?: number; schemaDetails?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { ok: false, message: 'ยังไม่ได้ระบุ Supabase Project URL หรือ Anon Key' };
  }

  try {
    // Check students table
    const { data: students, error: sErr } = await client.from('students').select('id, full_name, class').limit(5);

    if (sErr) {
      return { ok: false, message: `ข้อผิดพลาดในการเชื่อมต่อ: ${sErr.message}` };
    }

    // Check writing assessments table
    const { data: assessments } = await client.from('writing_assessments').select('id, total_score, mastery_level').limit(5);

    const studentCount = students?.length || 0;
    const assessmentCount = assessments?.length || 0;

    return {
      ok: true,
      message: `เชื่อมต่อสำเร็จ! พบข้อมูลนักเรียน ${studentCount} รายการ และการประเมินผล ${assessmentCount} รายการ`,
      dataCount: studentCount,
      schemaDetails: `ตารางที่ตรวจพบ: students (${studentCount}), writing_assessments (${assessmentCount})`
    };
  } catch (err: any) {
    return { ok: false, message: `Network Error: ${err.message || 'ไม่สามารถติดต่อ Supabase ได้'}` };
  }
}

// Fetch real data from user's Supabase schema
export async function fetchStudentsFromSupabase(): Promise<{ ok: boolean; students?: StudentRecord[]; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: 'Supabase client not initialized' };

  try {
    // 1. Fetch Students
    const { data: rawStudents, error: stdError } = await client
      .from('students')
      .select('*')
      .order('class_number', { ascending: true });

    if (stdError) throw stdError;
    if (!rawStudents || rawStudents.length === 0) {
      return { ok: true, students: [] };
    }

    // 2. Fetch Rubric Criteria (TR, ME, LR, GRA, CC)
    const { data: rawCriteria } = await client
      .from('rubric_criteria')
      .select('id, code, label');
    const criteriaMap = new Map<string, string>();
    rawCriteria?.forEach((c: any) => criteriaMap.set(c.id, c.code?.toUpperCase()));

    // 3. Fetch Writing Assessments
    const { data: rawAssessments } = await client
      .from('writing_assessments')
      .select('*');

    // 4. Fetch Writing Assessment Scores
    const { data: rawScores } = await client
      .from('writing_assessment_scores')
      .select('*');

    // 5. Fetch Submissions
    const { data: rawSubmissions } = await client
      .from('submissions')
      .select('*');

    // Group assessment scores by assessment_id
    const scoresByAssessmentId = new Map<string, { TR: number; ME: number; LR: number; GRA: number; CC: number }>();
    if (rawScores && rawScores.length > 0) {
      rawScores.forEach((sc: any) => {
        const current = scoresByAssessmentId.get(sc.assessment_id) || { TR: 0, ME: 0, LR: 0, GRA: 0, CC: 0 };
        const code = (criteriaMap.get(sc.criterion_id) || sc.criterion_code || '').toUpperCase();
        if (code in current) {
          (current as any)[code] = Number(sc.score) || 0;
        }
        scoresByAssessmentId.set(sc.assessment_id, current);
      });
    }

    // Map each student
    const mapped: StudentRecord[] = rawStudents.map((s: any, idx: number) => {
      // Find assessment for this student
      const assessment = rawAssessments?.find((a: any) => a.student_id === s.id);
      
      // Find submission for this student (via user_id or id)
      const sub = rawSubmissions?.find((sub: any) => (s.user_id && sub.user_id === s.user_id) || sub.user_id === s.id);

      // Get scores from writing_assessment_scores or fallback to answer_data
      let scores = { TR: 3, ME: 3, LR: 3, GRA: 3, CC: 3 };
      if (assessment && scoresByAssessmentId.has(assessment.id)) {
        scores = scoresByAssessmentId.get(assessment.id)!;
      } else if (sub?.answer_data) {
        scores = {
          TR: Number(sub.answer_data.TR || 3),
          ME: Number(sub.answer_data.ME || 3),
          LR: Number(sub.answer_data.LR || 3),
          GRA: Number(sub.answer_data.GRA || 3),
          CC: Number(sub.answer_data.CC || 3),
        };
      }

      // Calculate binary items & tot score
      const binary = computeBinaryItems(scores);
      const totScore = binary.filter(b => b.passed).length;
      const rubricTotal = assessment?.total_score != null ? Number(assessment.total_score) : (scores.TR + scores.ME + scores.LR + scores.GRA + scores.CC);

      // Level
      let levelRank = 1;
      let levelName = 'Novice Draftsman';
      if (totScore >= 8.5) {
        levelRank = 5;
        levelName = 'CbKST Grandmaster';
      } else if (totScore >= 7) {
        levelRank = 4;
        levelName = 'Language Warrior';
      } else if (totScore >= 5) {
        levelRank = 3;
        levelName = 'Coherence Crafter';
      } else if (totScore >= 3) {
        levelRank = 2;
        levelName = 'Structure Architect';
      }

      // Knowledge State
      let ks: any = assessment?.mastery_level || 'Beginner';
      if (ks.includes('Mastery')) ks = 'Mastery';
      else if (ks.includes('Language')) ks = 'Language Dev';
      else if (ks.includes('Structure')) ks = 'Structure OK';
      else if (!assessment?.mastery_level) {
        ks = totScore >= 8 ? 'Mastery' : scores.TR >= 3 && scores.CC >= 3 ? 'Structure OK' : 'Language Dev';
      }

      // Flag (guess_tag)
      let flag: any = 'OK';
      const tag = (assessment?.guess_tag || '').toLowerCase();
      if (tag.includes('careless')) flag = 'Careless';
      else if (tag.includes('lucky')) flag = 'Lucky';
      else if (scores.ME < 3 && rubricTotal >= 17) flag = 'Careless';
      else if (rubricTotal <= 12 && totScore >= 5) flag = 'Lucky';

      // Needs
      const devNeeds = assessment?.flagged_criteria
        ? assessment.flagged_criteria.split(/\s+/).filter(Boolean)
        : scores.ME < 3 ? ['ME'] : scores.GRA < 3 ? ['GRA'] : [];

      return {
        id: s.id || `supabase-${idx + 1}`,
        studentNumber: Number(s.class_number || s.no || idx + 1),
        fullName: s.full_name || `นักเรียนเลขที่ ${idx + 1}`,
        email: s.email || `${s.class_number || idx + 1}.student@nssc.ac.th`,
        classRoom: s.class || 'ม.3/1',
        status: (sub?.status as any) || (assessment ? 'SUBMITTED' : 'TODO'),
        lastActivityAt: sub?.last_activity_at || assessment?.created_at || new Date().toISOString(),
        scores,
        rubricTotal,
        totScore,
        level: {
          rank: levelRank,
          name: levelName,
          xp: Math.min(100, totScore * 11 + 5),
          maxNextXp: 100
        },
        knowledgeState: ks,
        flag,
        growth: Number(assessment?.growth_score || 3.0),
        risk: (assessment?.risk_level as any) || (totScore <= 3 ? 'สูง' : totScore <= 5 ? 'ปานกลาง' : 'ต่ำ'),
        devNeeds,
        badges: [
          { id: 'b1', title: 'First Draft Hero', desc: 'ส่งตรงเวลา', icon: '⚡', unlocked: true, rarity: 'common' },
          ...(totScore >= 8 ? [{ id: 'b2', title: 'Target Sniper', desc: 'TR ผ่านเกณฑ์ยอดเยี่ยม', icon: '🎯', unlocked: true, rarity: 'rare' as const }] : []),
          ...(totScore >= 9 ? [{ id: 'b5', title: 'Grandmaster Crown', desc: 'คะแนนเต็ม 9 Items', icon: '👑', unlocked: true, rarity: 'legendary' as const }] : [])
        ],
        teacherNotes: assessment?.overall_feedback || undefined
      };
    });

    return { ok: true, students: mapped };
  } catch (err: any) {
    return { ok: false, error: err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูลจาก Supabase' };
  }
}

// Google OAuth Login via Supabase
export async function signInWithGoogle() {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('กรุณาตั้งค่า Supabase URL และ Anon Key ก่อนเข้าสู่ระบบด้วย Google');
  }

  const { data, error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  });

  if (error) throw error;
  return data;
}

export async function signOutSupabase() {
  const client = getSupabaseClient();
  if (client) {
    await client.auth.signOut();
  }
}
