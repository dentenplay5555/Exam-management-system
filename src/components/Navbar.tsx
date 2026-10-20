import React from 'react';
import type { Role, StudentRecord, ExerciseDefinition } from '../types';
import { UserCheck, GraduationCap, LayoutDashboard, Terminal, RefreshCw, Sparkles, Database, LogOut, User } from 'lucide-react';

interface NavbarProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  selectedExercise: ExerciseDefinition;
  onExerciseChange: (ex: ExerciseDefinition) => void;
  exercises: ExerciseDefinition[];
  currentStudent: StudentRecord;
  onStudentChange: (std: StudentRecord) => void;
  students: StudentRecord[];
  onTriggerSync: () => void;
  isSyncing: boolean;
  currentUser: { name: string; email: string; role: Role } | null;
  onLogout: () => void;
  isSupabaseLive: boolean;
  onOpenSupabaseSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  selectedExercise,
  onExerciseChange,
  exercises,
  currentStudent,
  onStudentChange,
  students,
  onTriggerSync,
  isSyncing,
  currentUser,
  onLogout,
  isSupabaseLive,
  onOpenSupabaseSettings
}) => {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: 'rgba(22, 22, 30, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '12px 24px'
    }}>
      <div style={{
        maxWidth: 1440,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #bb9af7 0%, #7aa2f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(187, 154, 247, 0.4)'
          }}>
            <Sparkles size={22} color="#16161e" strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 20,
                fontWeight: 700,
                color: '#fff',
                letterSpacing: '-0.02em'
              }}>
                Practice <span style={{ color: 'var(--accent-cyan)' }}>Hub</span>
              </span>
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: 'rgba(187, 154, 247, 0.18)',
                color: 'var(--accent-purple)',
                border: '1px solid rgba(187, 154, 247, 0.3)'
              }}>
                Tokyo Night
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
              ระบบรวมผลแบบฝึกหัด & CbKST Diagnostic Engine
            </p>
          </div>
        </div>

        {/* Center: Exercise Cycle Tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--bg-surface)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          overflowX: 'auto'
        }}>
          {exercises.map((ex) => {
            const isSelected = ex.id === selectedExercise.id;
            return (
              <button
                key={ex.id}
                onClick={() => onExerciseChange(ex)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 12,
                  fontWeight: isSelected ? 600 : 500,
                  color: isSelected ? 'var(--text-inverse)' : 'var(--text-muted)',
                  backgroundColor: isSelected ? 'var(--accent-cyan)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  whiteSpace: 'nowrap',
                  boxShadow: isSelected ? '0 2px 10px rgba(125, 207, 255, 0.4)' : 'none'
                }}
              >
                <span>{ex.phase}</span>
                {ex.status === 'active' && (
                  <span style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: isSelected ? '#16161e' : '#9ece6a'
                  }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Section: Impersonator, Role Switcher, Supabase Status, User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Quick Impersonator for Student View */}
          {currentRole === 'student' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'rgba(125, 207, 255, 0.08)',
              border: '1px solid rgba(125, 207, 255, 0.25)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-md)'
            }}>
              <UserCheck size={16} color="var(--accent-cyan)" />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>จำลอง:</span>
              <select
                value={currentStudent.id}
                onChange={(e) => {
                  const found = students.find(s => s.id === e.target.value);
                  if (found) onStudentChange(found);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--accent-cyan)',
                  fontSize: 12,
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {students.map(s => (
                  <option key={s.id} value={s.id} style={{ background: '#1a1b26', color: '#c0caf5' }}>
                    {s.studentNumber}. {s.fullName} ({s.knowledgeState})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Role Segmented Controller */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--bg-surface)',
            padding: '3px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            <button
              onClick={() => onRoleChange('student')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 13,
                fontWeight: currentRole === 'student' ? 600 : 400,
                color: currentRole === 'student' ? '#fff' : 'var(--text-muted)',
                backgroundColor: currentRole === 'student' ? 'rgba(125, 207, 255, 0.2)' : 'transparent',
                border: currentRole === 'student' ? '1px solid rgba(125, 207, 255, 0.4)' : '1px solid transparent'
              }}
            >
              <GraduationCap size={15} color={currentRole === 'student' ? 'var(--accent-cyan)' : 'currentColor'} />
              <span>นักเรียน</span>
            </button>

            <button
              onClick={() => onRoleChange('teacher')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 13,
                fontWeight: currentRole === 'teacher' ? 600 : 400,
                color: currentRole === 'teacher' ? '#fff' : 'var(--text-muted)',
                backgroundColor: currentRole === 'teacher' ? 'rgba(187, 154, 247, 0.2)' : 'transparent',
                border: currentRole === 'teacher' ? '1px solid rgba(187, 154, 247, 0.4)' : '1px solid transparent'
              }}
            >
              <LayoutDashboard size={15} color={currentRole === 'teacher' ? 'var(--accent-purple)' : 'currentColor'} />
              <span>ครูผู้สอน</span>
            </button>

            <button
              onClick={() => onRoleChange('dev')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 13,
                fontWeight: currentRole === 'dev' ? 600 : 400,
                color: currentRole === 'dev' ? '#fff' : 'var(--text-muted)',
                backgroundColor: currentRole === 'dev' ? 'rgba(158, 206, 106, 0.2)' : 'transparent',
                border: currentRole === 'dev' ? '1px solid rgba(158, 206, 106, 0.4)' : '1px solid transparent'
              }}
            >
              <Terminal size={15} color={currentRole === 'dev' ? 'var(--accent-emerald)' : 'currentColor'} />
              <span>Dev / Admin</span>
            </button>
          </div>

          {/* Supabase Connection Status Button */}
          <button
            onClick={onOpenSupabaseSettings}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${isSupabaseLive ? 'rgba(158, 206, 106, 0.4)' : 'rgba(224, 175, 104, 0.4)'}`,
              backgroundColor: isSupabaseLive ? 'rgba(158, 206, 106, 0.12)' : 'rgba(224, 175, 104, 0.12)',
              color: isSupabaseLive ? 'var(--accent-emerald)' : 'var(--accent-amber)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer'
            }}
            title="คลิกเพื่อจัดการการเชื่อมต่อ Supabase หรือใส่คีย์ใหม่"
          >
            <Database size={14} />
            <span>{isSupabaseLive ? 'Supabase Live' : 'Supabase Setup'}</span>
          </button>

          {/* Live Sync Trigger Button */}
          <button
            onClick={onTriggerSync}
            disabled={isSyncing}
            title="กดเพื่อสั่ง Cloudflare D1 ทำ Incremental Pull ทันที"
            style={{
              padding: '7px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12
            }}
          >
            <RefreshCw size={14} className={isSyncing ? 'spin-icon' : ''} style={{
              animation: isSyncing ? 'spin 1s linear infinite' : 'none'
            }} />
            <span>{isSyncing ? 'กำลังซิงก์...' : 'ซิงก์ Hub'}</span>
          </button>

          {/* User Profile & Logout */}
          {currentUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 6, borderLeft: '1px solid var(--border-subtle)' }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: 'rgba(187, 154, 247, 0.2)',
                border: '1px solid rgba(187, 154, 247, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                color: '#fff',
                fontWeight: 700
              }}>
                {currentUser.name.slice(0, 2)}
              </div>
              <button
                onClick={onLogout}
                style={{
                  color: 'var(--accent-rose)',
                  backgroundColor: 'rgba(247, 118, 142, 0.12)',
                  border: '1px solid rgba(247, 118, 142, 0.25)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '5px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                  cursor: 'pointer'
                }}
                title="ออกจากระบบกลับไปหน้า Login"
              >
                <LogOut size={13} />
                <span>ออก</span>
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </header>
  );
};
