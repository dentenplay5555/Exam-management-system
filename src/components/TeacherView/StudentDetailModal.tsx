import React, { useState } from 'react';
import type { StudentRecord } from '../../types';
import { SKILL_METADATA, computeBinaryItems } from '../../data/mockData';
import { X, User, Trophy, AlertTriangle, CheckCircle2, Save, FileText, Check } from 'lucide-react';

interface StudentDetailModalProps {
  student: StudentRecord;
  onClose: () => void;
  onSaveTeacherNotes: (studentId: string, notes: string) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  onClose,
  onSaveTeacherNotes
}) => {
  const [notes, setNotes] = useState(student.teacherNotes || '');
  const [saved, setSaved] = useState(false);

  const binaryItems = computeBinaryItems(student.scores);

  const handleSave = () => {
    onSaveTeacherNotes(student.id, notes);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '28px', maxWidth: 760 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '14px',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(56, 189, 248, 0.3)'
            }}>
              <User size={26} color="var(--accent-cyan)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#fff' }}>
                  {student.fullName}
                </h3>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  เลขที่ {student.studentNumber} (ห้อง {student.classRoom})
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span className={`pill pill-${student.knowledgeState.toLowerCase().replace(' ', '-')}`}>
                  {student.knowledgeState}
                </span>
                <span className={`pill pill-${student.flag.toLowerCase()}`}>
                  Flag: {student.flag}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  อีเมล: {student.email}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Overview Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
          marginBottom: 20
        }}>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px'
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>คะแนนรวมรูบริก</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent-emerald)', marginTop: 2 }}>
              {student.rubricTotal} <span style={{ fontSize: 13, color: 'var(--text-dim)', fontWeight: 400 }}>/ 25</span>
            </div>
          </div>

          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px'
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>CbKST Binary Items</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent-cyan)', marginTop: 2 }}>
              {student.totScore} <span style={{ fontSize: 13, color: 'var(--text-dim)', fontWeight: 400 }}>/ 9 items</span>
            </div>
          </div>

          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px'
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>ระดับความสามารถ (Level)</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginTop: 4 }}>
              {student.level.name}
            </div>
          </div>
        </div>

        {/* 5 Competencies Table */}
        <div style={{ marginBottom: 20 }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 10 }}>
            คะแนนจำแนกตาม 5 สมรรถนะ (5 Competencies)
          </h4>
          <div style={{
            backgroundColor: 'var(--bg-deep)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden'
          }}>
            {(['TR', 'ME', 'LR', 'GRA', 'CC'] as const).map(code => {
              const meta = SKILL_METADATA[code];
              const score = student.scores[code];
              const passed = score >= 3;
              return (
                <div
                  key={code}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 16px',
                    borderBottom: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <strong style={{ color: meta.color, width: 36 }}>{code}</strong>
                    <span style={{ fontSize: 13, color: 'var(--text-main)' }}>{meta.nameTh}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: passed ? 'var(--accent-emerald)' : 'var(--accent-rose)'
                    }}>
                      {passed ? 'ผ่านเกณฑ์' : 'ไม่ผ่าน'}
                    </span>
                    <strong style={{ fontSize: 15, color: '#fff', width: 40, textAlign: 'right' }}>
                      {score} / 5
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 9 CbKST Binary Items */}
        <div style={{ marginBottom: 20 }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 10 }}>
            CbKST 9 Binary Items (q1 - q9)
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {binaryItems.map(item => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 10px',
                  backgroundColor: item.passed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                  border: `1px solid ${item.passed ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.2)'}`,
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <CheckCircle2 size={15} color={item.passed ? 'var(--accent-emerald)' : 'var(--accent-rose)'} />
                <span style={{ fontSize: 12, fontWeight: 700, color: item.passed ? '#fff' : 'var(--text-dim)' }}>
                  {item.id.toUpperCase()}: {item.passed ? 'PASS' : 'FAIL'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Teacher Notes Area */}
        <div style={{
          backgroundColor: 'rgba(56, 189, 248, 0.04)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-md)',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={16} color="var(--accent-cyan)" />
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-cyan)' }}>
                บันทึกคำแนะนำของครูผู้สอน (Teacher Notes)
              </label>
            </div>
            {saved && (
              <span style={{ fontSize: 12, color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Check size={14} /> บันทึกสำเร็จ
              </span>
            )}
          </div>
          <textarea
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="พิมพ์ข้อสังเกต หรือแนวทางส่งเสริมการเรียนรู้สำหรับนักเรียนคนนี้..."
            style={{
              width: '100%',
              padding: '10px 12px',
              backgroundColor: 'var(--bg-deep)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              color: '#fff',
              fontSize: 13,
              outline: 'none',
              marginBottom: 10
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleSave}
              className="btn-primary"
              style={{ fontSize: 12, padding: '6px 14px' }}
            >
              <Save size={14} />
              <span>บันทึกโน้ตครู</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
