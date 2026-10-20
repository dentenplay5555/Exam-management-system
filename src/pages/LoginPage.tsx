import React, { useState } from 'react';
import { authApi } from '../lib/api';
import { StarfallBackground } from '../components/StarfallBackground';
import { GraduationCap, UserCheck, Terminal, Globe2, Sparkles, ArrowRight, Shield, AlertCircle, Lock, Database } from 'lucide-react';
import type { Role } from '../types';

interface LoginPageProps {
  onDemoLogin: (role: Role) => void;
  onOpenSupabaseModal?: () => void;
}

export const LoginPageNew: React.FC<LoginPageProps> = ({ onDemoLogin, onOpenSupabaseModal }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleLogin = () => {
    setLoading(true);
    setErrorMsg(null);
    // Redirect to Hub API OAuth start endpoint (server-managed session)
    window.location.href = authApi.startGoogleUrl;
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <StarfallBackground />

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ width: '100%', maxWidth: 460 }}>
          {/* Logo & Title */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              background: 'linear-gradient(135deg, #38bdf8, #0284c7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 0 30px rgba(56, 189, 248, 0.4)'
            }}>
              <Sparkles size={32} color="#060e1c" />
            </div>
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 28,
              fontWeight: 800,
              color: '#fff',
              margin: '0 0 6px'
            }}>
              Practice Hub
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
              ระบบจัดการแบบฝึกหัดภาษาอังกฤษ PRISM · CbKST Diagnostic Framework
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 10,
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              fontSize: 11,
              color: 'var(--accent-cyan)'
            }}>
              <Shield size={11} />
              Session-based Auth · Hub API Cookie
            </div>
          </div>

          {/* Main Login Card */}
          <div className="glass-card" style={{ padding: '32px 28px', marginBottom: 16 }}>
            {/* Error */}
            {errorMsg && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                marginBottom: 20,
                fontSize: 13,
                color: 'var(--accent-rose)'
              }}>
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '14px 20px',
                fontSize: 15,
                borderRadius: 'var(--radius-md)',
                marginBottom: 12,
                opacity: loading ? 0.7 : 1,
                justifyContent: 'center'
              }}
            >
              {loading ? (
                <span>กำลังเปลี่ยนหน้าไปยัง Google...</span>
              ) : (
                <>
                  <Globe2 size={20} />
                  <span>เข้าสู่ระบบด้วย Google</span>
                </>
              )}
            </button>

            <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-dim)', marginBottom: 24 }}>
              <Lock size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />
              จัดการ session ผ่าน HttpOnly Cookie บน Hub Worker — ข้อมูลไม่ถูกเก็บในเบราว์เซอร์
            </div>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, backgroundColor: 'var(--border-subtle)' }} />
              <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>หรือทดลองใช้ Demo</span>
              <div style={{ flex: 1, height: 1, backgroundColor: 'var(--border-subtle)' }} />
            </div>

            {/* Demo Login Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={() => onDemoLogin('student')}
                className="btn-secondary"
                style={{ width: '100%', padding: '12px 16px', justifyContent: 'flex-start' }}
              >
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <GraduationCap size={18} color="var(--accent-cyan)" />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
                    ทดลองเป็น นักเรียน (Student)
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    ด.ช. กฤษณะ วงศ์สวัสดิ์ · ม.3/1
                  </div>
                </div>
                <ArrowRight size={14} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
              </button>

              <button
                onClick={() => onDemoLogin('teacher')}
                className="btn-secondary"
                style={{ width: '100%', padding: '12px 16px', justifyContent: 'flex-start' }}
              >
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <UserCheck size={18} color="var(--accent-emerald)" />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
                    ทดลองเป็น ครูผู้สอน (Teacher)
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    อาจารย์สมเกียรติ ยิ่งเจริญ · ม.3/1-4
                  </div>
                </div>
                <ArrowRight size={14} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
              </button>

              <button
                onClick={() => onDemoLogin('dev')}
                className="btn-secondary"
                style={{ width: '100%', padding: '12px 16px', justifyContent: 'flex-start' }}
              >
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: 'rgba(192, 132, 252, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Terminal size={18} color="var(--accent-purple)" />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
                    ทดลองเป็น Dev / ผู้ดูแลระบบ
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Admin · เข้าถึง Dev Console ทั้งหมด
                  </div>
                </div>
                <ArrowRight size={14} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
              </button>
            </div>

            {onOpenSupabaseModal && (
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={onOpenSupabaseModal}
                  style={{
                    background: 'none',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    backgroundColor: 'rgba(16, 185, 129, 0.08)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--accent-emerald)',
                    padding: '8px 16px',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    width: '100%',
                    justifyContent: 'center'
                  }}
                >
                  <Database size={15} />
                  <span>เชื่อมต่อฐานข้อมูล Supabase (ดึงข้อมูลจริง)</span>
                </button>
              </div>
            )}
          </div>

          <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-dim)' }}>
            Practice Hub · โรงเรียนนครสวรรค์ · Cloudflare Workers + D1 · 2026
          </p>
        </div>
      </div>
    </div>
  );
};
