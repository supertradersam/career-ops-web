/**
 * Parse pipeline.md checklist lines under Processed / Pending sections.
 * Formats:
 * - [x] #002 | url | company | title | score | PDF ...
 * - [!] url | company | title — Error: ...
 */
const lineRe = /^-\s*\[([^\]]+)\]\s*(.+)$/;

function parseCheckboxLine(line) {
  const m = line.trim().match(lineRe);
  if (!m) return null;
  const flag = m[1].trim().toLowerCase();
  const rest = m[2].trim();

  let state = 'pending';
  if (flag === 'x') state = 'done';
  else if (flag === '!') state = 'error';
  else if (flag === ' ') state = 'pending';

  const parts = rest.split(/\s*\|\s*/).map((p) => p.trim());
  let reportRef = '';
  let url = '';
  let company = '';
  let title = '';
  let scoreRaw = '';
  let notes = '';

  if (state === 'done' && parts.length >= 4) {
    const first = parts[0];
    const hash = first.match(/^#(\d+)/);
    if (hash) reportRef = hash[1];
    url = parts[1] || '';
    company = parts[2] || '';
    title = parts[3] || '';
    if (parts[4]) scoreRaw = parts[4];
    if (parts.length > 5) notes = parts.slice(5).join(' | ');
  } else if (state === 'error' && parts.length >= 2) {
    url = parts[0] || '';
    company = parts[1] || '';
    title = parts.slice(2).join(' | ') || '';
  } else {
    // Pending or odd format: keep raw
    notes = rest;
    if (parts[0]?.startsWith('http')) url = parts[0];
  }

  return {
    state,
    reportRef,
    url,
    company,
    title,
    scoreRaw,
    notes,
    raw: line.trim(),
  };
}

export function parsePipelineMarkdown(content) {
  const lines = content.split(/\n/);
  /** @type {{ section: string, items: ReturnType<typeof parseCheckboxLine>[] }[]} */
  const sections = [];
  /** @type {{ section: string, items: ReturnType<typeof parseCheckboxLine>[] } | null} */
  let current = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith('## ')) {
      if (current) sections.push(current);
      current = { section: line.replace(/^##\s+/, '').trim(), items: [] };
      continue;
    }
    if (current && line.startsWith('- [')) {
      const item = parseCheckboxLine(line);
      if (item) current.items.push(item);
    }
  }
  if (current) sections.push(current);

  const pending = sections.find((s) => /^pending/i.test(s.section))?.items ?? [];
  const processed = sections.find((s) => /^processed/i.test(s.section))?.items ?? [];

  return { sections, pending, processed };
}
