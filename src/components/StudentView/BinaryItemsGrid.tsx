import React from 'react';
import type { StudentRecord } from '../../types';
import { computeBinaryItems } from '../../data/mockData';
import { CheckCircle2, XCircle, FileCheck2 } from 'lucide-react';

interface BinaryItemsGridProps {
  student: StudentRecord;
}

export const BinaryItemsGrid: React.FC<BinaryItemsGridProps> = ({ student }) => {
  const binaryItems = computeBinaryItems(student.scores);
  const passedCount = binaryItems.filter(i => i.passed).length;

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileCheck2 size={20} color="var(--accent-indigo)" />
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
            CbKST 9 Binary Items (เกณฑ์ประเมินทักษะย่อยตามแบบจำลอง)
          </h3>
        </div>
        <span style={{
          fontSize: 13,
          fontWeight: 700,
          backgroundColor: 'rgba(129, 140, 248, 0.15)',
          color: 'var(--accent-indigo)',
          padding: '3px 10px',
          borderRadius: '999px',
          border: '1px solid rgba(129, 140, 248, 0.3)'
        }}>
          ผ่าน {passedCount} จาก 9 ข้อ (tot = {student.totScore})
        </span>
      </div>

      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
        รายการทดสอบ CbKST คำนวณจากเกณฑ์รูบริกเพื่อระบุสถานะองค์ความรู้และทักษะที่ปลดล็อกแล้วอย่างแม่นยำ
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
        {binaryItems.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              backgroundColor: item.passed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.06)',
              border: `1px solid ${item.passed ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.2)'}`,
              borderRadius: 'var(--radius-md)'
            }}
          >
            {item.passed ? (
              <CheckCircle2 size={18} color="var(--accent-emerald)" style={{ flexShrink: 0 }} />
            ) : (
              <XCircle size={18} color="var(--accent-rose)" style={{ flexShrink: 0 }} />
            )}

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: item.passed ? '#fff' : 'var(--text-muted)' }}>
                  {item.id.toUpperCase()}
                </span>
                <span style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: item.passed ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                  backgroundColor: item.passed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                  padding: '1px 5px',
                  borderRadius: '3px'
                }}>
                  {item.passed ? 'PASS' : 'FAIL'}
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.ruleDesc}>
                {item.ruleDesc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
