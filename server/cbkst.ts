// PRISM CbKST Diagnostic Rule Engine (Server-Side Only)
// Calculates Rubric, Binary Items, Knowledge States, Flags, and Levels securely on the server.

export interface SkillScores {
  TR: number;
  ME: number;
  LR: number;
  GRA: number;
  CC: number;
}

export interface BinaryItemResult {
  id: string;
  label: string;
  passed: boolean;
  skill: string;
  threshold: number;
}

export type KnowledgeState = 'Mastery' | 'Language Dev' | 'Structure OK' | 'Beginner';
export type FlagType = 'Careless' | 'Lucky' | 'OK';

export interface EvaluatedResult {
  scores: SkillScores;
  totalScore: number;
  maxScore: number;
  binaryItems: BinaryItemResult[];
  binaryTotal: number;
  binaryMax: number;
  knowledgeState: {
    state: KnowledgeState;
    nameTh: string;
    description: string;
    color: string;
    tips: string[];
  };
  flag: {
    type: FlagType;
    labelTh: string;
    color: string;
    reason: string;
  };
  level: {
    level: number;
    title: string;
    xp: number;
    nextLevelXp: number;
  };
  badges: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
  }>;
}

// 1. Binary derivation for PRISM 9 items
export function deriveBinaryItems(s: SkillScores): BinaryItemResult[] {
  return [
    { id: 'q1', label: 'TR >= 3 (ตอบตรงประเด็นขั้นพื้นฐาน)', passed: s.TR >= 3, skill: 'TR', threshold: 3 },
    { id: 'q2', label: 'TR >= 4 (พัฒนาประเด็นชัดเจนและลึกซึ้ง)', passed: s.TR >= 4, skill: 'TR', threshold: 4 },
    { id: 'q3', label: 'ME >= 3 (เครื่องหมายวรรคตอนและการสะกดคำถูกต้อง)', passed: s.ME >= 3, skill: 'ME', threshold: 3 },
    { id: 'q4', label: 'LR >= 3 (คลังคำศัพท์เพียงพอสื่อความ)', passed: s.LR >= 3, skill: 'LR', threshold: 3 },
    { id: 'q5', label: 'LR >= 4 (เลือกใช้คำศัพท์สละสลวย หลากหลาย)', passed: s.LR >= 4, skill: 'LR', threshold: 4 },
    { id: 'q6', label: 'GRA >= 3 (ไวยากรณ์ FANBOYS ขั้นต้นถูกต้อง)', passed: s.GRA >= 3, skill: 'GRA', threshold: 3 },
    { id: 'q7', label: 'GRA >= 4 (โครงสร้างประโยคซับซ้อนแม่นยำ)', passed: s.GRA >= 4, skill: 'GRA', threshold: 4 },
    { id: 'q8', label: 'CC >= 3 (การเชื่อมโยงข้อความราบรื่น)', passed: s.CC >= 3, skill: 'CC', threshold: 3 },
    { id: 'q9', label: 'CC >= 4 (การลำดับย่อหน้ากลมกลืนเป็นเอกภาพ)', passed: s.CC >= 4, skill: 'CC', threshold: 4 },
  ];
}

