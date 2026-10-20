import React, { useState } from 'react';
import { Play, Terminal, CheckCircle2, RefreshCw } from 'lucide-react';

interface SyncEngineRunnerProps {
  onSyncComplete: () => void;
}

export const SyncEngineRunner: React.FC<SyncEngineRunnerProps> = ({ onSyncComplete }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    '[2026-10-20 14:20:00] [CRON] Worker Cron Trigger activated (10m interval)',
    '[2026-10-20 14:20:01] [INFO] Target: prism-fanboys-pretest (v1.2.0)',
    '[2026-10-20 14:20:02] [SYNC] GET /hub/submissions?since=cursor_9128 -> 144 rows received',
    '[2026-10-20 14:20:03] [D1] Idempotent upsert: 144 rows written in 3 batches',
    '[2026-10-20 14:20:04] [CACHE] reports_cache invalidated & recomputed for ม.3/1 - ม.3/4',
    '[2026-10-20 14:20:04] [SUCCESS] Sync cycle completed in 412ms'
  ]);

  const handleRunManualSync = () => {
    setIsRunning(true);
    const newLogs: string[] = [];
    const timestamp = new Date().toISOString().slice(11, 19);

    const steps = [
      `[${timestamp}] [MANUAL] Triggering immediate pull via Developer console...`,
      `[${timestamp}] [HMAC] Computing WebCrypto SHA-256 signature for endpoint...`,
      `[${timestamp}] [FETCH] GET /hub/manifest -> schema v1 validated`,
      `[${timestamp}] [FETCH] GET /hub/submissions?cursor=auto -> 24 updated attempts found`,
      `[${timestamp}] [VALIDATE] Zod contract verification: 0 schema anomalies`,
      `[${timestamp}] [D1 BATCH] Executing d1.batch() chunked writes (24 statements)...`,
      `[${timestamp}] [REPORT] Recalculating Knowledge States & item difficulty curve...`,
      `[${timestamp}] [SUCCESS] Hub snapshot up-to-date (24 rows upserted, 280ms)`
    ];

    steps.forEach((msg, idx) => {
      setTimeout(() => {
        setLogs(prev => [msg, ...prev]);
        if (idx === steps.length - 1) {
          setIsRunning(false);
          onSyncComplete();
        }
      }, (idx + 1) * 350);
    });
  };

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Terminal size={20} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
            เครื่องมือจำลอง Sync Engine & Terminal Log Console
          </h3>
        </div>
        <button
          onClick={handleRunManualSync}
          disabled={isRunning}
          className="btn-primary"
          style={{ fontSize: 13, padding: '7px 14px' }}
        >
          <RefreshCw size={14} className={isRunning ? 'spin-icon' : ''} />
          <span>{isRunning ? 'กำลังดำเนินการ Sync...' : 'สั่ง Run Sync ตอนนี้'}</span>
        </button>
      </div>

      <div style={{
        backgroundColor: '#030712',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 16px',
        fontFamily: 'monospace',
        fontSize: 12,
        height: 180,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 6
      }}>
        {logs.map((log, idx) => {
          const isSuccess = log.includes('[SUCCESS]');
          const isWarn = log.includes('[WARNING]');
          return (
            <div
              key={idx}
              style={{
                color: isSuccess ? '#34d399' : isWarn ? '#fbbf24' : '#94a3b8',
                lineHeight: 1.5
              }}
            >
              {log}
            </div>
          );
        })}
      </div>
    </div>
  );
};
