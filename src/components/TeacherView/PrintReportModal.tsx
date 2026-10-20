import React from 'react';
import type { StudentRecord, ExerciseDefinition } from '../../types';
import { X, Printer } from 'lucide-react';

interface PrintReportModalProps {
  students: StudentRecord[];
  exercise: ExerciseDefinition;
  classRoom: string;
  onClose: () => void;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  students,
  exercise,
  classRoom,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  const total = students.length;
  const submitted = students.filter(s => s.status === 'SUBMITTED').length;
  const avgRubric = (students.reduce((acc, s) => acc + s.rubricTotal, 0) / (total || 1)).toFixed(1);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 900,
          backgroundColor: '#ffffff',
          color: '#1e293b',
          padding: '36px',
          borderRadius: 8
        }}
      >
        {/* Print Toolbar */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid #e2e8f0', paddingBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0f172a' }}>
              พิมพ์รายงานสรุปผลการประเมินรายห้อง
            </h3>
            <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
              ระบบจัดรูปแบบกระดาษ A4 ขาวดำประหยัดหมึกพิมพ์และจัดเก็บแฟ้มผลงาน
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handlePrint}
              style={{
                backgroundColor: '#0284c7',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Printer size={15} />
              <span>พิมพ์ / บันทึก PDF</span>
            </button>
            <button
              onClick={onClose}
              style={{
                backgroundColor: '#f1f5f9',
                color: '#475569',
                padding: '8px 14px',
                borderRadius: 6,
                fontWeight: 500,
                fontSize: 13
              }}
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div id="printable-area">
          <div style={{ textAlign: 'center', marginBottom: 24, borderBottom: '2px solid #0f172a', paddingBottom: 16 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>
              รายงานผลการประเมินการเขียนเชิงวินิจฉัย (PRISM Diagnostic Report)
            </h2>
            <div style={{ fontSize: 14, color: '#475569', marginTop: 4 }}>
              แบบฝึกหัด: {exercise.name} · ห้องเรียน: {classRoom}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              วันที่ออกรายงาน: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-around', backgroundColor: '#f8fafc', padding: '12px', border: '1px solid #e2e8f0', borderRadius: 6, marginBottom: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#64748b' }}>จำนวนนักเรียนทั้งหมด</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{total} คน</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#64748b' }}>ส่งงานแล้ว</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{submitted} คน ({((submitted / (total || 1)) * 100).toFixed(0)}%)</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#64748b' }}>คะแนนเฉลี่ยรูบริก</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{avgRubric} / 25.0</div>
            </div>
          </div>

          {/* Student Scores Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #cbd5e1' }}>เลขที่</th>
                <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #cbd5e1' }}>ชื่อ-นามสกุล</th>
                <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #cbd5e1' }}>TR</th>
                <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #cbd5e1' }}>ME</th>
                <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #cbd5e1' }}>LR</th>
                <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #cbd5e1' }}>GRA</th>
                <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #cbd5e1' }}>CC</th>
                <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #cbd5e1' }}>รวม/25</th>
                <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #cbd5e1' }}>tot/9</th>
                <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #cbd5e1' }}>Knowledge State</th>
                <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #cbd5e1' }}>Flag</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '6px 8px', textAlign: 'center', border: '1px solid #cbd5e1' }}>{s.studentNumber}</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1' }}>{s.fullName}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'center', border: '1px solid #cbd5e1' }}>{s.scores.TR}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'center', border: '1px solid #cbd5e1' }}>{s.scores.ME}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'center', border: '1px solid #cbd5e1' }}>{s.scores.LR}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'center', border: '1px solid #cbd5e1' }}>{s.scores.GRA}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'center', border: '1px solid #cbd5e1' }}>{s.scores.CC}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 700, border: '1px solid #cbd5e1' }}>{s.rubricTotal}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 700, border: '1px solid #cbd5e1' }}>{s.totScore}</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1' }}>{s.knowledgeState}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'center', border: '1px solid #cbd5e1' }}>{s.flag}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Signature Block */}
          <div style={{ marginTop: 40, display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ textAlign: 'center', width: 220 }}>
              <div style={{ borderBottom: '1px solid #475569', height: 40 }} />
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 8 }}>( อาจารย์ผู้สอน )</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>กลุ่มสาระการเรียนรู้ภาษาต่างประเทศ</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