// 2. Knowledge State determination
export function evaluateKnowledgeState(s: SkillScores): EvaluatedResult['knowledgeState'] {
  const allMastered = s.TR >= 4 && s.ME >= 4 && s.LR >= 4 && s.GRA >= 4 && s.CC >= 4;
  if (allMastered) {
    return {
      state: 'Mastery',
      nameTh: 'Mastery · ผู้เชี่ยวชาญการเขียน',
      description: 'มีความเชี่ยวชาญทั้งโครงสร้าง การเชื่อมโยงความคิด และความถูกต้องทางภาษาในระดับยอดเยี่ยม',
      color: 'var(--accent-emerald)',
      tips: [
        'ท้าทายตนเองด้วยรูปแบบงานเขียนเชิงวิชาการ (Academic Writing)',
        'ช่วยเป็น Mentor ให้คำแนะนำเพื่อนในชั้นเรียน'
      ]
    };
  }

  const structureGood = s.TR >= 3.5 && s.CC >= 3.5;
  const languageStruggling = s.LR < 3 || s.ME < 3 || s.GRA < 3;
  if (structureGood && languageStruggling) {
    return {
      state: 'Language Dev',
      nameTh: 'Language Dev · เด่นโครงสร้าง พัฒนาภาษา',
      description: 'ลำดับความคิดและโครงสร้างเนื้อหาได้ดีมาก แต่ควรเน้นความแม่นยำของไวยากรณ์ การสะกดคำ และการเลือกใช้ศัพท์',
      color: 'var(--accent-cyan)',
      tips: [
        'ตรวจทานเครื่องหมายจุลภาคหน้า FANBOYS ทุกครั้งก่อนส่งงาน',
        'ฝึกจับคู่คำเชื่อมกับชนิดของประโยค Compound Sentences',
        'บันทึกคำศัพท์ใหม่ที่สะกดผิดบ่อยลงในสมุดคำศัพท์ส่วนตัว'
      ]
    };
  }

  if (s.TR >= 3.5 && s.CC < 3) {
    return {
      state: 'Structure OK',
      nameTh: 'Structure OK · เนื้อหาดี จัดระเบียบความคิด',
      description: 'มีประเด็นและไอเดียที่ดี แต่การจัดลำดับย่อหน้าและการใช้คำเชื่อมยังไม่ต่อเนื่อง',
      color: 'var(--accent-amber)',
      tips: [
        'เขียน Outline หรือ Mind Map ลำดับความคิดก่อนลงมือเขียนร่าง',
        'ใช้คำเชื่อม FANBOYS เชื่อมระหว่าง 2 Independent Clauses อย่างเหมาะสม',
        'ตรวจสอบให้แน่ใจว่าแต่ละย่อหน้ามี Topic Sentence ที่ชัดเจน'
      ]
    };
  }

  return {
    state: 'Beginner',
    nameTh: 'Beginner · ระยะเริ่มต้นฝึกฝน',
    description: 'กำลังสร้างรากฐานด้านการเขียน ควรฝึกฝนแต่งประโยคพื้นฐานและความเข้าใจโครงสร้างย่อหน้าเพิ่มเติม',
    color: 'var(--accent-purple)',
    tips: [
      'ทบทวนหลักการใช้ Coordinating Conjunctions (for, and, nor, but, or, yet, so)',
      'ฝึกสร้าง Compound Sentence จากประโยคเดี่ยวทีละคู่',
      'ปรึกษาครูผู้สอนเพื่อขอคำแนะนำเพิ่มเติมเฉพาะจุด'
    ]
  };
}

// 3. CbKST Anomaly Flag (Careless vs Lucky vs OK)
export function evaluateFlag(s: SkillScores, binary: BinaryItemResult[]): EvaluatedResult['flag'] {
  const passedCount = binary.filter(b => b.passed).length;
  const q1 = binary.find(b => b.id === 'q1')?.passed ?? false;
  const q3 = binary.find(b => b.id === 'q3')?.passed ?? false;
  const q2 = binary.find(b => b.id === 'q2')?.passed ?? false;
  const q5 = binary.find(b => b.id === 'q5')?.passed ?? false;
  const q7 = binary.find(b => b.id === 'q7')?.passed ?? false;

  // Careless: High performance overall (>= 6) but failed a basic prerequisite item
  if (passedCount >= 6 && (!q1 || !q3)) {
    return {
      type: 'Careless',
      labelTh: 'ระวังหลุดพื้นฐาน (Careless)',
      color: 'var(--accent-amber)',
      reason: 'คะแนนรวมอยู่ในเกณฑ์สูง แต่พลาดจุดพื้นฐานสำคัญ (เช่น เครื่องหมายวรรคตอนหรือประเด็นหลัก)'
    };
  }

  // Lucky: Low performance overall (<= 3) but passed an advanced item
  if (passedCount <= 3 && (q2 || q5 || q7)) {
    return {
      type: 'Lucky',
      labelTh: 'เดาถูก/ข้ามขั้น (Lucky)',
      color: 'var(--accent-purple)',
      reason: 'ผ่านเกณฑ์ข้อยากแต่ยังไม่ผ่านข้อพื้นฐาน แนะนำทบทวนพื้นฐานให้แน่นหนา'
    };
  }

  return {
    type: 'OK',
    labelTh: 'สม่ำเสมอ (Consistent)',
    color: 'var(--accent-emerald)',
    reason: 'พัฒนาการเป็นไปตามลำดับทักษะ CbKST อย่างเหมาะสม'
  };
}

