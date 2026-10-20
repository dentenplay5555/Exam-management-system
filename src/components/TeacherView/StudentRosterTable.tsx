import React, { useState } from 'react';
import type { StudentRecord, KnowledgeStateType, FlagType } from '../../types';
import { Search, Download, Printer, Filter, ChevronUp, ChevronDown, Eye, AlertTriangle } from 'lucide-react';

interface StudentRosterTableProps {
  students: StudentRecord[];
  onSelectStudent: (student: StudentRecord) => void;
  onPrintReport: () => void;
  knowledgeStateFilter: KnowledgeStateType | 'ALL';
  onFilterChange: (state: KnowledgeStateType | 'ALL') => void;
}

export const StudentRosterTable: React.FC<StudentRosterTableProps> = ({
  students,
  onSelectStudent,
  onPrintReport,
  knowledgeStateFilter,
  onFilterChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [flagFilter, setFlagFilter] = useState<FlagType | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUBMITTED' | 'IN_PROGRESS' | 'TODO'>('ALL');
  const [sortBy, setSortBy] = useState<'no' | 'name' | 'rubric' | 'tot'>('no');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter students
  const filtered = students.filter(s => {
    const matchesSearch = s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentNumber.toString().includes(searchTerm) ||
      s.email.toLowerCase().includes(searchTerm);

    const matchesKS = knowledgeStateFilter === 'ALL' || s.knowledgeState === knowledgeStateFilter;
    const matchesFlag = flagFilter === 'ALL' || s.flag === flagFilter;
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;

    return matchesSearch && matchesKS && matchesFlag && matchesStatus;
  });

  // Sort students
  const sorted = [...filtered].sort((a, b) => {
    let factor = sortOrder === 'asc' ? 1 : -1;
    if (sortBy === 'no') return (a.studentNumber - b.studentNumber) * factor;
    if (sortBy === 'name') return a.fullName.localeCompare(b.fullName) * factor;
    if (sortBy === 'rubric') return (a.rubricTotal - b.rubricTotal) * factor;
    if (sortBy === 'tot') return (a.totScore - b.totScore) * factor;
    return 0;
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['เลขที่', 'ชื่อ-นามสกุล', 'อีเมล', 'ห้อง', 'สถานะ', 'TR', 'ME', 'LR', 'GRA', 'CC', 'Rubric รวม', 'tot CbKST', 'Knowledge State', 'Flag', 'Level'];
    const rows = sorted.map(s => [
      s.studentNumber,
      `"${s.fullName}"`,
      s.email,
      s.classRoom,
      s.status,
      s.scores.TR,
      s.scores.ME,
      s.scores.LR,
      s.scores.GRA,
      s.scores.CC,
      s.rubricTotal,
      s.totScore,
      s.knowledgeState,
      s.flag,
      `"${s.level.name}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `PracticeHub_ClassReport_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSort = (field: 'no' | 'name' | 'rubric' | 'tot') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      {/* Table Control Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 14,
        marginBottom: 20
      }}>
        {/* Search Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          backgroundColor: 'var(--bg-deep)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '8px 14px',
          width: '100%',
          maxWidth: 320
        }}>
          <Search size={16} color="var(--text-dim)" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ เลขที่ หรืออีเมล..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: 13,
              width: '100%'
            }}
          />
        </div>

        {/* Filter Dropdowns & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            style={{
              backgroundColor: 'var(--bg-deep)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-main)',
              padding: '8px 12px',
              fontSize: 12,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">สถานะ: ทั้งหมด</option>
            <option value="SUBMITTED">ส่งแล้ว</option>
            <option value="IN_PROGRESS">กำลังทำ</option>
            <option value="TODO">ยังไม่ส่ง</option>
          </select>

          {/* Flag Filter */}
          <select
            value={flagFilter}
            onChange={e => setFlagFilter(e.target.value as any)}
            style={{
              backgroundColor: 'var(--bg-deep)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-main)',
              padding: '8px 12px',
              fontSize: 12,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">Flag: ทั้งหมด</option>
            <option value="OK">ปกติ (OK)</option>
            <option value="Careless">พลั้งเผลอ (Careless)</option>
            <option value="Lucky">คะแนนกระจาย (Lucky)</option>
          </select>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="btn-secondary"
            style={{ fontSize: 13, padding: '7px 14px' }}
            title="ดาวน์โหลดไฟล์คะแนนสรุปห้องเป็น CSV"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>

          {/* Print Report Button */}
          <button
            onClick={onPrintReport}
            className="btn-secondary"
            style={{ fontSize: 13, padding: '7px 14px' }}
            title="เปิดรายงานสำหรับพิมพ์ลงกระดาษ หรือ PDF"
          >
            <Printer size={15} />
            <span>พิมพ์รายงาน</span>
          </button>
        </div>
      </div>

      {/* Roster Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
              <th onClick={() => toggleSort('no')} style={{ padding: '12px 10px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                เลขที่ {sortBy === 'no' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => toggleSort('name')} style={{ padding: '12px 10px', cursor: 'pointer' }}>
                ชื่อ-นามสกุล {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ padding: '12px 10px', textAlign: 'center' }}>สถานะ</th>
              <th style={{ padding: '12px 10px', textAlign: 'center' }}>TR</th>
              <th style={{ padding: '12px 10px', textAlign: 'center' }}>ME</th>
              <th style={{ padding: '12px 10px', textAlign: 'center' }}>LR</th>
              <th style={{ padding: '12px 10px', textAlign: 'center' }}>GRA</th>
              <th style={{ padding: '12px 10px', textAlign: 'center' }}>CC</th>
              <th onClick={() => toggleSort('rubric')} style={{ padding: '12px 10px', textAlign: 'center', cursor: 'pointer', color: 'var(--accent-emerald)' }}>
                รวม /25 {sortBy === 'rubric' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => toggleSort('tot')} style={{ padding: '12px 10px', textAlign: 'center', cursor: 'pointer', color: 'var(--accent-cyan)' }}>
                tot /9 {sortBy === 'tot' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ padding: '12px 10px' }}>Knowledge State</th>
              <th style={{ padding: '12px 10px' }}>Flag</th>
              <th style={{ padding: '12px 10px', textAlign: 'center' }}>รายละเอียด</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={13} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  ไม่พบข้อมูลนักเรียนที่ตรงกับเงื่อนไขการค้นหา
                </td>
              </tr>
            ) : (
              sorted.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => onSelectStudent(s)}
                  className="interactive-card"
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  <td style={{ padding: '12px 10px', fontWeight: 700, color: '#fff' }}>
                    {s.studentNumber}
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{s.fullName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{s.email}</div>
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 4,
                      backgroundColor: s.status === 'SUBMITTED' ? 'rgba(16, 185, 129, 0.15)' : s.status === 'IN_PROGRESS' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                      color: s.status === 'SUBMITTED' ? '#34d399' : s.status === 'IN_PROGRESS' ? '#fbbf24' : '#fb7185'
                    }}>
                      {s.status === 'SUBMITTED' ? 'ส่งแล้ว' : s.status === 'IN_PROGRESS' ? 'กำลังทำ' : 'ยังไม่ส่ง'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'center', color: s.scores.TR >= 3 ? '#fff' : 'var(--accent-rose)' }}>{s.scores.TR}</td>
                  <td style={{ padding: '12px 10px', textAlign: 'center', color: s.scores.ME >= 3 ? '#fff' : 'var(--accent-rose)' }}>{s.scores.ME}</td>
                  <td style={{ padding: '12px 10px', textAlign: 'center', color: s.scores.LR >= 3 ? '#fff' : 'var(--accent-rose)' }}>{s.scores.LR}</td>
                  <td style={{ padding: '12px 10px', textAlign: 'center', color: s.scores.GRA >= 3 ? '#fff' : 'var(--accent-rose)' }}>{s.scores.GRA}</td>
                  <td style={{ padding: '12px 10px', textAlign: 'center', color: s.scores.CC >= 3 ? '#fff' : 'var(--accent-rose)' }}>{s.scores.CC}</td>
                  <td style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                    {s.rubricTotal}
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                    {s.totScore}
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <span className={`pill pill-${s.knowledgeState.toLowerCase().replace(' ', '-')}`}>
                      {s.knowledgeState}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    {s.flag !== 'OK' ? (
                      <span className={`pill pill-${s.flag.toLowerCase()}`}>
                        <AlertTriangle size={12} />
                        <span>{s.flag}</span>
                      </span>
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>OK</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStudent(s);
                      }}
                      style={{ color: 'var(--accent-cyan)', padding: '4px' }}
                      title="เปิดดูรายงานผลรายบุคคล"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
