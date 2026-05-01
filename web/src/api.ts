const base = '';

export type ApplicationRow = {
  number: number;
  date: string;
  company: string;
  role: string;
  scoreRaw: string;
  score: number | null;
  status: string;
  hasPdf: boolean;
  reportNumber: string;
  reportPath: string;
  notes: string;
};

export type Metrics = {
  total: number;
  byStatus: Record<string, number>;
  avgScore: number;
  topScore: number;
  withPdf: number;
  actionable: number;
};

export type PipelineItem = {
  state: string;
  reportRef: string;
  url: string;
  company: string;
  title: string;
  scoreRaw: string;
  notes: string;
  raw: string;
};

export async function getHealth(): Promise<{
  ok: boolean;
  careerOpsRoot: string;
  hasApplications: boolean;
  hasPipeline: boolean;
}> {
  const r = await fetch(`${base}/api/health`);
  if (!r.ok) throw new Error(`health ${r.status}`);
  return r.json();
}

export async function getTracker(): Promise<{
  careerOpsRoot: string;
  applications: ApplicationRow[];
  metrics: Metrics;
}> {
  const r = await fetch(`${base}/api/tracker`);
  if (!r.ok) throw new Error(`tracker ${r.status}`);
  return r.json();
}

export async function getPipeline(): Promise<{
  careerOpsRoot: string;
  sections: { section: string; items: PipelineItem[] }[];
  pending: PipelineItem[];
  processed: PipelineItem[];
}> {
  const r = await fetch(`${base}/api/pipeline`);
  if (!r.ok) throw new Error(`pipeline ${r.status}`);
  return r.json();
}

export async function getReport(path: string): Promise<{ path: string; markdown: string }> {
  const q = new URLSearchParams({ path });
  const r = await fetch(`${base}/api/report?${q}`);
  if (!r.ok) throw new Error(`report ${r.status}`);
  return r.json();
}