// 4. Level determination (1 to 5)
export function evaluateLevel(totalScore: number): EvaluatedResult['level'] {
  if (totalScore >= 22) {
    return { level: 5, title: 'CbKST Grandmaster', xp: 100, nextLevelXp: 100 };
  }
  if (totalScore >= 18) {
    const xp = Math.round(75 + ((totalScore - 18) / 4) * 25);
    return { level: 4, title: 'Language Warrior', xp, nextLevelXp: 100 };
  }
  if (totalScore >= 14) {
    const xp = Math.round(50 + ((totalScore - 14) / 4) * 25);
    return { level: 3, title: 'Coherence Crafter', xp, nextLevelXp: 75 };
  }
  if (totalScore >= 8) {
    const xp = Math.round(25 + ((totalScore - 8) / 6) * 25);
    return { level: 2, title: 'Structure Architect', xp, nextLevelXp: 50 };
  }
  const xp = Math.round((totalScore / 8) * 25);
  return { level: 1, title: 'Novice Draftsman', xp, nextLevelXp: 25 };
}

// 5. Badges
export function evaluateBadges(s: SkillScores, flag: FlagType, level: number): EvaluatedResult['badges'] {
  return [
    {
      id: 'structure_ace',
      title: 'Structure Master',
      description: 'ได้คะแนน Task Response และ Coherence เต็ม 5',
      icon: '🏛️',
      unlocked: s.TR >= 4.5 && s.CC >= 4.5
    },
    {
      id: 'grammar_shield',
      title: 'Grammar Shield',
      description: 'ความแม่นยำไวยากรณ์ (GRA) ระดับดีเยี่ยม (>= 4.0)',
      icon: '🛡️',
      unlocked: s.GRA >= 4.0
    },
    {
      id: 'lexical_spark',
      title: 'Lexical Spark',
      description: 'คลังคำศัพท์หลากหลายและสละสลวย (LR >= 4.0)',
      icon: '✨',
      unlocked: s.LR >= 4.0
    },
    {
      id: 'clean_mechanics',
      title: 'Precision Proofreader',
      description: 'การสะกดคำและวรรคตอนถูกต้องสมบูรณ์ (ME >= 4.0)',
      icon: '🎯',
      unlocked: s.ME >= 4.0
    },
    {
      id: 'cbkst_steady',
      title: 'Steady Climber',
      description: 'ผลการประเมินสม่ำเสมอ ไม่พบความผิดปกติ (Flag OK) และถึง Level 3 ขึ้นไป',
      icon: '🌟',
      unlocked: flag === 'OK' && level >= 3
    }
  ];
}

// Master evaluation function
export function evaluateStudentResult(scores: SkillScores): EvaluatedResult {
  const totalScore = Number((scores.TR + scores.ME + scores.LR + scores.GRA + scores.CC).toFixed(1));
  const binaryItems = deriveBinaryItems(scores);
  const binaryTotal = binaryItems.filter(b => b.passed).length;
  const knowledgeState = evaluateKnowledgeState(scores);
  const flag = evaluateFlag(scores, binaryItems);
  const level = evaluateLevel(totalScore);
  const badges = evaluateBadges(scores, flag.type, level.level);

  return {
    scores,
    totalScore,
    maxScore: 25,
    binaryItems,
    binaryTotal,
    binaryMax: 9,
    knowledgeState,
    flag,
    level,
    badges
  };
}
