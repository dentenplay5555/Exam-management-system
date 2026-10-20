// Cloudflare Pages Functions - Hub API Router
// Server-Side only. Secure session (HMAC-SHA256), strict role enforcement, verified CbKST evaluation,
// and direct query to writing_assessment_final with service_role.

import {
  deriveBinaryItemsFromRubric,
  countBinaryTotal,
  evaluateKnowledgeState,
  evaluateFlag,
  evaluateLevel,
  getKnowledgeStateTips,
  getSkillFeedback,
  evaluateBadges,
  type SkillScores,
  type BinaryItemMap
} from '../../server/cbkst';
import {
  signSession,
  verifySession,
  generateOAuthState,
  parseCookies,
  type UserSession
} from '../../server/auth';
import type {
  KnowledgeStateType,
  FlagType,
  StudentResultPayload,
  TeacherReportPayload,
  TeacherSubmissionStatus,
  StudentExerciseItem
} from '../../src/types';

export interface Env {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  SESSION_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  DEV_EMAILS?: string;
  TEACHER_EMAILS?: string;
  TEACHER_CLASSES?: string;
}

// Fail-closed session secret: No hardcoded fallback! Must be >= 32 characters
function getSessionSecret(env: Env): string | null {
  const secret = (env.SESSION_SECRET || '').trim();
  if (secret.length < 32) {
    return null;
  }
  return secret;
}

function jsonResponse(data: unknown, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  });
}

function errorResponse(code: string, message: string, status = 400, headers: HeadersInit = {}): Response {
  return jsonResponse(
    {
      error: { code, message },
      code,
      message
    },
    status,
    headers
  );
}

// Fetch from Supabase using service_role on server
async function querySupabase(env: Env, endpoint: string): Promise<any[] | null> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return null;
  try {
    const base = env.SUPABASE_URL.replace(/\/$/, '');
    const url = `${base}/rest/v1/${endpoint}`;
    const res = await fetch(url, {
      headers: {
        'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
      }
    });
    if (res.ok) {
      return (await res.json()) as any[];
    }
  } catch (e) {
    console.error('Failed to query Supabase server-side:', e);
  }
  return null;
}

// Helper to resolve teacher classes from TEACHER_CLASSES env or default to all 9 classes (ม.3/1 – ม.3/9)
function resolveTeacherClasses(env: Env, email: string): string[] {
  if (env.TEACHER_CLASSES) {
    const pairs = env.TEACHER_CLASSES.split('|');
    for (const pair of pairs) {
      const [em, classesStr] = pair.split(':');
      if (em && classesStr && em.trim().toLowerCase() === email.toLowerCase()) {
        return classesStr.split(',').map(c => c.trim()).filter(Boolean);
      }
    }
  }
  return Array.from({ length: 9 }, (_, i) => `ม.3/${i + 1}`);
}

