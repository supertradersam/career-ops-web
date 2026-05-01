const reScore = /(\d+\.?\d*)\/5/;
const reReportLink = /\[(\d+)\]\(([^)]+)\)/;

function splitTableRow(line) {
  let fields;
  if (line.includes('\t')) {
    const rest = line.replace(/^\|\s*/, '');
    fields = rest.split('\t').map((p) => p.replace(/\|/g, '').trim());
  } else {
    fields = line
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((p) => p.trim());
  }
  return fields;
}

/**
 * @param {string} content - applications.md body
 */
export function parseApplications(content) {
  const lines = content.split(/\n/);
  const apps = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line.startsWith('|')) continue;
    if (line.startsWith('|---') || line.startsWith('| #')) continue;

    const fields = splitTableRow(line);
    if (fields.length < 8) continue;

    const number = Number.parseInt(fields[0], 10);
    const scoreRaw = fields[4];
    const sm = scoreRaw.match(reScore);
    const score = sm ? Number.parseFloat(sm[1]) : null;

    const reportCell = fields[7];
    const rm = reportCell.match(reReportLink);

    apps.push({
      number: Number.isFinite(number) ? number : apps.length + 1,
      date: fields[1],
      company: fields[2],
      role: fields[3],
      scoreRaw,
      score,
      status: fields[5],
      hasPdf: fields[6].includes('✅'),
      reportNumber: rm ? rm[1] : '',
      reportPath: rm ? rm[2] : '',
      notes: fields[8] ?? '',
    });
  }

  return apps.sort((a, b) => a.number - b.number);
}

export function computeMetrics(apps) {
  const byStatus = {};
  let sum = 0;
  let scored = 0;
  let top = 0;
  let withPdf = 0;
  let actionable = 0;

  for (const a of apps) {
    const s = (a.status || '').toLowerCase();
    byStatus[a.status || 'unknown'] = (byStatus[a.status || 'unknown'] || 0) + 1;
    if (a.score != null && Number.isFinite(a.score)) {
      sum += a.score;
      scored++;
      if (a.score > top) top = a.score;
    }
    if (a.hasPdf) withPdf++;
    if (!['skip', 'rejected', 'discarded'].includes(s)) actionable++;
  }

  return {
    total: apps.length,
    byStatus,
    avgScore: scored ? Math.round((sum / scored) * 100) / 100 : 0,
    topScore: top,
    withPdf,
    actionable,
  };
}
