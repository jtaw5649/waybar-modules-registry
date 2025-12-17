import { describe, test, expect } from 'vitest';
import {
  validateUuid,
  validateVersion,
  validateRepoUrl,
  validateCategory,
  validateTags,
  validateModule,
  validateFile,
  checkDuplicates,
} from './validate.mjs';

describe('validateUuid', () => {
  test('accepts valid uuid formats', () => {
    expect(() => validateUuid('weather-wttr@community')).not.toThrow();
    expect(() => validateUuid('cpu@sys')).not.toThrow();
    expect(() => validateUuid('a1@b2')).not.toThrow();
  });

  test('rejects uuid without @', () => {
    expect(() => validateUuid('weather-wttr')).toThrow();
  });

  test('rejects uuid with multiple @', () => {
    expect(() => validateUuid('a@b@c')).toThrow();
  });

  test('rejects uppercase uuid', () => {
    expect(() => validateUuid('Weather@Community')).toThrow();
  });

  test('rejects uuid with spaces', () => {
    expect(() => validateUuid('weather wttr@community')).toThrow();
  });

  test('rejects uuid too short', () => {
    expect(() => validateUuid('a@')).toThrow();
  });
});

describe('validateVersion', () => {
  test('accepts valid semver versions', () => {
    expect(() => validateVersion('1.0.0')).not.toThrow();
    expect(() => validateVersion('0.1.0')).not.toThrow();
    expect(() => validateVersion('10.20.30')).not.toThrow();
    expect(() => validateVersion('1.0.0-beta')).not.toThrow();
    expect(() => validateVersion('1.0.0-rc.1')).not.toThrow();
  });

  test('rejects two-part version', () => {
    expect(() => validateVersion('1.0')).toThrow();
  });

  test('rejects version without dots', () => {
    expect(() => validateVersion('100')).toThrow();
  });

  test('rejects version with v prefix', () => {
    expect(() => validateVersion('v1.0.0')).toThrow();
  });
});

describe('validateRepoUrl', () => {
  test('accepts valid GitHub URLs', () => {
    expect(() => validateRepoUrl('https://github.com/owner/repo')).not.toThrow();
    expect(() => validateRepoUrl('https://github.com/jtaw5649/waybar-manager')).not.toThrow();
  });

  test('rejects http URLs', () => {
    expect(() => validateRepoUrl('http://github.com/owner/repo')).toThrow();
  });

  test('rejects non-GitHub URLs', () => {
    expect(() => validateRepoUrl('https://gitlab.com/owner/repo')).toThrow();
  });

  test('rejects URLs with trailing slash', () => {
    expect(() => validateRepoUrl('https://github.com/owner/repo/')).toThrow();
  });

  test('rejects URLs with subpath', () => {
    expect(() => validateRepoUrl('https://github.com/owner/repo/tree/main')).toThrow();
  });
});

describe('validateCategory', () => {
  test('accepts valid categories', () => {
    const valid = ['system', 'hardware', 'network', 'weather', 'media', 'custom'];
    valid.forEach(cat => {
      expect(() => validateCategory(cat)).not.toThrow();
    });
  });

  test('rejects invalid category', () => {
    expect(() => validateCategory('invalid')).toThrow();
  });

  test('rejects uppercase category', () => {
    expect(() => validateCategory('System')).toThrow();
  });
});

describe('validateTags', () => {
  test('accepts valid tags', () => {
    expect(() => validateTags(['tag1', 'tag2'])).not.toThrow();
    expect(() => validateTags([])).not.toThrow();
    expect(() => validateTags(null)).not.toThrow();
    expect(() => validateTags(undefined)).not.toThrow();
  });

  test('rejects duplicate tags', () => {
    expect(() => validateTags(['tag1', 'tag1'])).toThrow();
  });

  test('rejects more than 10 tags', () => {
    const tags = Array.from({ length: 11 }, (_, i) => `tag${i}`);
    expect(() => validateTags(tags)).toThrow();
  });

  test('rejects empty string tag', () => {
    expect(() => validateTags([''])).toThrow();
  });

  test('rejects tag longer than 30 chars', () => {
    expect(() => validateTags(['a'.repeat(31)])).toThrow();
  });
});

describe('validateModule', () => {
  const validModule = {
    uuid: 'test@dev',
    name: 'Test Module',
    description: 'A test module for validation purposes',
    author: 'dev',
    category: 'system',
    version: '1.0.0',
    repo_url: 'https://github.com/test/repo',
    tags: ['test'],
  };

  test('accepts valid module', () => {
    expect(() => validateModule(validModule)).not.toThrow();
  });

  test('rejects module missing required field', () => {
    expect(() => validateModule({ uuid: 'test@dev', name: 'Test' })).toThrow(/required/i);
  });

  test('rejects module with name too short', () => {
    expect(() => validateModule({ ...validModule, name: 'AB' })).toThrow(/name/i);
  });

  test('rejects module with description too short', () => {
    expect(() => validateModule({ ...validModule, description: 'Short' })).toThrow(/description/i);
  });

  test('rejects module with invalid uuid', () => {
    expect(() => validateModule({ ...validModule, uuid: 'INVALID' })).toThrow();
  });

  test('rejects module with invalid version', () => {
    expect(() => validateModule({ ...validModule, version: 'v1.0' })).toThrow();
  });

  test('rejects module with invalid repo_url', () => {
    expect(() => validateModule({ ...validModule, repo_url: 'http://example.com' })).toThrow();
  });
});

describe('validateFile', () => {
  test('rejects file with mismatched filename', () => {
    const module = { ...validModule, uuid: 'other@dev' };
    expect(() => validateFile('test@dev.json', module)).toThrow(/filename/i);
  });

  test('accepts file with matching filename', () => {
    const module = {
      uuid: 'test@dev',
      name: 'Test Module',
      description: 'A test module for validation purposes',
      author: 'dev',
      category: 'system',
      version: '1.0.0',
      repo_url: 'https://github.com/test/repo',
    };
    expect(() => validateFile('test@dev.json', module)).not.toThrow();
  });
});

describe('checkDuplicates', () => {
  test('detects duplicate uuids', () => {
    const modules = [
      { uuid: 'test@dev', name: 'Test 1' },
      { uuid: 'test@dev', name: 'Test 2' },
    ];
    expect(() => checkDuplicates(modules)).toThrow(/duplicate/i);
  });

  test('passes with unique uuids', () => {
    const modules = [
      { uuid: 'test1@dev', name: 'Test 1' },
      { uuid: 'test2@dev', name: 'Test 2' },
    ];
    expect(() => checkDuplicates(modules)).not.toThrow();
  });
});

const validModule = {
  uuid: 'test@dev',
  name: 'Test Module',
  description: 'A test module for validation purposes',
  author: 'dev',
  category: 'system',
  version: '1.0.0',
  repo_url: 'https://github.com/test/repo',
  tags: ['test'],
};
