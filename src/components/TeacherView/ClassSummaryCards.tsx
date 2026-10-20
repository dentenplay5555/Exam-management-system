import React from 'react';
import type { StudentRecord } from '../../types';
import { Users, CheckCircle, Award, AlertTriangle, TrendingUp } from 'lucide-react';

interface ClassSummaryCardsProps {
  students: StudentRecord[];
}

export const ClassSummaryCards: React.FC<ClassSummaryCardsProps> = ({ students }) => {
  const total = students.length;
  const submitted = students.filter(s => s.status === 'SUBMITTED' || s.status === 'COMPLETED').length;
  const submissionRate = total > 0 ? ((submitted / total) * 100).toFixed(1) : '0';

  const avgRubric = total > 0
    ? (students.reduce((acc, s) => acc + s.rubricTotal, 0) / total).toFixed(1)
    : '0';

  const avgTot = total > 0
    ? (students.reduce((acc, s) => acc + s.totScore, 0) / total).toFixed(1)
    : '0';

  const carelessCount = students.filter(s => s.flag === 'Careless').length;
  const luckyCount = students.filter(s => s.flag === 'Lucky').length;
  const beginnerCount = students.filter(s => s.knowledgeState === 'Beginner').length;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
      {/* 1. Submission Rate Card */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>อัตราการส่งงาน</span>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: '8px',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Users size={18} color="var(--accent-cyan)" />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-heading)' }}>
            {submitted}/{total}
          </span>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-cyan)' }}>
            ({submissionRate}%)
          </span>
        </div>
        <div style={{ height: 6, backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 999, marginTop: 12, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${submissionRate}%`, backgroundColor: 'var(--accent-cyan)', borderRadius: 999 }} />
        </div>
      </div>

      {/* 2. Average Rubric Score */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>คะแนนเฉลี่ยรูบริก 5 มิติ</span>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: '8px',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <TrendingUp size={18} color="var(--accent-emerald)" />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-heading)' }}>
            {avgRubric}
          </span>
          <span style={{ fontSize: 14, color: 'var(--text-dim)' }}>
            / 25.0
          </span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--accent-emerald)', marginTop: 8 }}>
          ✓ ร้อยละ {( (Number(avgRubric) / 25) * 100 ).toFixed(1)}% ของเกณฑ์คะแนนเต็ม
        </div>
      </div>

      {/* 3. Average CbKST Items */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>ค่าเฉลี่ยข้อที่ผ่าน (CbKST tot)</span>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: '8px',
            backgroundColor: 'rgba(129, 140, 248, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Award size={18} color="var(--accent-indigo)" />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-heading)' }}>
            {avgTot}
          </span>
          <span style={{ fontSize: 14, color: 'var(--text-dim)' }}>
            / 9.0 items
          </span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--accent-indigo)', marginTop: 8 }}>
          เทียบเท่า Level 3-4 (Coherence / Language)
        </div>
      </div>

      {/* 4. Attention Needed / Anomalies */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>กลุ่มที่ต้องดูแล / พลั้งเผลอ</span>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: '8px',
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertTriangle size={18} color="var(--accent-amber)" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#fb923c' }}>{carelessCount}</span>
            <span style={{ fontSize: 11, color: 'var(--text-dim)', display: 'block' }}>Careless</span>
          </div>
          <div style={{ width: 1, height: 24, backgroundColor: 'var(--border-subtle)' }} />
          <div>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#c084fc' }}>{luckyCount}</span>
            <span style={{ fontSize: 11, color: 'var(--text-dim)', display: 'block' }}>Lucky Gap</span>
          </div>
          <div style={{ width: 1, height: 24, backgroundColor: 'var(--border-subtle)' }} />
          <div>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#fb7185' }}>{beginnerCount}</span>
            <span style={{ fontSize: 11, color: 'var(--text-dim)', display: 'block' }}>Beginner</span>
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 8 }}>
          สามารถกดกรองดูรายชื่อได้ในตาราง
        </div>
      </div>
    </div>
  );
};
