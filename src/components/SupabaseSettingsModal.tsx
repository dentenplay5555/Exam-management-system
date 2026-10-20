import React, { useState } from 'react';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
  testSupabaseConnection
} from '../lib/supabase';
import { X, Database, Check, AlertCircle, CheckCircle2, RefreshCw, Key, Globe, Table2, Layers } from 'lucide-react';

interface SupabaseSettingsModalProps {
  onClose: () => void;
  onRefreshDataFromSupabase: () => void;
}

export const SupabaseSettingsModal: React.FC<SupabaseSettingsModalProps> = ({
  onClose,
  onRefreshDataFromSupabase
}) => {
  const currentConfig = getSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string; schemaDetails?: string } | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveSupabaseConfig(url, anonKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTestConnection = async () => {
    saveSupabaseConfig(url, anonKey);
    setIsTesting(true);
    setTestResult(null);

    const result = await testSupabaseConnection();
    setIsTesting(false);
    setTestResult(result);

    if (result.ok) {
      onRefreshDataFromSupabase();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '28px', maxWidth: 680 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              backgroundColor: 'rgba(158, 206, 106, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(158, 206, 106, 0.3)'
            }}>
              <Database size={22} color="var(--accent-emerald)" />
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#fff' }}>
                เชื่อมต่อฐานข้อมูลเดิม Supabase (Real Database)
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                ระบบตรวจพบ Schema เดิมของ PRISM และรองรับการดึงข้อมูลโดยตรง
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Schema Detected Badge */}
        <div style={{
          backgroundColor: 'rgba(122, 162, 247, 0.1)',
          border: '1px solid rgba(122, 162, 247, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 14px',
          marginBottom: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Layers size={15} color="var(--accent-blue)" />
            <strong style={{ fontSize: 13, color: 'var(--accent-blue)' }}>
              โครงสร้าง Schema ที่ระบบรองรับและจะดึงมาอัตโนมัติ:
            </strong>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
            {['students', 'writing_assessments', 'writing_assessment_scores', 'rubric_criteria', 'submissions', 'assignments'].map(table => (
              <span key={table} style={{
                fontSize: 11,
                fontFamily: 'monospace',
                backgroundColor: 'rgba(26, 27, 38, 0.9)',
                color: '#7dcfff',
                padding: '2px 8px',
                borderRadius: 4,
                border: '1px solid rgba(125, 207, 255, 0.25)'
              }}>
                {table}
              </span>
            ))}
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: '6px 0 0' }}>
            ✓ แมปคะแนน TR, ME, LR, GRA, CC, ระดับความสามารถ (Mastery Level), และ Flag (guess_tag) อัตโนมัติ
          </p>
        </div>

        {/* Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
              Supabase Project URL:
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-deep)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              padding: '0 12px'
            }}>
              <Globe size={16} color="var(--text-dim)" style={{ marginRight: 8 }} />
              <input
                type="url"
                placeholder="https://your-project-id.supabase.co"
                value={url}
                onChange={e => setUrl(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 0',
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: 13,
                  outline: 'none'
                }}
              />
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>
              ดูได้จากหน้า Supabase Dashboard → กดปุ่ม Connect ด้านบน หรือ Project Settings → Data API
            </span>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
              Supabase Anon Public Key (eyJ...):
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-deep)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              padding: '0 12px'
            }}>
              <Key size={16} color="var(--text-dim)" style={{ marginRight: 8 }} />
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={e => setAnonKey(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 0',
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: 13,
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Test Status Banner */}
          {testResult && (
            <div style={{
              backgroundColor: testResult.ok ? 'rgba(158, 206, 106, 0.15)' : 'rgba(247, 118, 142, 0.15)',
              border: `1px solid ${testResult.ok ? 'rgba(158, 206, 106, 0.4)' : 'rgba(247, 118, 142, 0.4)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              fontSize: 13,
              color: testResult.ok ? '#9ece6a' : '#f7768e',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              {testResult.ok ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <div>
                <div>{testResult.message}</div>
                {testResult.schemaDetails && (
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>{testResult.schemaDetails}</div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginTop: 4 }}>
            <button
              type="button"
              onClick={() => {
                clearSupabaseConfig();
                setUrl('');
                setAnonKey('');
                setTestResult(null);
              }}
              style={{ fontSize: 12, color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              ล้างค่าคอนฟิก
            </button>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || !url || !anonKey}
                className="btn-secondary"
                style={{ fontSize: 13 }}
              >
                <RefreshCw size={14} className={isTesting ? 'spin-icon' : ''} />
                <span>{isTesting ? 'กำลังเชื่อมต่อ...' : 'ทดสอบ & ดึงข้อมูลจริง'}</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="btn-primary"
                style={{ fontSize: 13 }}
              >
                {saved ? <Check size={14} /> : null}
                <span>{saved ? 'บันทึกแล้ว' : 'บันทึกการตั้งค่า'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
