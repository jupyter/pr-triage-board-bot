import { getFilesChangedType } from './fileschangedtype.js';

// Mock the PaginatedOctokit
class MockOctokit {}

describe('getFilesChangedType', () => {
  it('should return null when no files are present', async () => {
    const mockOctokit = new MockOctokit();
    const pr = {
      files: {
        nodes: []
      }
    };

    const result = await getFilesChangedType(mockOctokit as any, pr);
    expect(result).toBeNull();
  });

  it('should return type when files have no changes (current implementation behavior)', async () => {
    const mockOctokit = new MockOctokit();
    const pr = {
      files: {
        nodes: [
          {
            path: 'test.md',
            additions: 0,
            deletions: 0
          }
        ]
      }
    };

    const result = await getFilesChangedType(mockOctokit as any, pr);
    // Note: current implementation counts files regardless of change count
    expect(result).toBe('Documentation');
  });

  it('should return "Documentation" for markdown files', async () => {
    const mockOctokit = new MockOctokit();
    const pr = {
      files: {
        nodes: [
          {
            path: 'readme.md',
            additions: 10,
            deletions: 5
          }
        ]
      }
    };

    const result = await getFilesChangedType(mockOctokit as any, pr);
    expect(result).toBe('Documentation');
  });

  it('should return "Documentation" for rst files', async () => {
    const mockOctokit = new MockOctokit();
    const pr = {
      files: {
        nodes: [
          {
            path: 'readme.rst',
            additions: 10,
            deletions: 5
          }
        ]
      }
    };

    const result = await getFilesChangedType(mockOctokit as any, pr);
    expect(result).toBe('Documentation');
  });

  it('should return "Python" for Python files', async () => {
    const mockOctokit = new MockOctokit();
    const pr = {
      files: {
        nodes: [
          {
            path: 'script.py',
            additions: 10,
            deletions: 5
          }
        ]
      }
    };

    const result = await getFilesChangedType(mockOctokit as any, pr);
    expect(result).toBe('Python');
  });

  it('should return "Frontend" for frontend files (.js)', async () => {
    const mockOctokit = new MockOctokit();
    const pr = {
      files: {
        nodes: [
          {
            path: 'script.js',
            additions: 10,
            deletions: 5
          }
        ]
      }
    };

    const result = await getFilesChangedType(mockOctokit as any, pr);
    expect(result).toBe('Frontend');
  });

  it('should return "Frontend" for frontend files (.jsx)', async () => {
    const mockOctokit = new MockOctokit();
    const pr = {
      files: {
        nodes: [
          {
            path: 'component.jsx',
            additions: 10,
            deletions: 5
          }
        ]
      }
    };

    const result = await getFilesChangedType(mockOctokit as any, pr);
    expect(result).toBe('Frontend');
  });

  it('should return "Frontend" for frontend files (.ts)', async () => {
    const mockOctokit = new MockOctokit();
    const pr = {
      files: {
        nodes: [
          {
            path: 'script.ts',
            additions: 10,
            deletions: 5
          }
        ]
      }
    };

    const result = await getFilesChangedType(mockOctokit as any, pr);
    expect(result).toBe('Frontend');
  });

  it('should return "Frontend" for frontend files (.tsx)', async () => {
    const mockOctokit = new MockOctokit();
    const pr = {
      files: {
        nodes: [
          {
            path: 'component.tsx',
            additions: 10,
            deletions: 5
          }
        ]
      }
    };

    const result = await getFilesChangedType(mockOctokit as any, pr);
    expect(result).toBe('Frontend');
  });

  it('should return "Frontend" for frontend files (.css)', async () => {
    const mockOctokit = new MockOctokit();
    const pr = {
      files: {
        nodes: [
          {
            path: 'style.css',
            additions: 10,
            deletions: 5
          }
        ]
      }
    };

    const result = await getFilesChangedType(mockOctokit as any, pr);
    expect(result).toBe('Frontend');
  });

  it('should return "Frontend" for frontend files (.html)', async () => {
    const mockOctokit = new MockOctokit();
    const pr = {
      files: {
        nodes: [
          {
            path: 'index.html',
            additions: 10,
            deletions: 5
          }
        ]
      }
    };

    const result = await getFilesChangedType(mockOctokit as any, pr);
    expect(result).toBe('Frontend');
  });

  it('should return "Frontend" for frontend files (.scss)', async () => {
    const mockOctokit = new MockOctokit();
    const pr = {
      files: {
        nodes: [
          {
            path: 'style.scss',
            additions: 10,
            deletions: 5
          }
        ]
      }
    };

    const result = await getFilesChangedType(mockOctokit as any, pr);
    expect(result).toBe('Frontend');
  });

  it('should return type with highest change count when multiple types are present', async () => {
    const mockOctokit = new MockOctokit();
    const pr = {
      files: {
        nodes: [
          {
            path: 'readme.md',
            additions: 5,
            deletions: 3
          },
          {
            path: 'script.py',
            additions: 15,
            deletions: 7
          }
        ]
      }
    };

    const result = await getFilesChangedType(mockOctokit as any, pr);
    expect(result).toBe('Python'); // Python has 22 changes vs Documentation 8
  });

  it('should return null when "other" extensions have more changes than any specific type', async () => {
    const mockOctokit = new MockOctokit();
    const pr = {
      files: {
        nodes: [
          {
            path: 'readme.md',
            additions: 5,
            deletions: 3
          },
          {
            path: 'file.unknown', // This extension is not in the mapping
            additions: 15,
            deletions: 7
          }
        ]
      }
    };

    const result = await getFilesChangedType(mockOctokit as any, pr);
    expect(result).toBeNull();
  });

  it('should handle files with no extensions', async () => {
    const mockOctokit = new MockOctokit();
    const pr = {
      files: {
        nodes: [
          {
            path: 'Makefile',
            additions: 10,
            deletions: 5
          }
        ]
      }
    };

    const result = await getFilesChangedType(mockOctokit as any, pr);
    expect(result).toBeNull();
  });

  it('should combine changes from multiple files of the same type', async () => {
    const mockOctokit = new MockOctokit();
    const pr = {
      files: {
        nodes: [
          {
            path: 'readme.md',
            additions: 5,
            deletions: 3
          },
          {
            path: 'docs/guide.md',
            additions: 10,
            deletions: 2
          }
        ]
      }
    };

    const result = await getFilesChangedType(mockOctokit as any, pr);
    expect(result).toBe('Documentation'); // Total 20 changes in documentation
  });

  it('should correctly handle mixed file types with various change counts', async () => {
    const mockOctokit = new MockOctokit();
    const pr = {
      files: {
        nodes: [
          {
            path: 'readme.md',
            additions: 2,
            deletions: 1
          },
          {
            path: 'script.py',
            additions: 3,
            deletions: 2
          },
          {
            path: 'component.jsx',
            additions: 10,
            deletions: 5
          }
        ]
      }
    };

    const result = await getFilesChangedType(mockOctokit as any, pr);
    expect(result).toBe('Frontend'); // Frontend has 15 changes vs Python 5 vs Documentation 3
  });
});