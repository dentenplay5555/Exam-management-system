import React from 'react';
import type { StudentRecord } from '../../types';
import { BrainCircuit, AlertTriangle, CheckCircle2, HelpCircle, Compass, ArrowRight } from 'lucide-react';

interface KnowledgeStateCardProps {
  student: StudentRecord;
  onOpenConsult: () => void;
}

export const KnowledgeStateCard: React.FC<KnowledgeStateCardProps> = ({ student, onOpenConsult }) => {
  const { knowledgeState, flag, risk, devNeeds } = student;

  const getStateInfo = () => {
    switch (knowledgeState) {
      case 'Mastery':
        return {
          title: 'กลุ่มแตกฉานรอบด้าน (Mastery)',
          color: '#10b981',
          bgClass: 'pill-mastery',
          desc: 'คุณมีความเชี่ยวชาญทั้งการตอบตรงโจทย์ โครงสร้างประโยค ไวยากรณ์ และคำศัพท์ระดับสูง มีความพร้อมสู่การเขียนระดับก้าวหน้า',
          tip: 'ท้าทายตนเองด้วยการเขียน Complex Sentences และย่อหน้าโต้แย้งทางวิชาการ (Argumentative Paragraphs)'
        };
      case 'Language Dev':
        return {
          title: 'กลุ่มเน้นพัฒนาภาษา (Language Dev)',
          color: '#38bdf8',
          bgClass: 'pill-lang-dev',
          desc: 'โครงสร้างและการตอบโจทย์ของคุณดีมาก แต่จุดที่ยังสามารถยกระดับได้คือความแม่นยำทางไวยากรณ์ (GRA) หรือคลังคำศัพท์ (LR)',
          tip: 'จดคำศัพท์เฉพาะทางเพิ่มเติม และตรวจทาน Tense ให้สอดคล้องกันตลอดทั้งประโยค'
        };
      case 'Structure OK':
        return {
          title: 'กลุ่มโครงสร้างผ่านเกณฑ์ (Structure OK)',
          color: '#f59e0b',
          bgClass: 'pill-structure-ok',
          desc: 'สามารถเขียนประโยคความเดียวและเครื่องหมายวรรคตอนได้ถูกต้อง แนะนำพัฒนาการเชื่อมโยงความสอดคล้อง (Coherence)',
          tip: 'ฝึกเชื่อม 2 ประโยคอิสระเข้าด้วยกันโดยใช้เครื่องหมาย Comma (,) ตามด้วยคำเชื่อมกลุ่ม FANBOYS ให้คล่อง'
        };
      case 'Beginner':
      default:
        return {
          title: 'กลุ่มเริ่มต้นพื้นฐาน (Beginner)',
          color: '#f43f5e',
          bgClass: 'pill-beginner',
          desc: 'ต้องการการทบทวนโครงสร้างประโยคพื้นฐาน ไวยากรณ์ และการสะกดคำ เพื่อสร้างรากฐานที่แข็งแกร่งก่อนเริ่มเชื่อมประโยค',
          tip: 'ทำความเข้าใจ Subject + Verb ในประโยคความเดียวก่อน แล้วค่อยๆ ลองใส่คำเชื่อมทีละคู่'
        };
    }
  };

  const stateInfo = getStateInfo();

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BrainCircuit size={20} color={stateInfo.color} />
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
            การวินิจฉัยเชิงพุทธิปัญญา (Cognitive State)
          </h3>
        </div>
        <span className={`pill ${stateInfo.bgClass}`}>
          {stateInfo.title}
        </span>
      </div>

      <p style={{ fontSize: 14, color: 'var(--text-main)', lineHeight: 1.6, marginBottom: 16 }}>
        {stateInfo.desc}
      </p>

      {/* Flag / Anomaly Callout if Careless or Lucky */}
      {flag !== 'OK' && (
        <div style={{
          backgroundColor: flag === 'Careless' ? 'rgba(249, 115, 22, 0.12)' : 'rgba(192, 132, 252, 0.12)',
          border: `1px solid ${flag === 'Careless' ? 'rgba(249, 115, 22, 0.35)' : 'rgba(192, 132, 252, 0.35)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12
        }}>
          <AlertTriangle size={18} color={flag === 'Careless' ? '#fb923c' : '#c084fc'} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <strong style={{ fontSize: 13, color: flag === 'Careless' ? '#fb923c' : '#c084fc' }}>
                {flag === 'Careless' ? 'สัญญาณข้อผิดพลาดพลั้งเผลอ (Careless Slip)' : 'สัญญาณคะแนนกระจายผิดปกติ (Lucky Gap)'}
              </strong>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-main)', margin: 0 }}>
              {flag === 'Careless'
                ? 'คะแนนรวมด้านอื่นของคุณสูงมาก แต่กลับพลาดในเกณฑ์ย่อยพื้นฐาน (เช่น ลืมใส่จุลภาคหรือลืมตรวจการสะกดคำ) ลองตรวจทานก่อนกดส่งครั้งถัดไป'
                : 'คะแนนในภาพรวมยังต้องการการเสริมพื้นฐาน แต่ทำข้อทดสอบย่อยผ่านเกณฑ์ แนะนำให้ทบทวนความเข้าใจหลักการเพื่อความแม่นยำแท้จริง'}
            </p>
          </div>
        </div>
      )}

      {/* Targeted Recommendations */}
      <div style={{
        backgroundColor: 'rgba(56, 189, 248, 0.05)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12
      }}>
        <Compass size={18} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1 }}>
          <strong style={{ fontSize: 13, color: 'var(--accent-cyan)', display: 'block', marginBottom: 2 }}>
            คำแนะนำเฉพาะบุคคลสำหรับรอบถัดไป
          </strong>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
            {stateInfo.tip}
          </p>
          {devNeeds.length > 0 && (
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>ทักษะที่ควรโฟกัสเป็นพิเศษ:</span>
              {devNeeds.map(d => (
                <span key={d} style={{
                  fontSize: 11,
                  fontWeight: 700,
                  backgroundColor: 'rgba(244, 63, 94, 0.15)',
                  color: '#fb7185',
                  padding: '1px 6px',
                  borderRadius: '4px'
                }}>
                  {d}
                </span>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={onOpenConsult}
          className="btn-secondary"
          style={{ fontSize: 12, padding: '6px 12px', whiteSpace: 'nowrap' }}
        >
          <span>ปรึกษาครู</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};
