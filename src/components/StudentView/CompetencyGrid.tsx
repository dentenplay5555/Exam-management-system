import React, { useState } from 'react';
import type { StudentRecord } from '../../types';
import { SKILL_METADATA } from '../../data/mockData';
import { BarChart3, CheckCircle2, XCircle, Info, ChevronRight, Activity } from 'lucide-react';

interface CompetencyGridProps {
  student: StudentRecord;
}

export const CompetencyGrid: React.FC<CompetencyGridProps> = ({ student }) => {
  const [selectedSkill, setSelectedSkill] = useState<keyof typeof SKILL_METADATA>('TR');
  const scores = student.scores;

  const currentMeta = SKILL_METADATA[selectedSkill];
  const currentScore = scores[selectedSkill];

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={20} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
              สมรรถนะการเขียน 5 มิติ (5 Writing Competencies)
            </h3>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            คะแนนรูบริกเต็มด้านละ 5 คะแนน (เกณฑ์ผ่านขั้นต่ำ: 3.0) · คลิกเพื่อดูคำวิเคราะห์เชิงลึก
          </p>
        </div>
        <span style={{ fontSize: 13, color: 'var(--accent-emerald)', fontWeight: 600 }}>
          รวม {student.rubricTotal} / 25 คะแนน
        </span>
      </div>

      {/* 5 Skills Interactive Bars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
        {(['TR', 'ME', 'LR', 'GRA', 'CC'] as const).map((key) => {
          const meta = SKILL_METADATA[key];
          const score = scores[key];
          const passed = score >= 3;
          const isSelected = selectedSkill === key;

          return (
            <div
              key={key}
              onClick={() => setSelectedSkill(key)}
              className="interactive-card"
              style={{
                backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-surface)',
                border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                transition: 'all var(--transition-fast)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: meta.color,
                    letterSpacing: '0.05em'
                  }}>
                    {key}
                  </span>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
                    {meta.name}
                  </div>
                </div>
                <div style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: passed ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  {score}<span style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 400 }}>/5</span>
                </div>
              </div>

              {/* Progress Bar with pass line at 60% */}
              <div style={{
                height: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '999px',
                position: 'relative',
                overflow: 'hidden',
                marginTop: 8
              }}>
                <div style={{
                  height: '100%',
                  width: `${(score / 5) * 100}%`,
                  backgroundColor: meta.color,
                  borderRadius: '999px',
                  transition: 'width 0.6s ease'
                }} />
                {/* 3.0 Pass Marker Line */}
                <div style={{
                  position: 'absolute',
                  left: '60%',
                  top: 0,
                  bottom: 0,
                  width: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.4)'
                }} title="เกณฑ์ผ่านขั้นต่ำ (3.0)" />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, fontSize: 11 }}>
                <span style={{ color: passed ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontWeight: 600 }}>
                  {passed ? '✓ ผ่านเกณฑ์' : '✗ ต้องพัฒนา'}
                </span>
                <span style={{ color: 'var(--text-dim)' }}>คลิกดูคำแนะนำ</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded Skill Insight Box */}
      <div style={{
        backgroundColor: 'rgba(10, 21, 38, 0.8)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-md)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 16,
        flexWrap: 'wrap'
      }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: '12px',
          backgroundColor: `${currentMeta.color}20`,
          border: `1px solid ${currentMeta.color}50`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: currentMeta.color }}>
            {selectedSkill}
          </span>
        </div>

        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h4 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: '#fff' }}>
              {currentMeta.name} ({currentMeta.nameTh})
            </h4>
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '999px',
              backgroundColor: currentScore >= 4 ? 'rgba(16, 185, 129, 0.2)' : currentScore >= 3 ? 'rgba(56, 189, 248, 0.2)' : 'rgba(244, 63, 94, 0.2)',
              color: currentScore >= 4 ? '#34d399' : currentScore >= 3 ? '#38bdf8' : '#fb7185'
            }}>
              {currentScore >= 4 ? 'ระดับเชี่ยวชาญ (Mastery)' : currentScore >= 3 ? 'ระดับผ่านเกณฑ์ (Competent)' : 'ระดับต้องการพัฒนา (Needs Work)'}
            </span>
          </div>

          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
            {currentMeta.desc}
          </p>

          <div style={{
            fontSize: 13,
            color: 'var(--text-main)',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: `3px solid ${currentMeta.color}`
          }}>
            <strong>ข้อเสนอแนะ: </strong>
            {currentScore >= 4
              ? currentMeta.recommendations.high
              : currentScore >= 3
              ? currentMeta.recommendations.medium
              : currentMeta.recommendations.low}
          </div>
        </div>
      </div>
    </div>
  );
};
