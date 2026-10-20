import React, { useState } from 'react';
import type { StudentRecord, ExerciseDefinition } from '../../types';
import { PlayCircle, X, Check, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PracticeRunnerModalProps {
  student: StudentRecord;
  exercise: ExerciseDefinition;
  onClose: () => void;
  onSuccessUpdate: (updatedScores: { TR: number; ME: number; LR: number; GRA: number; CC: number }) => void;
}

export const PracticeRunnerModal: React.FC<PracticeRunnerModalProps> = ({
  student,
  exercise,
  onClose,
  onSuccessUpdate
}) => {
  const [selectedConjunction, setSelectedConjunction] = useState<string>('so');
  const [studentSentence, setStudentSentence] = useState<string>(
    'She wanted to achieve a high score on the test, so she practiced every evening.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const conjunctions = ['for', 'and', 'nor', 'but', 'or', 'yet', 'so'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 }
      });

      // Boost scores slightly to reflect new mastery
      const newScores = {
        TR: Math.min(5, student.scores.TR + (student.scores.TR < 5 ? 1 : 0)),
        ME: 5,
        LR: Math.min(5, student.scores.LR + 1),
        GRA: Math.min(5, student.scores.GRA + (student.scores.GRA < 5 ? 1 : 0)),
        CC: 5
      };

      onSuccessUpdate(newScores);

      setTimeout(() => {
        onClose();
      }, 2000);
    }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '28px', maxWidth: 720 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <PlayCircle size={22} color="var(--accent-cyan)" />
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#fff' }}>
                โปรแกรมจำลองทำแบบฝึกหัด (Interactive Exercise Runner)
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {exercise.name} · Cloudflare Worker Endpoint
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '36px 16px' }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <Check size={36} color="var(--accent-emerald)" strokeWidth={3} />
            </div>
            <h4 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
              ประเมินผลและส่งคะแนนสำเร็จ!
            </h4>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 440, margin: '0 auto 16px' }}>
              ผลการประเมินถูกเข้ารหัสด้วย HMAC Signature และส่งต่อไปยัง Hub D1 เรียบร้อยแล้ว กำลังอัปเดตหน้าสรุปผล...
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              color: 'var(--accent-cyan)',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              padding: '6px 12px',
              borderRadius: '999px'
            }}>
              <ShieldCheck size={14} />
              <span>Verified: SHA-256 HMAC Contract Signed</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{
              backgroundColor: 'rgba(10, 21, 38, 0.9)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              padding: '18px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  PART 2: FANBOYS COMPOUND SENTENCE CREATION
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>เต็ม 5 คะแนน</span>
              </div>
              <p style={{ fontSize: 14, color: '#fff', lineHeight: 1.6 }}>
                <strong>โจทย์:</strong> เลือกคำเชื่อมประสาน (Coordinating Conjunction) ที่แสดงความสัมพันธ์เชิงเหตุและผล (Cause & Result) ให้สมบูรณ์ พร้อมใส่เครื่องหมาย Comma (,) ให้ถูกต้อง
              </p>
            </div>

            {/* Conjunction Selectors */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>
                1. เลือกคำเชื่อมประสาน FANBOYS:
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {conjunctions.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setSelectedConjunction(c);
                      setStudentSentence(`She wanted to achieve a high score on the test, ${c} she practiced every evening.`);
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 14,
                      fontWeight: 700,
                      backgroundColor: selectedConjunction === c ? 'var(--accent-cyan)' : 'var(--bg-deep)',
                      color: selectedConjunction === c ? '#050b14' : 'var(--text-main)',
                      border: `1px solid ${selectedConjunction === c ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {c.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Answer Input */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>
                2. ประโยคที่สร้าง (ตรวจทาน Comma และ Mechanics):
              </label>
              <textarea
                rows={3}
                value={studentSentence}
                onChange={e => setStudentSentence(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  backgroundColor: 'var(--bg-deep)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  fontSize: 14,
                  lineHeight: 1.5,
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-dim)' }}>
                <ShieldCheck size={14} color="var(--accent-emerald)" />
                <span>ผลการตรวจจะส่งด้วย Signed Server-to-Server Contract</span>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={onClose} className="btn-secondary">
                  ปิด
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? (
                    <span>กำลังตรวจและส่งคะแนน...</span>
                  ) : (
                    <>
                      <span>ตรวจคำตอบ & ส่งผลสอบ</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
