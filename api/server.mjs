import cors from 'cors';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { computeMetrics, parseApplications } from './lib/parse-applications.mjs';
import { parsePipelineMarkdown } from './lib/parse-pipeline.mjs';
import { applicationsPath, pipelinePath, resolveCareerOpsRoot } from './lib/paths.mjs';

const PORT = Number.parseInt(process.env.PORT || '8787', 10);

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '1mb' }));

function readText(p) {
  return fs.readFileSync(p, 'utf8');
}

function safeReportFile(root, relPath) {
  const normalized = path.normalize(relPath).replace(/^(\.\.(\/|\\|$))+/, '');
  const full = path.resolve(root, normalized);
  const reportsDir = path.resolve(root, 'reports');
  if (!full.startsWith(reportsDir + path.sep) && full !== reportsDir) {
    const err = new Error('Invalid report path');
    err.statusCode = 400;
    throw err;
  }
  if (!fs.existsSync(full)) {
    const err = new Error('Report not found');
    err.statusCode = 404;
    throw err;
  }
  return full;
}

app.get('/api/health', (_req, res) => {
  const root = resolveCareerOpsRoot();
  res.json({
    ok: true,
    careerOpsRoot: root,
    hasApplications: fs.existsSync(applicationsPath(root)),
    hasPipeline: fs.existsSync(pipelinePath(root)),
  });
});

app.get('/api/tracker', (_req, res) => {
  try {
    const root = resolveCareerOpsRoot();
    const p = applicationsPath(root);
    if (!fs.existsSync(p)) {
      return res.status(404).json({ error: 'applications.md not found', root });
    }
    const content = readText(p);
    const applications = parseApplications(content);
    const metrics = computeMetrics(applications);
    res.json({ careerOpsRoot: root, applications, metrics });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.get('/api/pipeline', (_req, res) => {
  try {
    const root = resolveCareerOpsRoot();
    const p = pipelinePath(root);
    if (!fs.existsSync(p)) {
      return res.status(404).json({ error: 'pipeline.md not found', root });
    }
    const content = readText(p);
    const parsed = parsePipelineMarkdown(content);
    res.json({ careerOpsRoot: root, ...parsed });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e.message || e) });
  }
});

/** Query: path=reports/001-slug-date.md — returns raw markdown */
app.get('/api/report', (req, res) => {
  try {
    const rel = req.query.path;
    if (!rel || typeof rel !== 'string') {
      return res.status(400).json({ error: 'Missing path query' });
    }
    const root = resolveCareerOpsRoot();
    const full = safeReportFile(root, rel);
    const body = readText(full);
    res.json({ path: rel, markdown: body });
  } catch (e) {
    const code = e.statusCode || 500;
    res.status(code).json({ error: String(e.message || e) });
  }
});

app.listen(PORT, () => {
  console.log(`Career-ops dashboard API http://localhost:${PORT}`);
  console.log(`Career-ops root: ${resolveCareerOpsRoot()}`);
});
