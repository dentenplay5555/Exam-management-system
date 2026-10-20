import React, { useState } from 'react';
import type { StudentRecord } from '../../types';
import { MessageSquare, X, Send, CheckCircle2, User } from 'lucide-react';

interface ConsultTeacherModalProps {
  student: StudentRecord;
  onClose: () => void;
}

export const ConsultTeacherModal: React.FC<ConsultTeacherModalProps> = ({ student, onClose }) => {
  const [topic, setTopic] = useState('ขอคำปรึกษาเรื่องไวยากรณ์และการใช้ FANBOYS');
  const [message, setMessage] = useState(
    `สวัสดีครับอาจารย์ ผมอยากขอคำแนะนำเพิ่มเติมเกี่ยวกับจุดที่ยังต้องพัฒนาในมิติ ${student.devNeeds.join(', ') || 'การเขียน'} ครับ`
  );
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <MessageSquare size={20} color="var(--accent-cyan)" />
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#fff' }}>
                ปรึกษาครูผู้สอน (Contact Teacher)
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                ระบบจะส่งสรุปผลการวินิจฉัยแนบไปพร้อมข้อความอัตโนมัติ
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {isSent ? (
          <div style={{ textAlign: 'center', padding: '32px 16px' }}>
            <CheckCircle2 size={48} color="var(--accent-emerald)" style={{ margin: '0 auto 16px' }} />
            <h4 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
              ส่งข้อความเรียบร้อยแล้ว!
            </h4>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              ครูผู้สอนได้รับข้อความและการวินิจฉัยของคุณแล้ว และจะตอบกลับในการเรียนรอบถัดไป
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Student Attached Context Badge */}
            <div style={{
              backgroundColor: 'rgba(56, 189, 248, 0.06)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 12
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>นักเรียน: </span>
                <strong style={{ color: '#fff' }}>{student.fullName} (ม.3/1 เลขที่ {student.studentNumber})</strong>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <span className="pill pill-mastery" style={{ fontSize: 10, padding: '2px 8px' }}>
                  {student.knowledgeState}
                </span>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
                  tot={student.totScore}/9
                </span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                หัวข้อคำถาม
              </label>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  backgroundColor: 'var(--bg-deep)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  fontSize: 14,
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                รายละเอียดข้อความที่ต้องการปรึกษา
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={e => setMessage(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  backgroundColor: 'var(--bg-deep)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  fontSize: 14,
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
              <button type="button" onClick={onClose} className="btn-secondary">
                ยกเลิก
              </button>
              <button type="submit" className="btn-primary">
                <Send size={15} />
                <span>ส่งข้อความ</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
