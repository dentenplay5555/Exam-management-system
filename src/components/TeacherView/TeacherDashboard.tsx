import React, { useState } from 'react';
import type { StudentRecord, ExerciseDefinition, KnowledgeStateType } from '../../types';
import { ClassSummaryCards } from './ClassSummaryCards';
import { AnalyticsCharts } from './AnalyticsCharts';
import { StudentRosterTable } from './StudentRosterTable';
import { StudentDetailModal } from './StudentDetailModal';
import { PrintReportModal } from './PrintReportModal';
import { School, BookOpen, Clock, RefreshCw } from 'lucide-react';

interface TeacherDashboardProps {
  students: StudentRecord[];
  exercise: ExerciseDefinition;
  onSaveTeacherNotes: (studentId: string, notes: string) => void;
  onTriggerSync: () => void;
  isSyncing: boolean;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  students,
  exercise,
  onSaveTeacherNotes,
  onTriggerSync,
  isSyncing
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('ม.3/1');
  const [knowledgeStateFilter, setKnowledgeStateFilter] = useState<KnowledgeStateType | 'ALL'>('ALL');
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  // Filter students by selected classroom
  const classStudents = students.filter(s => s.classRoom === selectedClass);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 60 }}>
      {/* Teacher Top Bar / Class Selector */}
      <div className="glass-card" style={{
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: '12px',
            backgroundColor: 'rgba(129, 140, 248, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(129, 140, 248, 0.3)'
          }}>
            <School size={22} color="var(--accent-indigo)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, margin: 0, color: '#fff' }}>
                รายงานวิเคราะห์ผลการเรียนรู้รายห้อง (Class Report)
              </h1>
              <span className="pill pill-mastery" style={{ fontSize: 11, padding: '2px 8px' }}>
                ม.3 ทั้งระดับ
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '2px 0 0' }}>
              แบบฝึกหัด: <strong style={{ color: 'var(--accent-cyan)' }}>{exercise.name}</strong>
            </p>
          </div>
        </div>

        {/* Classroom Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>เลือกห้องเรียน:</span>
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-deep)',
            padding: 3,
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            {['ม.3/1', 'ม.3/2', 'ม.3/3', 'ม.3/4'].map(cls => (
              <button
                key={cls}
                onClick={() => {
                  setSelectedClass(cls);
                  setKnowledgeStateFilter('ALL');
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 13,
                  fontWeight: selectedClass === cls ? 700 : 500,
                  backgroundColor: selectedClass === cls ? 'var(--accent-indigo)' : 'transparent',
                  color: selectedClass === cls ? '#fff' : 'var(--text-muted)',
                  transition: 'all 0.15s ease'
                }}
              >
                {cls}
              </button>
            ))}
          </div>

          <button
            onClick={onTriggerSync}
            disabled={isSyncing}
            className="btn-secondary"
            style={{ fontSize: 13, padding: '7px 12px' }}
          >
            <RefreshCw size={14} className={isSyncing ? 'spin-icon' : ''} />
            <span>{isSyncing ? 'กำลังซิงก์...' : 'ดึงคะแนนล่าสุด'}</span>
          </button>
        </div>
      </div>

      {/* 4 Executive KPI Cards */}
      <ClassSummaryCards students={classStudents} />

      {/* 4 Analytical Charts */}
      <AnalyticsCharts
        students={classStudents}
        selectedStateFilter={knowledgeStateFilter}
        onSelectKnowledgeStateFilter={setKnowledgeStateFilter}
      />

      {/* Interactive Student Roster Table */}
      <StudentRosterTable
        students={classStudents}
        onSelectStudent={setSelectedStudent}
        onPrintReport={() => setShowPrintModal(true)}
        knowledgeStateFilter={knowledgeStateFilter}
        onFilterChange={setKnowledgeStateFilter}
      />

      {/* Modal: Student Detail Drawer */}
      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onSaveTeacherNotes={onSaveTeacherNotes}
        />
      )}

      {/* Modal: Print Report */}
      {showPrintModal && (
        <PrintReportModal
          students={classStudents}
          exercise={exercise}
          classRoom={selectedClass}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
};
