import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MODULES_DIR = join(__dirname, '..', 'modules');
const OUTPUT_FILE = join(__dirname, 'sync.sql');

export function escapeSQL(value) {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  if (typeof value === 'number') {
    return String(value);
  }
  return `'${String(value).replace(/'/g, "''")}'`;
}

export function generateUpsertSQL(modules) {
  const statements = modules.map(m => {
    const tags = JSON.stringify(m.tags || []);
    const values = [
      escapeSQL(m.uuid),
      escapeSQL(m.name),
      escapeSQL(m.description),
      escapeSQL(m.author),
      escapeSQL(m.category),
      escapeSQL(m.version),
      escapeSQL(m.repo_url),
      escapeSQL(m.icon),
      escapeSQL(m.screenshot),
      escapeSQL(m.license),
      0,
      escapeSQL(tags),
      'CURRENT_TIMESTAMP',
    ].join(', ');

    return `INSERT INTO modules (uuid, name, description, author, category, version, repo_url, icon, screenshot, license, downloads, tags, updated_at)
VALUES (${values})
ON CONFLICT(uuid) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  author = excluded.author,
  category = excluded.category,
  version = excluded.version,
  repo_url = excluded.repo_url,
  icon = excluded.icon,
  screenshot = excluded.screenshot,
  license = excluded.license,
  tags = excluded.tags,
  updated_at = CURRENT_TIMESTAMP;`;
  });

  return statements.join('\n\n');
}

export function loadModules(modulesDir) {
  const files = readdirSync(modulesDir)
    .filter(f => f.endsWith('.json'))
    .sort();

  return files.map(filename => {
    const content = readFileSync(join(modulesDir, filename), 'utf-8');
    return JSON.parse(content);
  });
}

function main() {
  const modules = loadModules(MODULES_DIR);
  if (modules.length === 0) {
    console.log('No modules found');
    return 0;
  }

  const sql = generateUpsertSQL(modules);
  writeFileSync(OUTPUT_FILE, sql);
  console.log(`Generated ${OUTPUT_FILE} with ${modules.length} modules`);
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(main());
}
