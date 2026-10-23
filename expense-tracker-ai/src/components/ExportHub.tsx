'use client';

import { useState, useMemo, useRef } from 'react';
import { Expense } from '@/types';
import { CATEGORIES, CATEGORY_CONFIG } from '@/utils/categories';
import { formatDate } from '@/utils/date';
import { formatCurrency } from '@/utils/currency';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import {
  ExportFormat,
  EXPORT_TEMPLATES,
  TemplateId,
  runTemplateExport,
} from '@/utils/export';

// ─── Types ────────────────────────────────────────────────────────────────────

interface HistoryEntry {
  id: string;
  templateName: string;
  templateIcon: string;
  format: ExportFormat;
  timestamp: string;
  recordCount: number;
  sizeKb: number;
  status: 'success' | 'failed';
}

interface ScheduleConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  dayOfWeek: number;
  time: string;
  format: ExportFormat;
  destination: 'email' | 'dropbox' | 'onedrive' | 'google-drive';
  email: string;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_HISTORY: HistoryEntry[] = [
  { id: 'h1', templateName: 'Tax Report',        templateIcon: '📊', format: 'csv',  timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),      recordCount: 25, sizeKb: 4.2, status: 'success' },
  { id: 'h2', templateName: 'Monthly Summary',   templateIcon: '📅', format: 'pdf',  timestamp: new Date(Date.now() - 86400 * 1000).toISOString(),        recordCount: 12, sizeKb: 2.1, status: 'success' },
  { id: 'h3', templateName: 'Full Backup',       templateIcon: '💾', format: 'json', timestamp: new Date(Date.now() - 3 * 86400 * 1000).toISOString(),    recordCount: 25, sizeKb: 8.4, status: 'success' },
  { id: 'h4', templateName: 'Category Analysis', templateIcon: '🥧', format: 'csv',  timestamp: new Date(Date.now() - 7 * 86400 * 1000).toISOString(),    recordCount: 25, sizeKb: 3.8, status: 'failed'  },
];

const DEFAULT_SCHEDULE: ScheduleConfig = {
  enabled: false, frequency: 'weekly', dayOfWeek: 1,
  time: '09:00', format: 'csv', destination: 'email', email: '',
};

const INTEGRATIONS = [
  { id: 'google-sheets', name: 'Google Sheets', icon: '📊', color: 'text-green-600',  bg: 'bg-green-50',  desc: 'Auto-export rows to a live Google Sheet' },
  { id: 'dropbox',       name: 'Dropbox',        icon: '📦', color: 'text-blue-600',   bg: 'bg-blue-50',   desc: 'Automatic backup to your Dropbox folder' },
  { id: 'onedrive',      name: 'OneDrive',        icon: '🔷', color: 'text-sky-600',    bg: 'bg-sky-50',    desc: 'Sync exports to Microsoft OneDrive' },
  { id: 'notion',        name: 'Notion',          icon: '🗒️', color: 'text-gray-800',   bg: 'bg-gray-50',   desc: 'Push expenses into a Notion database' },
  { id: 'slack',         name: 'Slack',           icon: '💬', color: 'text-purple-600', bg: 'bg-purple-50', desc: 'Get notified in Slack when backups run' },
  { id: 'zapier',        name: 'Zapier',          icon: '⚡', color: 'text-orange-600', bg: 'bg-orange-50', desc: 'Trigger any automation on export events' },
];

