// Mock the memoize package before importing the module
jest.mock('memoize', () => {
  // Create a simple mock of memoize function
  return jest.fn((fn) => fn); // Return the function itself without memoization for testing
});

import { getAuthorKind } from './authorkind.js';
import { PaginatedOctokit } from '../utils.js';

// Mock the external dependencies
jest.mock('../utils.js', () => ({
  getCollaborators: jest.fn(),
}));

// Create a mock version of Octokit for testing
const mockOctokit = {
  graphql: jest.fn(),
} as unknown as PaginatedOctokit;

describe('getAuthorKind', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return "Bot" for bot authors', async () => {
    const botPRs = [
      { author: { login: 'dependabot' }, repository: { owner: { login: 'testorg' }, name: 'testrepo' } },
      { author: { login: 'pre-commit-ci' }, repository: { owner: { login: 'testorg' }, name: 'testrepo' } },
      { author: { login: 'jupyterhub-bot' }, repository: { owner: { login: 'testorg' }, name: 'testrepo' } },
    ];

    for (const pr of botPRs) {
      const result = await getAuthorKind(mockOctokit, pr);
      expect(result).toBe('Bot');
    }
  });

  it('should return "Maintainer" for collaborators', async () => {
    const { getCollaborators } = jest.requireMock('../utils.js');
    (getCollaborators as jest.MockedFunction<any>).mockResolvedValue(['john-doe']);

    const pr = {
      author: { login: 'john-doe' },
      repository: { owner: { login: 'testorg' }, name: 'testrepo' }
    };

    const result = await getAuthorKind(mockOctokit, pr);
    expect(result).toBe('Maintainer');
    expect(getCollaborators).toHaveBeenCalledWith(mockOctokit, 'testorg', 'testrepo');
  });

  it('should return "Early Contributor" for authors with 2-9 PRs', async () => {
    const { getCollaborators } = jest.requireMock('../utils');
    (getCollaborators as jest.MockedFunction<any>).mockResolvedValue(['other-user']);
    (mockOctokit.graphql as jest.MockedFunction<any>).mockResolvedValue({
      search: { issueCount: 5 }
    });

    const pr = {
      author: { login: 'early-contributor' },
      repository: { owner: { login: 'testorg' }, name: 'testrepo' }
    };

    const result = await getAuthorKind(mockOctokit, pr);
    expect(result).toBe('Early Contributor');
    expect(mockOctokit.graphql).toHaveBeenCalledWith(expect.stringContaining('early-contributor'));
  });

  it('should return "Seasoned Contributor" for authors with 10 or more PRs', async () => {
    const { getCollaborators } = jest.requireMock('../utils');
    (getCollaborators as jest.MockedFunction<any>).mockResolvedValue(['other-user']);
    (mockOctokit.graphql as jest.MockedFunction<any>).mockResolvedValue({
      search: { issueCount: 10 }
    });

    const pr = {
      author: { login: 'seasoned-contributor' },
      repository: { owner: { login: 'testorg' }, name: 'testrepo' }
    };

    const result = await getAuthorKind(mockOctokit, pr);
    expect(result).toBe('Seasoned Contributor');
    expect(mockOctokit.graphql).toHaveBeenCalledWith(expect.stringContaining('seasoned-contributor'));
  });

  it('should properly handle different repository names', async () => {
    const { getCollaborators } = jest.requireMock('../utils');
    (getCollaborators as jest.MockedFunction<any>).mockResolvedValue(['other-user']);
    (mockOctokit.graphql as jest.MockedFunction<any>).mockResolvedValue({
      search: { issueCount: 3 }
    });

    const pr = {
      author: { login: 'contributor' },
      repository: { owner: { login: 'myorg' }, name: 'my_repo' }
    };

    const result = await getAuthorKind(mockOctokit, pr);
    expect(result).toBe('Early Contributor');
    const { getCollaborators: mockGetCollaborators } = jest.requireMock('../utils');
    expect(mockGetCollaborators).toHaveBeenCalledWith(mockOctokit, 'myorg', 'my_repo');
  });
});