import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MODULES_DIR = join(__dirname, '..', 'modules');

const VALID_CATEGORIES = [
  'system', 'hardware', 'network', 'audio', 'power', 'time',
  'workspace', 'window', 'tray', 'weather', 'productivity', 'media', 'custom'
];

const UUID_PATTERN = /^[a-z0-9][a-z0-9-]*@[a-z0-9][a-z0-9-]*$/;
const VERSION_PATTERN = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/;
const REPO_URL_PATTERN = /^https:\/\/github\.com\/[^/]+\/[^/]+$/;

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateUuid(uuid) {
  if (!uuid || uuid.length < 3 || uuid.length > 100) {
    throw new ValidationError(`UUID must be 3-100 characters: ${uuid}`);
  }
  if (!UUID_PATTERN.test(uuid)) {
    throw new ValidationError(`Invalid UUID format: ${uuid}`);
  }
}

export function validateVersion(version) {
  if (!VERSION_PATTERN.test(version)) {
    throw new ValidationError(`Invalid version format: ${version}`);
  }
}

export function validateRepoUrl(url) {
  if (!REPO_URL_PATTERN.test(url)) {
    throw new ValidationError(`Invalid repo_url (must be https://github.com/owner/repo): ${url}`);
  }
}

export function validateCategory(category) {
  if (!VALID_CATEGORIES.includes(category)) {
    throw new ValidationError(`Invalid category '${category}'. Valid: ${VALID_CATEGORIES.join(', ')}`);
  }
}

export function validateTags(tags) {
  if (tags === null || tags === undefined) {
    return;
  }
  if (!Array.isArray(tags)) {
    throw new ValidationError('tags must be an array');
  }
  if (tags.length > 10) {
    throw new ValidationError('Maximum 10 tags allowed');
  }
  const seen = new Set();
  for (const tag of tags) {
    if (typeof tag !== 'string' || tag.length < 1 || tag.length > 30) {
      throw new ValidationError(`Invalid tag: ${tag}`);
    }
    if (seen.has(tag)) {
      throw new ValidationError(`Duplicate tag: ${tag}`);
    }
    seen.add(tag);
  }
}

export function validateModule(data) {
  const required = ['uuid', 'name', 'description', 'author', 'category', 'version', 'repo_url'];
  for (const field of required) {
    if (!(field in data)) {
      throw new ValidationError(`Missing required field: ${field}`);
    }
  }

  validateUuid(data.uuid);
  validateVersion(data.version);
  validateRepoUrl(data.repo_url);
  validateCategory(data.category);
  validateTags(data.tags);

  const name = data.name || '';
  if (name.length < 3 || name.length > 50) {
    throw new ValidationError('name must be 3-50 characters');
  }
  const description = data.description || '';
  if (description.length < 10 || description.length > 500) {
    throw new ValidationError('description must be 10-500 characters');
  }
}

export function validateFile(filename, data) {
  validateModule(data);
  const expectedFilename = `${data.uuid}.json`;
  if (filename !== expectedFilename) {
    throw new ValidationError(`Filename mismatch: expected ${expectedFilename}, got ${filename}`);
  }
}

export function checkDuplicates(modules) {
  const seen = new Map();
  for (const m of modules) {
    const uuid = m.uuid;
    if (seen.has(uuid)) {
      throw new ValidationError(`Duplicate UUID '${uuid}'`);
    }
    seen.set(uuid, true);
  }
}

function loadModule(filepath) {
  const content = readFileSync(filepath, 'utf-8');
  return JSON.parse(content);
}

function validateDirectory(modulesDir) {
  const errors = [];
  const files = readdirSync(modulesDir).filter(f => f.endsWith('.json')).sort();

  if (files.length === 0) {
    console.log('No module files found');
    return 0;
  }

  const modules = [];
  for (const filename of files) {
    const filepath = join(modulesDir, filename);
    try {
      const data = loadModule(filepath);
      validateFile(filename, data);
      modules.push(data);
    } catch (e) {
      errors.push(`${filename}: ${e.message}`);
    }
  }

  try {
    checkDuplicates(modules);
  } catch (e) {
    errors.push(e.message);
  }

  if (errors.length > 0) {
    console.log('Validation errors:');
    for (const error of errors) {
      console.log(`  - ${error}`);
    }
    return 1;
  }

  console.log(`Validated ${files.length} modules successfully`);
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(validateDirectory(MODULES_DIR));
}