// Helper to extract student row from writing_assessment_final
// Prioritizes actual view column names: full_name, class_number, student_id
function normalizeStudentRow(r: any, idx = 0) {
  const scores: SkillScores = {
    TR: Number(r.tr ?? r.score_tr ?? r.TR ?? 0),
    ME: Number(r.me ?? r.score_me ?? r.ME ?? 0),
    LR: Number(r.lr ?? r.score_lr ?? r.LR ?? 0),
    GRA: Number(r.gra ?? r.score_gra ?? r.GRA ?? 0),
    CC: Number(r.cc ?? r.score_cc ?? r.CC ?? 0)
  };

  const rubricTotal = Number((scores.TR + scores.ME + scores.LR + scores.GRA + scores.CC).toFixed(1));

  // Binary items: use view columns q1..q9 if present, or derive from rubric
  let binary: BinaryItemMap;
  if (r.q1 !== undefined && r.q2 !== undefined) {
    binary = {
      q1: Boolean(r.q1 === 1 || r.q1 === true || r.q1 === '1'),
      q2: Boolean(r.q2 === 1 || r.q2 === true || r.q2 === '1'),
      q3: Boolean(r.q3 === 1 || r.q3 === true || r.q3 === '1'),
      q4: Boolean(r.q4 === 1 || r.q4 === true || r.q4 === '1'),
      q5: Boolean(r.q5 === 1 || r.q5 === true || r.q5 === '1'),
      q6: Boolean(r.q6 === 1 || r.q6 === true || r.q6 === '1'),
      q7: Boolean(r.q7 === 1 || r.q7 === true || r.q7 === '1'),
      q8: Boolean(r.q8 === 1 || r.q8 === true || r.q8 === '1'),
      q9: Boolean(r.q9 === 1 || r.q9 === true || r.q9 === '1')
    };
  } else {
    binary = deriveBinaryItemsFromRubric(scores);
  }

  const binaryTotal = Number(r.binary_total ?? r.tot ?? countBinaryTotal(binary));

  // KS & Flag: Use view columns if present, otherwise compute by verified real rules
  const ks: KnowledgeStateType = (r.ks && ['Mastery', 'Language Dev', 'Structure OK', 'Beginner'].includes(r.ks))
    ? r.ks
    : evaluateKnowledgeState(binaryTotal);

  const flag: FlagType = (r.flag && ['OK', 'Lucky', 'Careless'].includes(r.flag))
    ? r.flag
    : evaluateFlag(binary);

  const level = evaluateLevel(binaryTotal);

  return {
    id: String(r.student_id ?? r.id ?? `stu-${idx + 1}`),
    name: String(r.full_name ?? r.name ?? r.student_name ?? `นักเรียนคนที่ ${idx + 1}`),
    class: String(r.class ?? r.classroom ?? 'ม.3/1'),
    no: Number(r.class_number ?? r.no ?? r.student_number ?? (idx + 1)),
    scores,
    rubricTotal,
    binary,
    binaryTotal,
    ks,
    flag,
    level,
    tips: getKnowledgeStateTips(ks, flag),
    feedback: getSkillFeedback(scores),
    badges: evaluateBadges(scores, flag, level.n)
  };
}

