import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { escapeSQL, generateUpsertSQL, loadModules } from './json-to-sql.mjs';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('escapeSQL', () => {
  test('escapes single quotes', () => {
    expect(escapeSQL("O'Brien")).toBe("'O''Brien'");
  });

  test('handles null', () => {
    expect(escapeSQL(null)).toBe('NULL');
  });

  test('handles undefined', () => {
    expect(escapeSQL(undefined)).toBe('NULL');
  });

  test('handles numbers', () => {
    expect(escapeSQL(42)).toBe('42');
  });

  test('handles strings', () => {
    expect(escapeSQL('hello')).toBe("'hello'");
  });

  test('handles empty string', () => {
    expect(escapeSQL('')).toBe("''");
  });
});

describe('generateUpsertSQL', () => {
  const basicModule = {
    uuid: 'test@dev',
    name: 'Test Module',
    description: 'A test module',
    author: 'dev',
    category: 'system',
    version: '1.0.0',
    repo_url: 'https://github.com/test/repo',
  };

  test('generates INSERT statement', () => {
    const sql = generateUpsertSQL([basicModule]);
    expect(sql).toContain('INSERT INTO modules');
  });

  test('generates ON CONFLICT clause', () => {
    const sql = generateUpsertSQL([basicModule]);
    expect(sql).toContain('ON CONFLICT(uuid) DO UPDATE SET');
  });

  test('includes all columns in INSERT', () => {
    const sql = generateUpsertSQL([basicModule]);
    expect(sql).toContain('uuid');
    expect(sql).toContain('name');
    expect(sql).toContain('description');
    expect(sql).toContain('author');
    expect(sql).toContain('category');
    expect(sql).toContain('version');
    expect(sql).toContain('repo_url');
    expect(sql).toContain('downloads');
    expect(sql).toContain('tags');
    expect(sql).toContain('updated_at');
  });

  test('sets downloads to 0', () => {
    const sql = generateUpsertSQL([basicModule]);
    expect(sql).toMatch(/VALUES\s*\([^)]*,\s*0\s*,/);
  });

  test('excludes downloads from UPDATE', () => {
    const sql = generateUpsertSQL([basicModule]);
    expect(sql).not.toMatch(/downloads\s*=\s*excluded\.downloads/);
  });

  test('serializes tags to JSON', () => {
    const moduleWithTags = { ...basicModule, tags: ['tag1', 'tag2'] };
    const sql = generateUpsertSQL([moduleWithTags]);
    expect(sql).toContain('["tag1","tag2"]');
  });

  test('handles null tags', () => {
    const moduleWithNullTags = { ...basicModule, tags: null };
    const sql = generateUpsertSQL([moduleWithNullTags]);
    expect(sql).toContain("'[]'");
  });

  test('handles missing tags', () => {
    const sql = generateUpsertSQL([basicModule]);
    expect(sql).toContain("'[]'");
  });

  test('handles optional fields as NULL', () => {
    const sql = generateUpsertSQL([basicModule]);
    expect(sql).toContain('NULL');
  });

  test('escapes special characters in strings', () => {
    const moduleWithQuote = { ...basicModule, name: "Test's Module" };
    const sql = generateUpsertSQL([moduleWithQuote]);
    expect(sql).toContain("'Test''s Module'");
  });

  test('generates multiple statements for multiple modules', () => {
    const modules = [
      { ...basicModule, uuid: 'test1@dev' },
      { ...basicModule, uuid: 'test2@dev' },
    ];
    const sql = generateUpsertSQL(modules);
    expect(sql).toContain("'test1@dev'");
    expect(sql).toContain("'test2@dev'");
  });

  test('uses CURRENT_TIMESTAMP for updated_at', () => {
    const sql = generateUpsertSQL([basicModule]);
    expect(sql).toContain('CURRENT_TIMESTAMP');
  });
});

describe('loadModules', () => {
  const tmpDir = join(tmpdir(), 'test-modules-' + Date.now());

  beforeAll(() => {
    mkdirSync(tmpDir, { recursive: true });
  });

  afterAll(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  test('loads modules from directory', () => {
    writeFileSync(join(tmpDir, 'test1@dev.json'), JSON.stringify({ uuid: 'test1@dev', name: 'Test 1' }));
    writeFileSync(join(tmpDir, 'test2@dev.json'), JSON.stringify({ uuid: 'test2@dev', name: 'Test 2' }));

    const modules = loadModules(tmpDir);
    expect(modules).toHaveLength(2);
    const uuids = modules.map(m => m.uuid);
    expect(uuids).toContain('test1@dev');
    expect(uuids).toContain('test2@dev');
  });

  test('returns modules sorted by filename', () => {
    const sortDir = join(tmpDir, 'sorted');
    mkdirSync(sortDir, { recursive: true });
    writeFileSync(join(sortDir, 'z-module@dev.json'), JSON.stringify({ uuid: 'z-module@dev' }));
    writeFileSync(join(sortDir, 'a-module@dev.json'), JSON.stringify({ uuid: 'a-module@dev' }));

    const modules = loadModules(sortDir);
    expect(modules[0].uuid).toBe('a-module@dev');
    expect(modules[1].uuid).toBe('z-module@dev');
  });
});
