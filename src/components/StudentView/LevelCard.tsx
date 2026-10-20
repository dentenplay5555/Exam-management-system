import React from 'react';
import type { StudentRecord } from '../../types';
import { Trophy, Star, Sparkles, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LevelCardProps {
  student: StudentRecord;
}

export const LevelCard: React.FC<LevelCardProps> = ({ student }) => {
  const { level, totScore, rubricTotal } = student;

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#38bdf8', '#818cf8', '#34d399', '#f59e0b']
    });
  };

  return (
    <div className="glass-card" style={{
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, rgba(14, 30, 54, 0.95) 0%, rgba(10, 25, 48, 0.9) 100%)'
    }}>
      {/* Background Ambient Glow */}
      <div style={{
        position: 'absolute',
        top: -40,
        right: -40,
        width: 180,
        height: 180,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          {/* Level Crown Badge */}
          <div style={{
            width: 68,
            height: 68,
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(56, 189, 248, 0.4)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            position: 'relative'
          }}>
            <Trophy size={32} color="#050b14" strokeWidth={2.2} />
            <span style={{
              position: 'absolute',
              bottom: -6,
              fontSize: 11,
              fontWeight: 800,
              backgroundColor: '#0f1f38',
              color: 'var(--accent-cyan)',
              padding: '1px 8px',
              borderRadius: '999px',
              border: '1px solid var(--accent-cyan)'
            }}>
              LV.{level.rank}
            </span>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ระดับความสามารถปัจจุบัน
              </span>
              <div style={{ display: 'flex', gap: 2 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={13}
                    fill={star <= level.rank ? '#f59e0b' : 'none'}
                    color={star <= level.rank ? '#f59e0b' : 'var(--text-dim)'}
                  />
                ))}
              </div>
            </div>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 24,
              fontWeight: 700,
              color: '#fff',
              margin: 0
            }}>
              {level.name}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              เก็บคะแนนรวม CbKST: <strong style={{ color: 'var(--accent-cyan)' }}>{totScore}/9 items</strong> · รูบริก: <strong style={{ color: 'var(--accent-emerald)' }}>{rubricTotal}/25</strong>
            </p>
          </div>
        </div>

        {/* Celebration Confetti Action */}
        <button
          onClick={triggerConfetti}
          className="btn-secondary"
          style={{ fontSize: 13, padding: '8px 14px' }}
        >
          <Sparkles size={15} color="var(--accent-cyan)" />
          <span>ฉลองความก้าวหน้า</span>
        </button>
      </div>

      {/* XP Progress Bar */}
      <div style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
          <span style={{ color: 'var(--text-muted)' }}>ค่าประสบการณ์สะสม (XP Progression)</span>
          <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{level.xp} / {level.maxNextXp} XP</span>
        </div>
        <div style={{
          height: 10,
          borderRadius: '999px',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{
            height: '100%',
            width: `${(level.xp / level.maxNextXp) * 100}%`,
            background: 'linear-gradient(90deg, #38bdf8 0%, #818cf8 100%)',
            borderRadius: '999px',
            boxShadow: '0 0 12px rgba(56, 189, 248, 0.6)',
            transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }} />
        </div>
      </div>
    </div>
  );
};