export const onRequest = async (context: {
  request: Request;
  env: Env;
  params?: any;
  waitUntil?: (promise: Promise<any>) => void;
  next?: () => Promise<Response>;
}): Promise<Response> => {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/?/, '');
  const method = request.method;
  const isHttps = url.protocol === 'https:';
  const cookieHeader = request.headers.get('Cookie');
  const cookies = parseCookies(cookieHeader);
  const secret = getSessionSecret(env);

  // ----------------------------------------------------
  // 1. Auth: GET /api/auth/google/start (OAuth Start)
  // ----------------------------------------------------
  if (path === 'auth/google/start') {
    // Fail-closed check: No auto-login! If OAuth or SESSION_SECRET is unconfigured, return 500 error.
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
      return errorResponse(
        'CONFIG_ERROR',
        'Google OAuth ยังไม่ได้ตั้งค่าบนเซิร์ฟเวอร์ กรุณาตั้งค่า GOOGLE_CLIENT_ID และ GOOGLE_CLIENT_SECRET ใน Environment Variables',
        500
      );
    }
    if (!secret) {
      return errorResponse(
        'CONFIG_ERROR',
        'เซิร์ฟเวอร์ยังไม่ได้ตั้งค่า SESSION_SECRET หรือคีย์สั้นกว่า 32 ตัวอักษร กรุณาตั้งค่าใน Cloudflare Pages Environment Variables ก่อนเริ่มใช้งาน',
        500
      );
    }

    const state = generateOAuthState();
    const redirectUri = `${url.origin}/api/auth/google/callback`;
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(env.GOOGLE_CLIENT_ID)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile&state=${encodeURIComponent(state)}&hd=nssc.ac.th&prompt=select_account`;

    // Secure HttpOnly CSRF state cookie with 5-minute expiry
    const secureFlag = isHttps ? 'Secure; ' : '';
    return new Response(null, {
      status: 302,
      headers: {
        'Location': googleAuthUrl,
        'Set-Cookie': `oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; ${secureFlag}Max-Age=300`
      }
    });
  }

  // ----------------------------------------------------
  // 2. Auth: GET /api/auth/google/callback (OAuth Callback)
  // ----------------------------------------------------
  if (path === 'auth/google/callback') {
    if (!secret) {
      return errorResponse(
        'CONFIG_ERROR',
        'เซิร์ฟเวอร์ยังไม่ได้ตั้งค่า SESSION_SECRET หรือคีย์สั้นกว่า 32 ตัวอักษร กรุณาตั้งค่าใน Environment Variables',
        500
      );
    }

    const code = url.searchParams.get('code');
    const returnedState = url.searchParams.get('state');
    const expectedState = cookies['oauth_state'];

    // CSRF verification
    if (!returnedState || !expectedState || returnedState !== expectedState) {
      return errorResponse('CSRF_ERROR', 'การยืนยัน state ป้องกัน CSRF ล้มเหลว กรุณาลองเข้าสู่ระบบใหม่อีกครั้ง', 400);
    }

    if (!code) {
      return errorResponse('AUTH_FAILED', 'ไม่พบรหัสยืนยัน (code) จาก Google', 400);
    }

    try {
      const redirectUri = `${url.origin}/api/auth/google/callback`;
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: env.GOOGLE_CLIENT_ID || '',
          client_secret: env.GOOGLE_CLIENT_SECRET || '',
          redirect_uri: redirectUri,
          grant_type: 'authorization_code'
        })
      });

      if (!tokenRes.ok) {
        return errorResponse('AUTH_FAILED', 'ไม่สามารถแลกเปลี่ยนโทเคนกับ Google ได้', 401);
      }

      const tokenData = (await tokenRes.json()) as any;
      const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });

      if (!userRes.ok) {
        return errorResponse('AUTH_FAILED', 'ไม่สามารถดึงข้อมูลโปรไฟล์จาก Google ได้', 401);
      }

      const profile = (await userRes.json()) as any;
      const email = (profile.email || '').toLowerCase().trim();

      // Enforce email_verified
      if (!profile.verified_email && !profile.email_verified) {
        return errorResponse('UNVERIFIED_EMAIL', 'อีเมล Google ของคุณยังไม่ได้รับการยืนยันตัวตน', 403);
      }

      // Enforce allowed school domains (@nssc.ac.th, @student.nssc.ac.th)
      const isSchoolDomain = email.endsWith('@nssc.ac.th') || email.endsWith('@student.nssc.ac.th');
      if (!isSchoolDomain) {
        return errorResponse(
          'FORBIDDEN_DOMAIN',
          'ระบบอนุญาตเฉพาะบัญชีอีเมลของโรงเรียนนครสวรรค์ (@nssc.ac.th หรือ @student.nssc.ac.th) เท่านั้น',
          403
        );
      }

      // Determine Role strictly from env whitelists (empty array if unset - NO HARDCODED EMAILS!)
      const devEmails = (env.DEV_EMAILS || '')
        .split(',')
        .map(e => e.trim().toLowerCase())
        .filter(Boolean);

      const teacherEmails = (env.TEACHER_EMAILS || '')
        .split(',')
        .map(e => e.trim().toLowerCase())
        .filter(Boolean);

      let role: 'student' | 'teacher' | 'dev' = 'student';
      let teacherClasses: string[] | undefined = undefined;

      if (devEmails.includes(email)) {
        role = 'dev';
      } else if (teacherEmails.includes(email)) {
        role = 'teacher';
        teacherClasses = resolveTeacherClasses(env, email);
      }

      const sessionUser: UserSession = {
        id: `usr-${profile.id || btoa(email).slice(0, 10)}`,
        name: profile.name || (role === 'teacher' ? 'อาจารย์' : 'นักเรียน'),
        email,
        role,
        classes: teacherClasses
      };

      // Sign session with HMAC-SHA256
      const sessionToken = await signSession(sessionUser, secret);
      const secureFlag = isHttps ? 'Secure; ' : '';
      const targetUrl = role === 'student' ? '/student' : role === 'teacher' ? '/teacher' : '/dev/exercises';

      const responseHeaders = new Headers();
      responseHeaders.set('Location', targetUrl);
      responseHeaders.append(
        'Set-Cookie',
        `practice_hub_session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; ${secureFlag}Max-Age=604800`
      );
      // Clean up oauth_state cookie after successful verification
      responseHeaders.append(
        'Set-Cookie',
        `oauth_state=; Path=/; HttpOnly; SameSite=Lax; ${secureFlag}Max-Age=0`
      );

      return new Response(null, {
        status: 302,
        headers: responseHeaders
      });
    } catch (e: any) {
      console.error('OAuth callback error:', e);
      return errorResponse('AUTH_FAILED', 'เกิดข้อผิดพลาดในการยืนยันตัวตนกับ Google', 500);
    }
  }

  // ----------------------------------------------------
  // 3. Auth: POST /api/auth/logout
  // ----------------------------------------------------
  if (path === 'auth/logout') {
    const secureFlag = isHttps ? 'Secure; ' : '';
    return jsonResponse({ ok: true }, 200, {
      'Set-Cookie': `practice_hub_session=; Path=/; HttpOnly; SameSite=Lax; ${secureFlag}Max-Age=0`
    });
  }

  // ----------------------------------------------------
  // 4. GET /api/me (Session Check)
  // ----------------------------------------------------
  if (!secret) {
    return errorResponse(
      'CONFIG_ERROR',
      'เซิร์ฟเวอร์ยังไม่ได้ตั้งค่า SESSION_SECRET หรือคีย์สั้นกว่า 32 ตัวอักษร กรุณาตั้งค่าใน Cloudflare Pages Environment Variables',
      500
    );
  }

  const rawSession = cookies['practice_hub_session'];
  const currentUser: UserSession | null = rawSession ? await verifySession(rawSession, secret) : null;

  if (path === 'me') {
    if (!currentUser) {
      return errorResponse('UNAUTHORIZED', 'กรุณาเข้าสู่ระบบก่อนดำเนินการ', 401);
    }
    return jsonResponse({
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role,
      classes: currentUser.classes || []
    });
  }

  // ----------------------------------------------------
  // Guard: Must be authenticated for all endpoints below
  // ----------------------------------------------------
  if (!currentUser) {
    return errorResponse('UNAUTHORIZED', 'กรุณาเข้าสู่ระบบก่อนใช้งาน', 401);
  }

  // ----------------------------------------------------
  // 5. GET /api/student/exercises
  // ----------------------------------------------------
  if (path === 'student/exercises') {
    // Check real pretest status for this student
    let isPretestCompleted = false;
    try {
      const emailMapping = await querySupabase(
        env,
        `student_emails?email=eq.${encodeURIComponent(currentUser.email)}&select=student_id`
      );
      if (emailMapping && emailMapping.length > 0 && emailMapping[0].student_id) {
        const studentId = emailMapping[0].student_id;
        const res = await querySupabase(
          env,
          `writing_assessment_final?student_id=eq.${encodeURIComponent(studentId)}&select=student_id`
        );
        if (res && res.length > 0) {
          isPretestCompleted = true;
        }
      }
    } catch {
      // If student_emails not queried, remains false
    }

    const exercises: StudentExerciseItem[] = [
      {
        id: 'prism-fanboys-pretest',
        name: 'PRISM · FANBOYS · Pretest',
        series: 'FANBOYS Series',
        phase: 'Pretest',
        status: isPretestCompleted ? 'COMPLETED' : 'TODO',
        dueAt: '2026-10-31T23:59:59Z',
        attemptsUsed: isPretestCompleted ? 1 : 0,
        maxAttempts: 1,
        exerciseUrl: 'https://prism-fanboys.pages.dev'
      },
      {
        id: 'prism-fanboys-c1',
        name: 'PRISM · FANBOYS · Cycle 1',
        series: 'FANBOYS Series',
        phase: 'Cycle 1',
        status: 'TODO',
        dueAt: '2026-11-07T23:59:59Z',
        attemptsUsed: 0,
        maxAttempts: 1,
        exerciseUrl: 'https://prism-fanboys.pages.dev'
      },
      {
        id: 'prism-fanboys-c2',
        name: 'PRISM · FANBOYS · Cycle 2',
        series: 'FANBOYS Series',
        phase: 'Cycle 2',
        status: 'TODO',
        dueAt: '2026-11-14T23:59:59Z',
        attemptsUsed: 0,
        maxAttempts: 1,
        exerciseUrl: 'https://prism-fanboys.pages.dev'
      },
      {
        id: 'prism-fanboys-post',
        name: 'PRISM · FANBOYS · Post-Test',
        series: 'FANBOYS Series',
        phase: 'Post-test',
        status: 'TODO',
        dueAt: '2026-11-21T23:59:59Z',
        attemptsUsed: 0,
        maxAttempts: 1,
        exerciseUrl: 'https://prism-fanboys.pages.dev'
      }
    ];

    return jsonResponse(exercises);
  }

  // ----------------------------------------------------
  // 6. GET /api/student/results/:exId
  // ----------------------------------------------------
  if (path.startsWith('student/results/')) {
    const exId = path.split('/')[2];

    // 1. Single source of truth for email -> student_id mapping: student_emails table
    const emailMapping = await querySupabase(
      env,
      `student_emails?email=eq.${encodeURIComponent(currentUser.email)}&select=student_id`
    );

    let studentId: string | null = null;
    if (emailMapping && emailMapping.length > 0 && emailMapping[0].student_id) {
      studentId = String(emailMapping[0].student_id);
    }

    if (!studentId) {
      return errorResponse(
        'STUDENT_NOT_LINKED',
        `ไม่พบบัญชีอีเมล ${currentUser.email} ในระบบลงทะเบียน student_emails กรุณาติดต่อครูผู้สอนเพื่อนำเข้าข้อมูล PEM`,
        404
      );
    }

    // 2. Query writing_assessment_final with student_id filter directly at PostgREST
    const sbRows = await querySupabase(
      env,
      `writing_assessment_final?student_id=eq.${encodeURIComponent(studentId)}&select=*`
    );

    if (!sbRows || sbRows.length === 0) {
      return errorResponse(
        'SUBMISSION_NOT_FOUND',
        `พบข้อมูลผู้เรียนในระบบแล้ว แต่ยังไม่พบผลการประเมินแบบฝึกหัดชุดนี้ กรุณาตรวจสอบว่าท่านได้ส่งแบบฝึกหัดแล้วหรือยัง`,
        404
      );
    }

    const norm = normalizeStudentRow(sbRows[0]);

    const payload: StudentResultPayload = {
      exercise: {
        id: exId,
        name: 'PRISM · FANBOYS · Pretest'
      },
      student: {
        name: norm.name,
        class: norm.class,
        no: norm.no
      },
      status: 'SUBMITTED',
      scores: norm.scores,
      rubricTotal: norm.rubricTotal,
      binary: norm.binary,
      binaryTotal: norm.binaryTotal,
      level: norm.level,
      ks: norm.ks,
      flag: norm.flag,
      badges: norm.badges,
      feedback: norm.feedback,
      tips: norm.tips,
      attempts: {
        used: 1,
        max: 1
      }
    };

    return jsonResponse(payload);
  }

  // ----------------------------------------------------
  // 7. GET /api/teacher/classes
  // ----------------------------------------------------
  if (path === 'teacher/classes') {
    if (currentUser.role !== 'teacher' && currentUser.role !== 'dev') {
      return errorResponse('FORBIDDEN', 'คุณไม่มีสิทธิ์เข้าถึงส่วนของครูผู้สอน', 403);
    }

    const classes = currentUser.classes?.length
      ? currentUser.classes
      : Array.from({ length: 9 }, (_, i) => `ม.3/${i + 1}`);

    return jsonResponse(classes);
  }

  // ----------------------------------------------------
  // 8. GET /api/teacher/report/:exId/:classId
  // ----------------------------------------------------
  if (path.startsWith('teacher/report/')) {
    if (currentUser.role !== 'teacher' && currentUser.role !== 'dev') {
      return errorResponse('FORBIDDEN', 'เฉพาะครูผู้สอนเท่านั้น', 403);
    }

    const parts = path.split('/');
    const exId = parts[2];
    const classId = decodeURIComponent(parts[3] || '');

    // Ownership check: Teacher can only view their own assigned classes
    if (currentUser.role === 'teacher' && currentUser.classes && !currentUser.classes.includes(classId)) {
      return errorResponse('FORBIDDEN', `คุณไม่มีสิทธิ์เข้าถึงข้อมูลของห้อง ${classId}`, 403);
    }

    // Filter at PostgREST directly (support both "ม.3/1" and "3/1" conventions)
    const cleanClass = classId.replace(/^ม\./, '');
    const classRows = await querySupabase(
      env,
      `writing_assessment_final?or=(class.eq.${encodeURIComponent(classId)},class.eq.${encodeURIComponent(cleanClass)})&select=*`
    );

    if (!classRows || classRows.length === 0) {
      return errorResponse('NOT_FOUND', `ไม่พบข้อมูลการประเมินสำหรับห้อง ${classId}`, 404);
    }

    // Normalize each student with correct full_name, class_number, student_id
    const evaluatedList = classRows.map((r, i) => normalizeStudentRow(r, i));
    const submittedCount = evaluatedList.length;

    // Dynamically retrieve total students from students table if accessible, otherwise submittedCount
    let totalStudents = submittedCount;
    try {
      const rosterRows = await querySupabase(
        env,
        `students?or=(class.eq.${encodeURIComponent(classId)},class.eq.${encodeURIComponent(cleanClass)})&select=id`
      );
      if (rosterRows && rosterRows.length > 0) {
        totalStudents = rosterRows.length;
      }
    } catch {
      totalStudents = submittedCount;
    }
    const notSubmitted = Math.max(0, totalStudents - submittedCount);

    const avgRubric = Number(
      (evaluatedList.reduce((acc, s) => acc + s.rubricTotal, 0) / submittedCount).toFixed(1)
    );
    const avgTot = Number(
      (evaluatedList.reduce((acc, s) => acc + s.binaryTotal, 0) / submittedCount).toFixed(1)
    );

    const luckyCount = evaluatedList.filter(s => s.flag === 'Lucky').length;
    const carelessCount = evaluatedList.filter(s => s.flag === 'Careless').length;

    // Knowledge States distribution
    const ksList: KnowledgeStateType[] = ['Mastery', 'Language Dev', 'Structure OK', 'Beginner'];
    const knowledgeStates = ksList.map(name => {
      const count = evaluatedList.filter(s => s.ks === name).length;
      const pct = Math.round((count / submittedCount) * 100);
      return { name, count, pct };
    });

    // Skills averages & pass rates (pass = score >= 3.0)
    const skillCodes: Array<{ code: keyof SkillScores; name: string }> = [
      { code: 'TR', name: 'Task Response' },
      { code: 'ME', name: 'Mechanics' },
      { code: 'LR', name: 'Lexical Resource' },
      { code: 'GRA', name: 'Grammar & Accuracy' },
      { code: 'CC', name: 'Coherence & Cohesion' }
    ];

    const skills = skillCodes.map(({ code, name }) => {
      const total = evaluatedList.reduce((acc, s) => acc + s.scores[code], 0);
      const passed = evaluatedList.filter(s => s.scores[code] >= 3.0).length;
      return {
        code,
        name,
        avg: Number((total / submittedCount).toFixed(2)),
        passPct: Math.round((passed / submittedCount) * 100)
      };
    });

    // Item difficulty for q1..q9
    const itemDifficulty = Array.from({ length: 9 }, (_, idx) => {
      const qKey = `q${idx + 1}`;
      const passedCount = evaluatedList.filter(s => s.binary[qKey]).length;
      const passPct = Math.round((passedCount / submittedCount) * 100);
      const tag: 'ง่าย' | 'ปานกลาง' | 'ยาก' = passPct > 70 ? 'ง่าย' : passPct >= 40 ? 'ปานกลาง' : 'ยาก';
      return {
        id: qKey,
        passPct,
        tag
      };
    });

    // Score distribution (0-5, 6-10, 11-15, 16-20, 21-25)
    const scoreDistribution = [
      { range: '0-5', count: evaluatedList.filter(s => s.rubricTotal <= 5).length },
      { range: '6-10', count: evaluatedList.filter(s => s.rubricTotal > 5 && s.rubricTotal <= 10).length },
      { range: '11-15', count: evaluatedList.filter(s => s.rubricTotal > 10 && s.rubricTotal <= 15).length },
      { range: '16-20', count: evaluatedList.filter(s => s.rubricTotal > 15 && s.rubricTotal <= 20).length },
      { range: '21-25', count: evaluatedList.filter(s => s.rubricTotal > 20).length }
    ];

    // Dynamic Pedagogical Insights
    const insights: Array<{ level: 'red' | 'amber' | 'green'; text: string }> = [];
    if (carelessCount >= 5) {
      insights.push({
        level: 'amber',
        text: `พบนักเรียน ${carelessCount} คนที่มีสัญญาณ Careless (ผ่านเกณฑ์ประเด็นขั้นต้น q1 แต่หลุดประเด็นลึกซึ้ง q2) แนะนำให้เน้นการตรวจทานรายละเอียด`
      });
    }
    if (luckyCount >= 3) {
      insights.push({
        level: 'amber',
        text: `พบสัญญาณ Lucky ${luckyCount} คน (ผ่านการเชื่อมโยงแต่ไวยากรณ์พื้นฐานยังไม่แน่น) ควรเสริมพื้นฐาน FANBOYS เพิ่มเติม`
      });
    }
    const lowestSkill = [...skills].sort((a, b) => a.avg - b.avg)[0];
    if (lowestSkill && lowestSkill.avg < 3.0) {
      insights.push({
        level: 'red',
        text: `มิติที่ต้องพัฒนาเร่งด่วน: ${lowestSkill.name} (${lowestSkill.code}) มีคะแนนเฉลี่ยเพียง ${lowestSkill.avg}/5.0`
      });
    } else {
      insights.push({
        level: 'green',
        text: `ภาพรวมห้องเรียนผ่านเกณฑ์ระดับมาตรฐาน CbKST ดี มีคะแนนเฉลี่ยรูบริก ${avgRubric}/25.0`
      });
    }

    const payload: TeacherReportPayload = {
      exercise: {
        id: exId,
        name: 'PRISM · FANBOYS · Pretest',
        manifestVersion: '1.0.0'
      },
      class: {
        name: classId,
        students: totalStudents
      },
      asOf: new Date().toISOString().replace('T', ' ').slice(0, 16),
      stats: {
        submitted: submittedCount,
        notSubmitted,
        avgTot,
        avgRubric,
        lucky: luckyCount,
        careless: carelessCount
      },
      knowledgeStates,
      skills,
      itemDifficulty,
      scoreDistribution,
      insights,
      students: evaluatedList.map(s => ({
        userId: s.id,
        no: s.no,
        name: s.name,
        scores: s.scores,
        tot: s.binaryTotal,
        rubricTotal: s.rubricTotal,
        ks: s.ks,
        flag: s.flag
      })),
      pending: []
    };

    return jsonResponse(payload);
  }

  // ----------------------------------------------------
  // 9. GET /api/teacher/status/:exId/:classId
  // ----------------------------------------------------
  if (path.startsWith('teacher/status/')) {
    if (currentUser.role !== 'teacher' && currentUser.role !== 'dev') {
      return errorResponse('FORBIDDEN', 'เฉพาะครูผู้สอนเท่านั้น', 403);
    }

    const parts = path.split('/');
    const classId = decodeURIComponent(parts[3] || '');

    if (currentUser.role === 'teacher' && currentUser.classes && !currentUser.classes.includes(classId)) {
      return errorResponse('FORBIDDEN', `คุณไม่มีสิทธิ์เข้าถึงข้อมูลของห้อง ${classId}`, 403);
    }

    const cleanClass = classId.replace(/^ม\./, '');
    const sbRows = await querySupabase(
      env,
      `writing_assessment_final?or=(class.eq.${encodeURIComponent(classId)},class.eq.${encodeURIComponent(cleanClass)})&select=*`
    );

    if (!sbRows || sbRows.length === 0) {
      return errorResponse('NOT_FOUND', `ไม่พบข้อมูลสำหรับห้อง ${classId}`, 404);
    }

    // Attempt to query all students in this class from students table to detect NOT_STARTED
    let unsubmittedList: TeacherSubmissionStatus[] = [];
    try {
      const rosterRows = await querySupabase(
        env,
        `students?or=(class.eq.${encodeURIComponent(classId)},class.eq.${encodeURIComponent(cleanClass)})&select=*`
      );
      if (rosterRows && rosterRows.length > 0) {
        const submittedIds = new Set(sbRows.map((r: any) => String(r.student_id || r.id)));
        unsubmittedList = rosterRows
          .filter((s: any) => !submittedIds.has(String(s.id || s.student_id)))
          .map((s: any, i: number) => ({
            userId: String(s.id || s.student_id || `pending-${i + 1}`),
            no: Number(s.class_number || s.no || (i + 1)),
            name: String(s.full_name || s.name || `นักเรียนคนที่ ${i + 1}`),
            status: 'TODO',
            partsCompleted: 0,
            totalParts: 2,
            lastActivityAt: '-'
          }));
      }
    } catch {
      // Roster table not accessible
    }

    const submittedList: TeacherSubmissionStatus[] = sbRows.map((r, i) => {
      const norm = normalizeStudentRow(r, i);
      return {
        userId: norm.id,
        no: norm.no,
        name: norm.name,
        status: 'SUBMITTED',
        partsCompleted: 2,
        totalParts: 2,
        lastActivityAt: r.submitted_at || r.created_at || new Date().toISOString()
      };
    });

    return jsonResponse([...submittedList, ...unsubmittedList]);
  }

  // ----------------------------------------------------
  // 10. GET /api/teacher/student/:exId/:userId
  // ----------------------------------------------------
  if (path.startsWith('teacher/student/')) {
    if (currentUser.role !== 'teacher' && currentUser.role !== 'dev') {
      return errorResponse('FORBIDDEN', 'เฉพาะครูผู้สอนเท่านั้น', 403);
    }

    const parts = path.split('/');
    const exId = parts[2];
    const userId = decodeURIComponent(parts[3] || '');

    // Search strictly by student_id at PostgREST
    const sbRows = await querySupabase(
      env,
      `writing_assessment_final?student_id=eq.${encodeURIComponent(userId)}&select=*`
    );

    if (!sbRows || sbRows.length === 0) {
      return errorResponse('NOT_FOUND', `ไม่พบข้อมูลผลการประเมินสำหรับนักเรียนรหัส ${userId}`, 404);
    }

    const norm = normalizeStudentRow(sbRows[0]);

    // Verify teacher ownership of this student's class
    if (currentUser.role === 'teacher' && currentUser.classes && !currentUser.classes.includes(norm.class)) {
      return errorResponse('FORBIDDEN', `คุณไม่มีสิทธิ์เข้าถึงข้อมูลของนักเรียนในห้อง ${norm.class}`, 403);
    }

    const payload: StudentResultPayload = {
      exercise: {
        id: exId,
        name: 'PRISM · FANBOYS · Pretest'
      },
      student: {
        name: norm.name,
        class: norm.class,
        no: norm.no
      },
      status: 'SUBMITTED',
      scores: norm.scores,
      rubricTotal: norm.rubricTotal,
      binary: norm.binary,
      binaryTotal: norm.binaryTotal,
      level: norm.level,
      ks: norm.ks,
      flag: norm.flag,
      badges: norm.badges,
      feedback: norm.feedback,
      tips: norm.tips,
      attempts: {
        used: 1,
        max: 1
      }
    };

    return jsonResponse(payload);
  }

  // ----------------------------------------------------
  // 11. Dev Admin Routes
  // ----------------------------------------------------
  if (path.startsWith('dev/')) {
    if (currentUser.role !== 'dev') {
      return errorResponse('FORBIDDEN', 'เฉพาะผู้ดูแลระบบ (Dev Admin) เท่านั้น', 403);
    }

    if (path === 'dev/exercises') {
      if (method === 'POST') {
        return errorResponse('NOT_IMPLEMENTED', 'ฟังก์ชันลงทะเบียนแบบฝึกหัดใหม่ผ่าน Dev API ยังไม่พร้อมใช้งานในระบบเวอร์ชันนี้', 501);
      }

      return jsonResponse([
        {
          id: 'prism-fanboys-pretest',
          name: 'PRISM · FANBOYS · Pretest',
          baseUrl: 'https://prism-fanboys.pages.dev',
          health: 'healthy',
          manifestVersion: '1.0.0',
          enabled: true,
          lastSyncAt: new Date().toISOString(),
          lastError: null,
          rosterSource: true
        }
      ]);
    }

    if (path === 'dev/sync') {
      return errorResponse('NOT_IMPLEMENTED', 'ฟังก์ชันสั่ง Sync แบบแมนนวลผ่าน Dev API ยังไม่พร้อมใช้งานในระบบเวอร์ชันนี้', 501);
    }

    if (path === 'dev/logs') {
      return errorResponse('NOT_IMPLEMENTED', 'ฟังก์ชันระบบ Audit Logs ผ่าน Dev API ยังไม่พร้อมใช้งานในระบบเวอร์ชันนี้', 501);
    }

    if (path === 'dev/users') {
      return errorResponse('NOT_IMPLEMENTED', 'ระบบจัดการรายชื่อผู้ใช้ผ่าน Dev API ยังไม่พร้อมใช้งาน กรุณาจัดการผ่าน Supabase Dashboard', 501);
    }
  }

  return errorResponse('NOT_FOUND', `ไม่พบ API endpoint: ${url.pathname}`, 404);
};
