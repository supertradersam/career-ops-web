import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Repo root containing data/applications.md (not api/). */
export function resolveCareerOpsRoot() {
  const env = process.env.CAREER_OPS_ROOT?.trim();
  if (env) return path.resolve(env);

  let dir = process.cwd();
  for (let i = 0; i < 8; i++) {
    if (fs.existsSync(path.join(dir, 'data', 'applications.md'))) return dir;
    if (fs.existsSync(path.join(dir, 'applications.md'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  // Running from api/: walk to parent
  const apiParent = path.resolve(__dirname, '..', '..');
  if (fs.existsSync(path.join(apiParent, 'data', 'applications.md'))) return apiParent;

  return process.cwd();
}

export function applicationsPath(root) {
  const d = path.join(root, 'data', 'applications.md');
  if (fs.existsSync(d)) return d;
  return path.join(root, 'applications.md');
}

export function pipelinePath(root) {
  const d = path.join(root, 'data', 'pipeline.md');
  if (fs.existsSync(d)) return d;
  return path.join(root, 'pipeline.md');
}
