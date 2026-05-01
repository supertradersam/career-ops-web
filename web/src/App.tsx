import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getHealth,
  getPipeline,
  getReport,
  getTracker,
  type ApplicationRow,
  type Metrics,
  type PipelineItem,
} from './api';
import './App.css';

type Tab = 'tracker' | 'pipeline';

const STATUS_FILTERS = [
  'all',
  'Evaluated',
  'Applied',
  'Responded',
  'Interview',
  'Offer',
  'Rejected',
  'Discarded',
  'SKIP',
] as const;

function metricLine(m: Metrics | null) {
  if (!m) return '—';
  return `${m.total} rows · avg ${m.avgScore}/5 · top ${m.topScore}/5 · ${m.actionable} actionable · ${m.withPdf} PDF`;
}

function statusClass(status: string) {
  const s = status.toLowerCase();
  if (s === 'skip') return 'chip skip';
  if (s === 'applied' || s === 'interview' || s === 'offer') return 'chip hot';
  if (s === 'rejected' || s === 'discarded') return 'chip muted';
  return 'chip';
}

function App() {
  const [tab, setTab] = useState<Tab>('tracker');
  const [root, setRoot] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const [pending, setPending] = useState<PipelineItem[]>([]);
  const [processed, setProcessed] = useState<PipelineItem[]>([]);

  const [reportPath, setReportPath] = useState<string | null>(null);
  const [reportMd, setReportMd] = useState<string>('');
  const [reportLoading, setReportLoading] = useState(false);

  const loadTracker = useCallback(async () => {
    const data = await getTracker();
    setRoot(data.careerOpsRoot);
    setApplications(data.applications);
    setMetrics(data.metrics);
  }, []);

  const loadPipeline = useCallback(async () => {
    const data = await getPipeline();
    setRoot(data.careerOpsRoot);
    setPending(data.pending);
    setProcessed(data.processed);
  }, []);

  const refresh = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const h = await getHealth();
      setRoot(h.careerOpsRoot);
      await loadTracker();
      await loadPipeline();
    } catch (e) {
      setError(String((e as Error).message || e));
    } finally {
      setLoading(false);
    }
  }, [loadTracker, loadPipeline]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const reportPathByNumber = useMemo(() => {
    const m = new Map<number, string>();
    for (const a of applications) {
      if (a.reportPath) m.set(a.number, a.reportPath);
    }
    return m;
  }, [applications]);

  const filteredApps = useMemo(() => {
    const q = search.trim().toLowerCase();
    return applications.filter((a) => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (!q) return true;
      const blob = `${a.company} ${a.role} ${a.notes} ${a.status}`.toLowerCase();
      return blob.includes(q);
    });
  }, [applications, statusFilter, search]);

  const openReport = useCallback(async (rel: string) => {
    if (!rel) return;
    setReportPath(rel);
    setReportLoading(true);
    setReportMd('');
    try {
      const r = await getReport(rel);
      setReportMd(r.markdown);
    } catch (e) {
      setReportMd(`_Error loading report: ${String((e as Error).message || e)}_`);
    } finally {
      setReportLoading(false);
    }
  }, []);

  return (
    <div className="layout">
      <header className="top">
        <div className="brand">
          <h1>Career-ops</h1>
          <p className="subtitle">Local web dashboard · Phase 1</p>
        </div>
        <div className="actions">
          <button type="button" className="btn" onClick={() => void refresh()} disabled={loading}>
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </header>

      {error && (
        <div className="banner err">
          <strong>API</strong> {error} — start the API with <code>npm run dev:api</code> from the repo root.
        </div>
      )}

      <p className="meta">
        <span className="label">Data root</span> <code>{root || '—'}</code>
        <span className="sep">·</span>
        <span className="label">Metrics</span> {metricLine(metrics)}
      </p>

      <nav className="tabs">
        <button
          type="button"
          className={tab === 'tracker' ? 'tab on' : 'tab'}
          onClick={() => setTab('tracker')}
        >
          Tracker
        </button>
        <button
          type="button"
          className={tab === 'pipeline' ? 'tab on' : 'tab'}
          onClick={() => setTab('pipeline')}
        >
          Pipeline
        </button>
      </nav>

      <div className="grid">
        <main className="panel">
          {tab === 'tracker' && (
            <>
              <div className="toolbar">
                <input
                  type="search"
                  className="input"
                  placeholder="Filter company, role, notes…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Filter applications"
                />
                <select
                  className="select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label="Status filter"
                >
                  {STATUS_FILTERS.map((s) => (
                    <option key={s} value={s}>
                      {s === 'all' ? 'All statuses' : s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="table-wrap">
                <table className="data">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Date</th>
                      <th>Company</th>
                      <th>Role</th>
                      <th>Score</th>
                      <th>Status</th>
                      <th>PDF</th>
                      <th>Report</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApps.map((a) => (
                      <tr key={`${a.number}-${a.company}-${a.role}`}>
                        <td>{a.number}</td>
                        <td>{a.date}</td>
                        <td>{a.company}</td>
                        <td className="clamp">{a.role}</td>
                        <td>{a.scoreRaw}</td>
                        <td>
                          <span className={statusClass(a.status)}>{a.status}</span>
                        </td>
                        <td>{a.hasPdf ? '✅' : '❌'}</td>
                        <td>
                          {a.reportPath ? (
                            <button
                              type="button"
                              className="linkish"
                              onClick={() => void openReport(a.reportPath)}
                            >
                              Open
                            </button>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === 'pipeline' && (
            <>
              <h2 className="h2">Processed</h2>
              <PipelineTable
                items={processed}
                openReport={openReport}
                reportPathByNumber={reportPathByNumber}
              />
              <h2 className="h2">Pending</h2>
              <PipelineTable
                items={pending}
                openReport={openReport}
                reportPathByNumber={reportPathByNumber}
                sparse
              />
            </>
          )}
        </main>

        <aside className="panel report">
          <h2 className="h2">Report</h2>
          {reportPath ? (
            <>
              <p className="small">
                <code>{reportPath}</code>
              </p>
              <div className="md">{reportLoading ? 'Loading…' : reportMd || 'Empty'}</div>
            </>
          ) : (
            <p className="muted">Select a row and click Open to preview markdown here.</p>
          )}
        </aside>
      </div>
    </div>
  );
}

function PipelineTable({
  items,
  openReport,
  reportPathByNumber,
  sparse,
}: {
  items: PipelineItem[];
  openReport: (path: string) => void;
  reportPathByNumber: Map<number, string>;
  sparse?: boolean;
}) {
  if (!items.length) {
    return <p className="muted">{sparse ? 'No pending checklist items.' : 'No processed lines.'}</p>;
  }

  return (
    <div className="table-wrap">
      <table className="data">
        <thead>
          <tr>
            <th>State</th>
            <th>URL</th>
            <th>Company</th>
            <th>Title</th>
            <th>Score</th>
            <th>Report</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => {
            const num = item.reportRef ? Number.parseInt(item.reportRef, 10) : NaN;
            const rPath =
              Number.isFinite(num) ? reportPathByNumber.get(num) : undefined;

            return (
              // eslint-disable-next-line react/no-array-index-key -- checklist lines lack stable ids
              <tr key={idx}>
                <td>
                  <span className={`chip ${item.state}`}>{item.state}</span>
                </td>
                <td className="clamp">
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noreferrer">
                      Link
                    </a>
                  ) : (
                    '—'
                  )}
                </td>
                <td>{item.company || '—'}</td>
                <td className="clamp">{item.title || item.notes}</td>
                <td>{item.scoreRaw || '—'}</td>
                <td>
                  {rPath ? (
                    <button type="button" className="linkish" onClick={() => void openReport(rPath)}>
                      Open
                    </button>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default App;
