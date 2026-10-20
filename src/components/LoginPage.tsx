import React, { useState } from 'react';
import type { Role } from '../types';
import { getSupabaseConfig, signInWithGoogle } from '../lib/supabase';
import { Sparkles, ShieldCheck, Database, ArrowRight, UserCheck, GraduationCap, LayoutDashboard, Terminal, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: { name: string; email: string; role: Role }) => void;
  onOpenSupabaseSettings: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onOpenSupabaseSettings
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const supabaseConfig = getSupabaseConfig();

  // Handle Google OAuth
  const handleGoogleLogin = async () => {
    if (!supabaseConfig.isConfigured) {
      setErrorMsg('กรุณาตั้งค่า Supabase URL และ Anon Key ก่อน (กดปุ่ม "ตั้งค่า Supabase" ด้านล่าง)');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      await signInWithGoogle();
      // Redirects to Google
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ');
    }
  };

  // Quick One-Click Demo Logins
  const handleQuickLogin = (role: Role) => {
    if (role === 'student') {
      onLoginSuccess({
        name: 'ด.ช. กฤษณะ วงศ์สวัสดิ์',
        email: '52001.kritsana@student.nssc.ac.th',
        role: 'student'
      });
    } else if (role === 'teacher') {
      onLoginSuccess({
        name: 'อาจารย์สมเกียรติ ยิ่งเจริญ',
        email: 'somkiat.teacher@nssc.ac.th',
        role: 'teacher'
      });
    } else {
      onLoginSuccess({
        name: 'Dev Admin (System)',
        email: 'admin@nssc.ac.th',
        role: 'dev'
      });
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      position: 'relative'
    }}>
      <div className="glass-card" style={{
        maxWidth: 480,
        width: '100%',
        padding: '36px 32px',
        borderRadius: '20px',
        border: '1px solid rgba(187, 154, 247, 0.3)',
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.6), 0 0 30px rgba(187, 154, 247, 0.2)',
        position: 'relative',
        zIndex: 10
      }}>
        {/* App Logo & Title */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #bb9af7 0%, #7aa2f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(187, 154, 247, 0.4)'
          }}>
            <Sparkles size={28} color="#16161e" strokeWidth={2.4} />
          </div>

          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 26,
            fontWeight: 800,
            color: '#fff',
            margin: '0 0 6px',
            letterSpacing: '-0.02em'
          }}>
            Practice <span style={{ color: 'var(--accent-cyan)' }}>Hub</span>
          </h1>

          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
            ระบบรวมสถานะ & CbKST Diagnostic Engine · โรงเรียนนครสวรรค์
          </p>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 10,
            fontSize: 11,
            backgroundColor: 'rgba(125, 207, 255, 0.12)',
            color: 'var(--accent-cyan)',
            padding: '2px 10px',
            borderRadius: 999,
            border: '1px solid rgba(125, 207, 255, 0.3)'
          }}>
            <span>Tokyo Night Edition</span>
          </div>
        </div>

        {errorMsg && (
          <div style={{
            backgroundColor: 'rgba(247, 118, 142, 0.15)',
            border: '1px solid rgba(247, 118, 142, 0.4)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            fontSize: 13,
            color: '#f7768e',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 20
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. Primary Google OAuth Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            backgroundColor: '#ffffff',
            color: '#1f2937',
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            fontSize: 15,
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(255, 255, 255, 0.25)',
            transition: 'all 0.2s ease',
            marginBottom: 16
          }}
        >
          {/* Google G SVG Icon */}
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{loading ? 'กำลังเชื่อมต่อ OAuth...' : 'เข้าสู่ระบบด้วย Google Account'}</span>
        </button>

        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-dim)', marginBottom: 24 }}>
          รองรับโดเมน <code>@student.nssc.ac.th</code> และอีเมลครูผู้สอน
        </div>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          margin: '20px 0',
          color: 'var(--text-dim)',
          fontSize: 12
        }}>
          <div style={{ flex: 1, height: 1, backgroundColor: 'var(--border-subtle)' }} />
          <span>หรือเข้าใช้งานทันที (One-Click Demo Mode)</span>
          <div style={{ flex: 1, height: 1, backgroundColor: 'var(--border-subtle)' }} />
        </div>

        {/* 3 Quick Role Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          <button
            onClick={() => handleQuickLogin('student')}
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'space-between', padding: '10px 16px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <GraduationCap size={18} color="var(--accent-cyan)" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>เข้าโหมด นักเรียน (Student)</div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>ดูผลสอบ CbKST, ทำแบบฝึก, เหรียญตรา</div>
              </div>
            </div>
            <ArrowRight size={15} color="var(--text-dim)" />
          </button>

          <button
            onClick={() => handleQuickLogin('teacher')}
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'space-between', padding: '10px 16px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <LayoutDashboard size={18} color="var(--accent-indigo)" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>เข้าโหมด ครูผู้สอน (Teacher)</div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>รายงานวิเคราะห์ชั้นเรียน, Export CSV, พิมพ์ A4</div>
              </div>
            </div>
            <ArrowRight size={15} color="var(--text-dim)" />
          </button>

          <button
            onClick={() => handleQuickLogin('dev')}
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'space-between', padding: '10px 16px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Terminal size={18} color="var(--accent-emerald)" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>เข้าโหมด Dev / Admin</div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>ลงทะเบียน Worker, Sync Engine, Audit</div>
              </div>
            </div>
            <ArrowRight size={15} color="var(--text-dim)" />
          </button>
        </div>

        {/* Supabase Connection Setup Link */}
        <div style={{
          backgroundColor: 'rgba(26, 27, 38, 0.8)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Database size={16} color="var(--accent-emerald)" />
            <div style={{ fontSize: 12 }}>
              <span style={{ color: 'var(--text-muted)' }}>สถานะ Supabase: </span>
              <strong style={{ color: supabaseConfig.isConfigured ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                {supabaseConfig.isConfigured ? 'พร้อมเชื่อมต่อ' : 'ยังไม่ระบุคีย์'}
              </strong>
            </div>
          </div>
          <button
            onClick={onOpenSupabaseSettings}
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--accent-cyan)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            ตั้งค่า Supabase
          </button>
        </div>
      </div>
    </div>
  );
};
