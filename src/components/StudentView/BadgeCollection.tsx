import React from 'react';
import type { Badge } from '../../types';
import { Award, Lock } from 'lucide-react';

interface BadgeCollectionProps {
  badges: Badge[];
}

export const BadgeCollection: React.FC<BadgeCollectionProps> = ({ badges }) => {
  const allBadges: Badge[] = [
    { id: 'b1', title: 'First Draft Hero', desc: 'ส่งงานตรงเวลาเป็นคนแรกๆ', icon: '⚡', unlocked: false, rarity: 'common' },
    { id: 'b2', title: 'Target Sniper', desc: 'TR ≥ 4 ตอบโจทย์แม่นยำ', icon: '🎯', unlocked: false, rarity: 'rare' },
    { id: 'b3', title: 'Bridge Builder', desc: 'เชื่อม FANBOYS ถูกต้องไร้ที่ติ', icon: '🌉', unlocked: false, rarity: 'rare' },
    { id: 'b4', title: 'Sharp Eye', desc: 'ตรวจจับเครื่องหมายและไวยากรณ์แม่นยำ', icon: '🔍', unlocked: false, rarity: 'epic' },
    { id: 'b5', title: 'Grandmaster Crown', desc: 'ผ่านครบ 9 Binary Items ของ CbKST', icon: '👑', unlocked: false, rarity: 'legendary' },
    { id: 'b6', title: 'Cycle Climber', desc: 'คะแนนการเขียนเติบโตขึ้นจากรอบเดิม', icon: '🚀', unlocked: false, rarity: 'epic' },
  ];

  // Merge with student's unlocked badges
  const merged = allBadges.map(b => {
    const studentBadge = badges.find(sb => sb.id === b.id);
    return studentBadge ? { ...b, unlocked: studentBadge.unlocked } : b;
  });

  const unlockedCount = merged.filter(b => b.unlocked).length;

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Award size={20} color="#f59e0b" />
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
            เหรียญตราเกียรติยศ (Achievement Badges)
          </h3>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          ปลดล็อกแล้ว <strong style={{ color: '#f59e0b' }}>{unlockedCount}</strong> / {merged.length} เหรียญ
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12 }}>
        {merged.map((badge) => (
          <div
            key={badge.id}
            style={{
              padding: '14px 12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: badge.unlocked ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255, 255, 255, 0.02)',
              border: `1px solid ${badge.unlocked ? 'rgba(245, 158, 11, 0.3)' : 'var(--border-subtle)'}`,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              opacity: badge.unlocked ? 1 : 0.45,
              transition: 'all var(--transition-fast)'
            }}
          >
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: badge.unlocked ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              boxShadow: badge.unlocked ? '0 0 15px rgba(245, 158, 11, 0.3)' : 'none'
            }}>
              {badge.unlocked ? badge.icon : <Lock size={18} color="var(--text-dim)" />}
            </div>

            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: badge.unlocked ? '#fff' : 'var(--text-dim)' }}>
                {badge.title}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2, lineHeight: 1.3 }}>
                {badge.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
