import React from 'react';
import type { StudentRecord, KnowledgeStateType } from '../../types';
import { SKILL_METADATA, computeBinaryItems } from '../../data/mockData';
import { PieChart, BarChart2, Layers, Sliders } from 'lucide-react';

interface AnalyticsChartsProps {
  students: StudentRecord[];
  onSelectKnowledgeStateFilter?: (state: KnowledgeStateType | 'ALL') => void;
  selectedStateFilter?: KnowledgeStateType | 'ALL';
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  students,
  onSelectKnowledgeStateFilter,
  selectedStateFilter = 'ALL'
}) => {
  const total = students.length || 1;

  // 1. Knowledge State Counts
  const ksCounts: Record<KnowledgeStateType, number> = {
    'Mastery': students.filter(s => s.knowledgeState === 'Mastery').length,
    'Language Dev': students.filter(s => s.knowledgeState === 'Language Dev').length,
    'Structure OK': students.filter(s => s.knowledgeState === 'Structure OK').length,
    'Beginner': students.filter(s => s.knowledgeState === 'Beginner').length,
  };

  // 2. Skill averages & pass percentages
  const skillStats = (['TR', 'ME', 'LR', 'GRA', 'CC'] as const).map(code => {
    const meta = SKILL_METADATA[code];
    const totalScore = students.reduce((acc, s) => acc + s.scores[code], 0);
    const avg = (totalScore / total).toFixed(1);
    const passCount = students.filter(s => s.scores[code] >= 3).length;
    const passPct = Math.round((passCount / total) * 100);
    return { code, meta, avg, passPct, passCount };
  });

  // 3. Item Difficulty (q1 to q9)
  const itemDifficulty = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => {
    const itemId = `q${num}`;
    let passCount = 0;
    students.forEach(s => {
      const items = computeBinaryItems(s.scores);
      const found = items.find(i => i.id === itemId);
      if (found && found.passed) passCount++;
    });
    const passPct = Math.round((passCount / total) * 100);
    const difficultyTag = passPct >= 75 ? 'ง่าย' : passPct >= 50 ? 'ปานกลาง' : 'ยาก';
    const tagColor = passPct >= 75 ? '#34d399' : passPct >= 50 ? '#fbbf24' : '#fb7185';
    return { itemId, passPct, difficultyTag, tagColor, passCount };
  });

  // 4. Score Distribution (Rubric 0-25)
  const scoreRanges = [
    { label: '0-5', count: students.filter(s => s.rubricTotal <= 5).length },
    { label: '6-10', count: students.filter(s => s.rubricTotal >= 6 && s.rubricTotal <= 10).length },
    { label: '11-15', count: students.filter(s => s.rubricTotal >= 11 && s.rubricTotal <= 15).length },
    { label: '16-20', count: students.filter(s => s.rubricTotal >= 16 && s.rubricTotal <= 20).length },
    { label: '21-25', count: students.filter(s => s.rubricTotal >= 21).length },
  ];
  const maxRangeCount = Math.max(...scoreRanges.map(r => r.count), 1);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
      {/* Chart 1: Knowledge State Distribution */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Layers size={18} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
              การกระจายกลุ่ม Knowledge State
            </h3>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>คลิกที่กลุ่มเพื่อกรอง</span>
        </div>

        {/* Stacked Proportional Bar */}
        <div style={{
          height: 14,
          borderRadius: 999,
          overflow: 'hidden',
          display: 'flex',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          marginBottom: 18
        }}>
          <div style={{ width: `${(ksCounts['Mastery'] / total) * 100}%`, backgroundColor: '#10b981' }} title="Mastery" />
          <div style={{ width: `${(ksCounts['Language Dev'] / total) * 100}%`, backgroundColor: '#38bdf8' }} title="Language Dev" />
          <div style={{ width: `${(ksCounts['Structure OK'] / total) * 100}%`, backgroundColor: '#f59e0b' }} title="Structure OK" />
          <div style={{ width: `${(ksCounts['Beginner'] / total) * 100}%`, backgroundColor: '#f43f5e' }} title="Beginner" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(['Mastery', 'Language Dev', 'Structure OK', 'Beginner'] as const).map(ks => {
            const count = ksCounts[ks];
            const pct = Math.round((count / total) * 100);
            const isSelected = selectedStateFilter === ks;

            const colorMap = {
              'Mastery': '#10b981',
              'Language Dev': '#38bdf8',
              'Structure OK': '#f59e0b',
              'Beginner': '#f43f5e'
            };

            return (
              <div
                key={ks}
                onClick={() => onSelectKnowledgeStateFilter && onSelectKnowledgeStateFilter(isSelected ? 'ALL' : ks)}
                className="interactive-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                  border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: colorMap[ks] }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{ks}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{count} คน</span>
                  <span style={{ fontSize: 12, color: 'var(--text-dim)', width: 36, textAlign: 'right' }}>({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart 2: 5 Competency Pass Rate & Room Averages */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sliders size={18} color="var(--accent-indigo)" />
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
              อัตราผ่านเกณฑ์ 5 สมรรถนะ (Pass Rate)
            </h3>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>เกณฑ์ผ่าน ≥ 3.0</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {skillStats.map(s => (
            <div key={s.code}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <strong style={{ fontSize: 13, color: s.meta.color }}>{s.code}</strong>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.meta.name}</span>
                </div>
                <div style={{ fontSize: 12 }}>
                  <span style={{ color: '#fff', fontWeight: 700 }}>เฉลี่ย {s.avg}/5</span>
                  <span style={{ color: 'var(--text-dim)', marginLeft: 6 }}>ผ่าน {s.passPct}%</span>
                </div>
              </div>
              <div style={{ height: 8, backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${s.passPct}%`,
                  backgroundColor: s.meta.color,
                  borderRadius: 999
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart 3: Item Difficulty (q1 to q9) */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart2 size={18} color="var(--accent-emerald)" />
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
              ดัชนีความยากรายข้อ (Item Difficulty)
            </h3>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>CbKST Items</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {itemDifficulty.map(item => (
            <div
              key={item.itemId}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '10px',
                textAlign: 'center'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{item.itemId.toUpperCase()}</span>
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: item.tagColor,
                  backgroundColor: `${item.tagColor}20`,
                  padding: '1px 5px',
                  borderRadius: '3px'
                }}>
                  {item.difficultyTag}
                </span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: item.tagColor, fontFamily: 'var(--font-heading)' }}>
                {item.passPct}%
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                ผ่าน {item.passCount}/{total} คน
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart 4: Score Distribution Histogram */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PieChart size={18} color="var(--accent-amber)" />
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
              การกระจายคะแนนรูบริก (เต็ม 25)
            </h3>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Frequency Histogram</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: 120, paddingTop: 16, borderBottom: '1px solid var(--border-subtle)' }}>
          {scoreRanges.map(r => {
            const barHeight = Math.max((r.count / maxRangeCount) * 90, 8);
            return (
              <div key={r.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: 44 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-cyan)' }}>{r.count}</span>
                <div style={{
                  width: 32,
                  height: barHeight,
                  backgroundColor: 'rgba(56, 189, 248, 0.4)',
                  border: '1px solid var(--accent-cyan)',
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.4s ease'
                }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