type Tab = 'templates' | 'share' | 'schedule' | 'history' | 'integrations';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - Date.parse(iso);
  const min = Math.floor(diff / 60000);
  if (min < 2) return 'Just now';
  if (min < 60) return `${min} min ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return '1 week ago';
}

function computeNextBackup(cfg: ScheduleConfig): string {
  if (!cfg.enabled) return '—';
  const now = new Date();
  const [h, m] = cfg.time.split(':').map(Number);
  const next = new Date(now);
  next.setHours(h, m, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  if (cfg.frequency === 'weekly') {
    while (next.getDay() !== cfg.dayOfWeek) next.setDate(next.getDate() + 1);
  } else if (cfg.frequency === 'monthly') {
    next.setDate(1);
    if (next <= now) next.setMonth(next.getMonth() + 1);
  }
  return next.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + ' at ' + cfg.time;
}

function generateToken(): string {
  return Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

// ─── QR Code SVG ─────────────────────────────────────────────────────────────

function QrCode({ token, size = 160 }: { token: string; size?: number }) {
  const cellSize = size / 21;

  // Position detection pattern (7×7) at given grid offset
  function detectionPattern(ox: number, oy: number) {
    const rects = [];
    // outer 7×7 filled
    rects.push(<rect key="o" x={ox * cellSize} y={oy * cellSize} width={7 * cellSize} height={7 * cellSize} fill="#111" />);
    // white 5×5
    rects.push(<rect key="w" x={(ox + 1) * cellSize} y={(oy + 1) * cellSize} width={5 * cellSize} height={5 * cellSize} fill="white" />);
    // inner 3×3 filled
    rects.push(<rect key="i" x={(ox + 2) * cellSize} y={(oy + 2) * cellSize} width={3 * cellSize} height={3 * cellSize} fill="#111" />);
    return rects;
  }

  // Deterministic data cells seeded from token
  const dataCells: JSX.Element[] = [];
  let charIdx = 0;
  for (let row = 0; row < 21; row++) {
    for (let col = 0; col < 21; col++) {
      // Skip detection pattern zones
      if ((row < 8 && col < 8) || (row < 8 && col > 12) || (row > 12 && col < 8)) continue;
      const seed = token.charCodeAt(charIdx % token.length) + row * 3 + col * 7;
      charIdx++;
      if (seed % 2 === 0) {
        dataCells.push(<rect key={`${row}-${col}`} x={col * cellSize} y={row * cellSize} width={cellSize} height={cellSize} fill="#111" />);
      }
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      <rect width={size} height={size} fill="#f9fafb" rx="4" />
      {dataCells}
      {detectionPattern(0, 0)}
      {detectionPattern(14, 0)}
      {detectionPattern(0, 14)}
    </svg>
  );
}

// ─── Tab: Templates ──────────────────────────────────────────────────────────

function TemplatesTab({ expenses, onExported }: { expenses: Expense[]; onExported: (entry: HistoryEntry) => void }) {
  const [flashed, setFlashed] = useState<Record<string, boolean>>({});

  const templateCounts = useMemo(() => {
    const now = new Date();
    const yearPrefix = `${now.getFullYear()}-`;
    const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return {
      'tax-report':        expenses.filter((e) => e.date.startsWith(yearPrefix)).length,
      'monthly-summary':   expenses.filter((e) => e.date.startsWith(monthPrefix)).length,
      'category-analysis': expenses.length,
      'full-backup':       expenses.length,
    } as Record<TemplateId, number>;
  }, [expenses]);

  function handleExport(id: TemplateId, name: string, icon: string, format: ExportFormat) {
    const { recordCount, sizeKb } = runTemplateExport(id, expenses);
    const entry: HistoryEntry = {
      id: `h-${Date.now()}`,
      templateName: name, templateIcon: icon, format,
      timestamp: new Date().toISOString(),
      recordCount, sizeKb, status: 'success',
    };
    onExported(entry);
    setFlashed((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => setFlashed((prev) => ({ ...prev, [id]: false })), 2000);
  }

  return (
    <div className="p-6">
      <p className="text-xs text-gray-400 mb-4">Choose a template to export a pre-configured snapshot of your data.</p>
      <div className="grid grid-cols-2 gap-3">
        {EXPORT_TEMPLATES.map((t) => (
          <div key={t.id} className={`flex flex-col border rounded-xl p-4 gap-3 ${t.color}`}>
            <div className="flex items-start justify-between">
              <span className="text-2xl">{t.icon}</span>
              <span className="text-xs font-medium uppercase tracking-wide opacity-70">{t.format}</span>
            </div>
            <div>
              <p className="text-sm font-semibold">{t.name}</p>
              <p className="text-xs opacity-70 mt-0.5">{t.description}</p>
            </div>
            <div className="flex items-center justify-between mt-auto">
              <span className="text-xs opacity-60">{templateCounts[t.id as TemplateId]} records</span>
              <button
                onClick={() => handleExport(t.id as TemplateId, t.name, t.icon, t.format)}
                disabled={flashed[t.id]}
                className="text-xs px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-green-600 text-white rounded-lg font-medium transition-colors"
              >
                {flashed[t.id] ? '✓ Exported!' : 'Export'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Share ───────────────────────────────────────────────────────────────

function ShareTab({ expenses }: { expenses: Expense[] }) {
  const [token, setToken] = useState(() => generateToken());
  const [expiry, setExpiry] = useState('7d');
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const now = new Date();
  const [subject, setSubject] = useState(
    `Expense Report – ${now.toLocaleString('en-US', { month: 'long' })} ${now.getFullYear()}`
  );
  const [sendState, setSendState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [appMsg, setAppMsg] = useState('');
  const svgRef = useRef<SVGSVGElement>(null);

  const shareUrl = `https://expsnap.app/share/${token}`;

  function copyLink() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function sendReport() {
    if (!email) return;
    setSendState('sending');
    setTimeout(() => {
      setSendState('sent');
      setTimeout(() => setSendState('idle'), 3000);
    }, 1500);
  }

  function downloadQr() {
    if (!svgRef.current) return;
    const svg = svgRef.current.outerHTML;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'expense-share-qr.svg';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function tapApp(name: string) {
    setAppMsg(`Opening ${name}…`);
    setTimeout(() => setAppMsg(''), 2000);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Shareable link */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Shareable Link</h3>
        <p className="text-xs text-gray-400 mt-0.5 mb-3">Anyone with this link can view a read-only snapshot</p>
        <div className="flex gap-2 mb-2">
          <input readOnly value={shareUrl} className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-600 font-mono" />
          <button onClick={copyLink} className="px-3 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors whitespace-nowrap">
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-500">Expires in</label>
          <select value={expiry} onChange={(e) => setExpiry(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
            <option value="24h">24 hours</option>
            <option value="7d">7 days</option>
            <option value="30d">30 days</option>
            <option value="never">Never</option>
          </select>
          <button onClick={() => setToken(generateToken())} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">Regenerate</button>
        </div>
      </div>

      {/* QR Code */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900">QR Code</h3>
        <p className="text-xs text-gray-400 mt-0.5 mb-3">Scan to open on mobile</p>
        <div className="flex items-end gap-4">
          <div className="border border-gray-100 rounded-xl p-3 inline-block bg-white">
            {/* @ts-expect-error svg ref */}
            <QrCode token={token} size={140} ref={svgRef} />
          </div>
          <button onClick={downloadQr} className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-800 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Download QR
          </button>
        </div>
      </div>

      {/* Email report */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Email Report</h3>
        <div className="mt-3 space-y-2">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="colleague@company.com"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400" />
          <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400" />
          <button onClick={sendReport} disabled={!email || sendState !== 'idle'}
            className="w-full py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg transition-colors flex items-center justify-center gap-2">
            {sendState === 'sending' ? (
              <><svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Sending…</>
            ) : sendState === 'sent' ? (
              `✓ Sent to ${email}`
            ) : (
              'Send Report'
            )}
          </button>
        </div>
      </div>

      {/* Share to apps */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Share to Apps</h3>
        <div className="flex gap-2 flex-wrap">
          {[{ name: 'Slack', icon: '💬' }, { name: 'Teams', icon: '🔷' }, { name: 'WhatsApp', icon: '📱' }, { name: 'Notion', icon: '🗒️' }].map((app) => (
            <button key={app.name} onClick={() => tapApp(app.name)}
              className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors">
              <span>{app.icon}</span>{app.name}
            </button>
          ))}
        </div>
        {appMsg && <p className="text-xs text-indigo-600 mt-2 font-medium">{appMsg}</p>}
      </div>
    </div>
  );
}

// ─── Tab: Schedule ────────────────────────────────────────────────────────────

function ScheduleTab() {
  const [saved, setSaved] = useLocalStorage<ScheduleConfig>('export-hub-schedule', DEFAULT_SCHEDULE);
  const [local, setLocal] = useState<ScheduleConfig>(saved);

  function update<K extends keyof ScheduleConfig>(key: K, val: ScheduleConfig[K]) {
    setLocal((prev) => ({ ...prev, [key]: val }));
  }

  function save() {
    setSaved(local);
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 2000);
  }

  const [saveFlash, setSaveFlash] = useState(false);

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const nextBackup = computeNextBackup(local);
  const destLabel: Record<ScheduleConfig['destination'], string> = {
    'email': '✉️ Email', 'dropbox': '📦 Dropbox', 'onedrive': '🔷 OneDrive', 'google-drive': '📊 Google Drive',
  };

  return (
    <div className="p-6 space-y-5">
      {/* Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">Automated Backups</p>
          <p className="text-xs text-gray-400 mt-0.5">Automatically export on a schedule</p>
        </div>
        <button
          onClick={() => update('enabled', !local.enabled)}
          className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none ${local.enabled ? 'bg-indigo-600' : 'bg-gray-200'}`}
        >
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${local.enabled ? 'left-6' : 'left-1'}`} />
        </button>
      </div>

      {local.enabled && (
        <div className="space-y-4 border-t border-gray-100 pt-4">
          {/* Frequency */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Frequency</label>
            <div className="mt-2 flex rounded-lg border border-gray-200 overflow-hidden">
              {(['daily', 'weekly', 'monthly'] as const).map((f) => (
                <button key={f} onClick={() => update('frequency', f)}
                  className={`flex-1 py-2 text-xs font-medium transition-colors capitalize ${local.frequency === f ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Day of week (weekly only) */}
          {local.frequency === 'weekly' && (
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Day</label>
              <select value={local.dayOfWeek} onChange={(e) => update('dayOfWeek', Number(e.target.value))}
                className="mt-2 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
                {days.map((d, i) => <option key={d} value={i}>{d}</option>)}
              </select>
            </div>
          )}

          {/* Time */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Time</label>
            <input type="time" value={local.time} onChange={(e) => update('time', e.target.value)}
              className="mt-2 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
          </div>

          {/* Format */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Format</label>
            <div className="mt-2 flex rounded-lg border border-gray-200 overflow-hidden">
              {(['csv', 'json', 'pdf'] as ExportFormat[]).map((f) => (
                <button key={f} onClick={() => update('format', f)}
                  className={`flex-1 py-2 text-xs font-medium uppercase transition-colors ${local.format === f ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Destination */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Destination</label>
            <select value={local.destination} onChange={(e) => update('destination', e.target.value as ScheduleConfig['destination'])}
              className="mt-2 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
              {(Object.entries(destLabel) as [ScheduleConfig['destination'], string][]).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          {local.destination === 'email' && (
            <input type="email" value={local.email} onChange={(e) => update('email', e.target.value)}
              placeholder="your@email.com"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
          )}

          {/* Next backup info */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
            <p className="text-xs text-indigo-600 font-medium">Next backup</p>
            <p className="text-sm text-indigo-900 font-semibold mt-0.5">{nextBackup}</p>
            <p className="text-xs text-indigo-500 mt-0.5">{local.frequency} · {local.format.toUpperCase()} → {destLabel[local.destination]}</p>
          </div>
        </div>
      )}

      <button onClick={save}
        className="w-full py-2.5 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors shadow-sm">
        {saveFlash ? '✓ Saved!' : 'Save Schedule'}
      </button>
    </div>
  );
}

// ─── Tab: History ─────────────────────────────────────────────────────────────

function HistoryTab({ expenses }: { expenses: Expense[] }) {
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>('export-hub-history', SEED_HISTORY);
  const [confirmClear, setConfirmClear] = useState(false);

  const formatBadge = (f: ExportFormat) => {
    const colors: Record<ExportFormat, string> = { csv: 'bg-emerald-50 text-emerald-700', json: 'bg-purple-50 text-purple-700', pdf: 'bg-blue-50 text-blue-700' };
    return <span className={`text-xs px-1.5 py-0.5 rounded font-medium uppercase ${colors[f]}`}>{f}</span>;
  };

  function reDownload(entry: HistoryEntry) {
    const tmpl = EXPORT_TEMPLATES.find((t) => t.name === entry.templateName);
    if (tmpl) runTemplateExport(tmpl.id as TemplateId, expenses);
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-gray-400">{history.length} export{history.length !== 1 ? 's' : ''} recorded</p>
        {history.length > 0 && !confirmClear && (
          <button onClick={() => setConfirmClear(true)} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Clear All</button>
        )}
        {confirmClear && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500">Are you sure?</span>
            <button onClick={() => { setHistory([]); setConfirmClear(false); }} className="text-red-500 font-medium hover:text-red-600">Yes</button>
            <button onClick={() => setConfirmClear(false)} className="text-gray-500 hover:text-gray-700">No</button>
          </div>
        )}
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-gray-200 rounded-xl">
          <span className="text-3xl mb-2">📋</span>
          <p className="text-sm font-medium text-gray-600">No exports yet</p>
          <p className="text-xs text-gray-400 mt-1">Use Templates to get started</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {history.map((entry) => (
            <div key={entry.id} className="flex items-center gap-3 py-3">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">{entry.templateIcon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900 truncate">{entry.templateName}</p>
                  {formatBadge(entry.format)}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{relativeTime(entry.timestamp)} · {entry.recordCount} records · {entry.sizeKb} KB</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${entry.status === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                  {entry.status === 'success' ? '✓' : '✗'}
                </span>
                {entry.status === 'success' && (
                  <button onClick={() => reDownload(entry)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" title="Re-download">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tab: Integrations ────────────────────────────────────────────────────────

function IntegrationsTab() {
  const [connected, setConnected] = useLocalStorage<Record<string, boolean>>('export-hub-integrations', {});
  const [connecting, setConnecting] = useState<Record<string, boolean>>({});

  function connect(id: string) {
    setConnecting((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setConnected((prev) => ({ ...prev, [id]: true }));
      setConnecting((prev) => ({ ...prev, [id]: false }));
    }, 1500);
  }

  function disconnect(id: string) {
    setConnected((prev) => ({ ...prev, [id]: false }));
  }

  return (
    <div className="p-6 space-y-3">
      {INTEGRATIONS.map((intg) => {
        const isConnected = !!connected[intg.id];
        const isConnecting = !!connecting[intg.id];
        return (
          <div key={intg.id} className="flex items-center gap-3 border border-gray-100 rounded-xl p-4 bg-white">
            <div className={`w-10 h-10 ${intg.bg} rounded-xl flex items-center justify-center text-xl flex-shrink-0`}>{intg.icon}</div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${intg.color}`}>{intg.name}</p>
              <p className="text-xs text-gray-400 truncate">{intg.desc}</p>
            </div>
            <div className="flex-shrink-0 flex flex-col items-end gap-1">
              {isConnected ? (
                <>
                  <span className="text-xs font-semibold text-green-600 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />Connected</span>
                  <div className="flex gap-2 mt-1">
                    <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium border border-indigo-200 px-2 py-0.5 rounded">Sync Now</button>
                    <button onClick={() => disconnect(intg.id)} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Disconnect</button>
                  </div>
                </>
              ) : isConnecting ? (
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <svg className="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Connecting…
                </div>
              ) : (
                <button onClick={() => connect(intg.id)} className="text-xs font-medium text-indigo-600 border border-indigo-300 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">Connect</button>
              )}
            </div>
          </div>
        );
      })}

      {/* Coming soon */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs font-medium text-gray-400 flex items-center gap-1 mb-2"><span>🔒</span> Coming Soon</p>
        <div className="flex flex-wrap gap-2">
          {['Airtable', 'Salesforce', 'HubSpot', 'QuickBooks'].map((name) => (
            <span key={name} className="text-xs px-2.5 py-1 bg-gray-100 text-gray-400 rounded-full cursor-not-allowed">{name}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main ExportHub ───────────────────────────────────────────────────────────

interface ExportHubProps {
  expenses: Expense[];
  onClose: () => void;
}

export function ExportHub({ expenses, onClose }: ExportHubProps) {
  const [activeTab, setActiveTab] = useState<Tab>('templates');
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>('export-hub-history', SEED_HISTORY);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'templates',    label: 'Templates'    },
    { id: 'share',        label: 'Share'        },
    { id: 'schedule',     label: 'Schedule'     },
    { id: 'history',      label: 'History'      },
    { id: 'integrations', label: 'Integrations' },
  ];

  function handleExported(entry: HistoryEntry) {
    setHistory((prev) => [entry, ...prev]);
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Export &amp; Share</h2>
              <p className="text-xs text-gray-400">Connect, automate, and share your data</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-none px-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === t.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'templates'    && <TemplatesTab expenses={expenses} onExported={handleExported} />}
          {activeTab === 'share'        && <ShareTab expenses={expenses} />}
          {activeTab === 'schedule'     && <ScheduleTab />}
          {activeTab === 'history'      && <HistoryTab expenses={expenses} />}
          {activeTab === 'integrations' && <IntegrationsTab />}
        </div>
      </div>
    </>
  );
}
