import React, { useState } from 'react';
import type { StudentRecord, ExerciseDefinition } from '../../types';
import { LevelCard } from './LevelCard';
import { KnowledgeStateCard } from './KnowledgeStateCard';
import { CompetencyGrid } from './CompetencyGrid';
import { BinaryItemsGrid } from './BinaryItemsGrid';
import { BadgeCollection } from './BadgeCollection';
import { ConsultTeacherModal } from './ConsultTeacherModal';
import { PracticeRunnerModal } from './PracticeRunnerModal';
import { Calendar, Clock, PlayCircle, MessageSquare, CheckCircle2, AlertCircle } from 'lucide-react';

interface StudentDashboardProps {
  student: StudentRecord;
  exercise: ExerciseDefinition;
  onUpdateScores: (newScores: { TR: number; ME: number; LR: number; GRA: number; CC: number }) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  exercise,
  onUpdateScores
}) => {
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [showPracticeModal, setShowPracticeModal] = useState(false);

  const isSubmitted = student.status === 'SUBMITTED' || student.status === 'COMPLETED';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 60 }}>
      {/* Student Profile Hero Header */}
      <div className="glass-card" style={{
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 20,
        borderLeft: '4px solid var(--accent-cyan)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{
              fontSize: 12,
              fontWeight: 700,
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              color: 'var(--accent-cyan)',
              padding: '2px 8px',
              borderRadius: '6px'
            }}>
              ห้อง {student.classRoom} · เลขที่ {student.studentNumber}
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {student.email}
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 26,
            fontWeight: 800,
            color: '#fff',
            margin: 0
          }}>
            {student.fullName}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8, fontSize: 13, color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={14} color="var(--accent-cyan)" />
              <span>กำหนดส่ง: 25 ต.ค. 2569 (23:59 น.)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={14} color="var(--text-dim)" />
              <span>กิจกรรมล่าสุด: วันนี้ 14:20 น.</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowConsultModal(true)}
            className="btn-secondary"
            style={{ fontSize: 14 }}
          >
            <MessageSquare size={16} />
            <span>ปรึกษาครู</span>
          </button>

          <button
            onClick={() => setShowPracticeModal(true)}
            className="btn-primary"
            style={{ fontSize: 14 }}
          >
            <PlayCircle size={18} />
            <span>{isSubmitted ? 'ทำแบบฝึกหัดทบทวน' : 'เริ่มทำแบบฝึกหัด'}</span>
          </button>
        </div>
      </div>

      {/* Main Diagnostic Blocks */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        <LevelCard student={student} />
        <KnowledgeStateCard student={student} onOpenConsult={() => setShowConsultModal(true)} />
      </div>

      {/* 5 Competencies */}
      <CompetencyGrid student={student} />

      {/* 9 CbKST Items */}
      <BinaryItemsGrid student={student} />

      {/* Badges Shelf */}
      <BadgeCollection badges={student.badges} />

      {/* Modals */}
      {showConsultModal && (
        <ConsultTeacherModal
          student={student}
          onClose={() => setShowConsultModal(false)}
        />
      )}

      {showPracticeModal && (
        <PracticeRunnerModal
          student={student}
          exercise={exercise}
          onClose={() => setShowPracticeModal(false)}
          onSuccessUpdate={onUpdateScores}
        />
      )}
    </div>
  );
};
