import React, { useState } from 'react';
import type { ExerciseDefinition, SyncLogEntry, AuditLogEntry } from '../../types';
import { RegisterExerciseModal } from './RegisterExerciseModal';
import { SyncEngineRunner } from './SyncEngineRunner';
import { Server, Plus, ShieldCheck, Key, RefreshCw, Terminal, CheckCircle2, AlertCircle, Database, Check } from 'lucide-react';

interface DevDashboardProps {
  exercises: ExerciseDefinition[];
  onAddExercise: (newEx: ExerciseDefinition) => void;
  syncLogs: SyncLogEntry[];
  auditLogs: AuditLogEntry[];
  onTriggerSync: () => void;
}

export const DevDashboard: React.FC<DevDashboardProps> = ({
  exercises,
  onAddExercise,
  syncLogs,
  auditLogs,
  onTriggerSync
}) => {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [rotatedId, setRotatedId] = useState<string | null>(null);

  const handleRotateSecret = (id: string) => {
    setRotatedId(id);
    setTimeout(() => setRotatedId(null), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 60 }}>
      {/* Dev Header */}
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
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <Server size={22} color="var(--accent-emerald)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, margin: 0, color: '#fff' }}>
                ระบบควบคุมผู้ดูแลระบบ (Developer & Registry Dashboard)
              </h1>
              <span className="pill pill-mastery" style={{ fontSize: 11, padding: '2px 8px' }}>
                Cloudflare Worker Hub API
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '2px 0 0' }}>
              จัดการ Exercise Endpoints, ลายเซ็น HMAC, และตรวจสอบความสม่ำเสมอของฐานข้อมูล D1
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowRegisterModal(true)}
          className="btn-primary"
          style={{ fontSize: 13, padding: '8px 16px' }}
        >
          <Plus size={16} />
          <span>ลงทะเบียนแบบฝึกหัดใหม่</span>
        </button>
      </div>

      {/* System Infrastructure Health Indicators */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '10px',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Database size={20} color="var(--accent-cyan)" />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>ฐานข้อมูลหลัก (Primary DB)</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginTop: 2 }}>
              Cloudflare D1 (SQLite)
            </div>
            <div style={{ fontSize: 11, color: 'var(--accent-emerald)' }}>● พร้อมทำงาน (Latency 8ms)</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '10px',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldCheck size={20} color="var(--accent-emerald)" />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>ความปลอดภัยของสัญญา (Contract)</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginTop: 2 }}>
              HMAC SHA-256 Signed
            </div>
            <div style={{ fontSize: 11, color: 'var(--accent-emerald)' }}>● ป้องกันการยิงคะแนนตรงจาก Browser</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '10px',
            backgroundColor: 'rgba(129, 140, 248, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Key size={20} color="var(--accent-indigo)" />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>การเข้ารหัสข้อมูลลับ (Secrets)</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginTop: 2 }}>
              AES-GCM Encrypted
            </div>
            <div style={{ fontSize: 11, color: 'var(--accent-cyan)' }}>● Secret ใน D1 ถูกถอดรหัสเฉพาะ Runtime</div>
          </div>
        </div>
      </div>

      {/* Connected Exercises Registry Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#fff' }}>
            รายการแบบฝึกหัดที่เชื่อมต่อในระบบ (Exercise Endpoints Registry)
          </h3>
          <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>
            ทั้งหมด {exercises.length} ชุดแบบฝึกหัด
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px' }}>ชื่อแบบฝึกหัด</th>
                <th style={{ padding: '10px' }}>Endpoint Worker URL</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Manifest</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>สถานะ</th>
                <th style={{ padding: '10px' }}>ซิงก์ล่าสุด</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {exercises.map((ex) => (
                <tr key={ex.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 10px' }}>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{ex.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>ID: {ex.id}</div>
                  </td>
                  <td style={{ padding: '12px 10px', fontFamily: 'monospace', fontSize: 12, color: 'var(--accent-cyan)' }}>
                    {ex.baseUrl}
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                    <span style={{
                      fontSize: 11,
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      padding: '2px 8px',
                      borderRadius: 4
                    }}>
                      v{ex.manifestVersion}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--accent-emerald)',
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      padding: '2px 8px',
                      borderRadius: 999
                    }}>
                      ● สมบูรณ์ (Verified)
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-muted)', fontSize: 12 }}>
                    {ex.lastSyncAt}
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                      <button
                        onClick={() => handleRotateSecret(ex.id)}
                        className="btn-secondary"
                        style={{ fontSize: 11, padding: '4px 10px' }}
                      >
                        {rotatedId === ex.id ? (
                          <span style={{ color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Check size={12} /> ผลัดกุญแจแล้ว
                          </span>
                        ) : (
                          <span>ผลัดกุญแจ (Rotate)</span>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sync Engine Runner & Console */}
      <SyncEngineRunner onSyncComplete={onTriggerSync} />

      {/* Audit Log Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px', color: '#fff' }}>
          บันทึกการกระทำที่สำคัญ (Security Audit Trail)
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '8px 10px' }}>เวลา</th>
                <th style={{ padding: '8px 10px' }}>ผู้ดำเนินการ</th>
                <th style={{ padding: '8px 10px' }}>Action</th>
                <th style={{ padding: '8px 10px' }}>เป้าหมาย</th>
                <th style={{ padding: '8px 10px' }}>IP / Agent</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-main)' }}>
                  <td style={{ padding: '8px 10px', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>{log.timestamp}</td>
                  <td style={{ padding: '8px 10px', fontWeight: 600 }}>{log.actor}</td>
                  <td style={{ padding: '8px 10px' }}>
                    <span style={{
                      backgroundColor: 'rgba(56, 189, 248, 0.1)',
                      color: 'var(--accent-cyan)',
                      padding: '1px 6px',
                      borderRadius: 4,
                      fontWeight: 700,
                      fontSize: 11
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '8px 10px', fontFamily: 'monospace' }}>{log.target}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--text-dim)' }}>{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Register Exercise */}
      {showRegisterModal && (
        <RegisterExerciseModal
          onClose={() => setShowRegisterModal(false)}
          onAddExercise={onAddExercise}
        />
      )}
    </div>
  );
};
