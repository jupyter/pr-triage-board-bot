import { getMaintainerEngagement } from './maintainerengagement.js';
import { getCollaborators } from '../utils.js';

// Mock the utils module
jest.mock('../utils.js', () => ({
  getCollaborators: jest.fn(),
}));

describe('getMaintainerEngagement', () => {
  const mockOctokit = {} as any;
  let originalIntersection: any;

  beforeAll(() => {
    // Store original intersection method
    originalIntersection = Set.prototype.intersection;
    
    // Mock Set.intersection for testing purposes
    Set.prototype.intersection = function(otherSet: Set<any>) {
      const result = new Set();
      for (const item of this) {
        if (otherSet.has(item)) {
          result.add(item);
        }
      }
      return result;
    };
  });

  afterAll(() => {
    // Restore original intersection method
    Set.prototype.intersection = originalIntersection;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return "No Maintainer Engagement" when no collaborators participated', async () => {
    // Mock collaborators
    (getCollaborators as jest.MockedFunction<typeof getCollaborators>)
      .mockResolvedValue(['collab1', 'collab2', 'collab3']);

    const mockPR = {
      repository: {
        owner: { login: 'owner' },
        name: 'repo'
      },
      author: { login: 'author' },
      participants: {
        nodes: [
          { login: 'user1' },
          { login: 'user2' }
        ]
      }
    };

    const result = await getMaintainerEngagement(mockOctokit, mockPR);

    expect(getCollaborators).toHaveBeenCalledWith(mockOctokit, 'owner', 'repo');
    expect(result).toBe('No Maintainer Engagement');
  });

  it('should return "No Maintainer Engagement" when only the author participated', async () => {
    // Mock collaborators
    (getCollaborators as jest.MockedFunction<typeof getCollaborators>)
      .mockResolvedValue(['author', 'collab1', 'collab2']);

    const mockPR = {
      repository: {
        owner: { login: 'owner' },
        name: 'repo'
      },
      author: { login: 'author' },
      participants: {
        nodes: [
          { login: 'author' }, // Author is the only participant
        ]
      }
    };

    const result = await getMaintainerEngagement(mockOctokit, mockPR);

    expect(getCollaborators).toHaveBeenCalledWith(mockOctokit, 'owner', 'repo');
    expect(result).toBe('No Maintainer Engagement');
  });

  it('should return "Single Maintainer Engagement" when exactly one collaborator participated', async () => {
    // Mock collaborators
    (getCollaborators as jest.MockedFunction<typeof getCollaborators>)
      .mockResolvedValue(['collab1', 'collab2', 'collab3', 'author']);

    const mockPR = {
      repository: {
        owner: { login: 'owner' },
        name: 'repo'
      },
      author: { login: 'author' },
      participants: {
        nodes: [
          { login: 'collab1' }, // Only one collaborator participated
          { login: 'user1' },
          { login: 'user2' }
        ]
      }
    };

    const result = await getMaintainerEngagement(mockOctokit, mockPR);

    expect(getCollaborators).toHaveBeenCalledWith(mockOctokit, 'owner', 'repo');
    expect(result).toBe('Single Maintainer Engagement');
  });

  it('should return "Multiple Maintainer Engagement" when multiple collaborators participated', async () => {
    // Mock collaborators
    (getCollaborators as jest.MockedFunction<typeof getCollaborators>)
      .mockResolvedValue(['collab1', 'collab2', 'collab3', 'author']);

    const mockPR = {
      repository: {
        owner: { login: 'owner' },
        name: 'repo'
      },
      author: { login: 'author' },
      participants: {
        nodes: [
          { login: 'collab1' }, // First collaborator participated
          { login: 'collab2' }, // Second collaborator participated
          { login: 'user1' },
          { login: 'user2' }
        ]
      }
    };

    const result = await getMaintainerEngagement(mockOctokit, mockPR);

    expect(getCollaborators).toHaveBeenCalledWith(mockOctokit, 'owner', 'repo');
    expect(result).toBe('Multiple Maintainer Engagement');
  });

  it('should exclude the author from collaborators when the author is also a collaborator', async () => {
    // Mock collaborators (author is also a collaborator)
    (getCollaborators as jest.MockedFunction<typeof getCollaborators>)
      .mockResolvedValue(['author', 'collab1', 'collab2']);

    const mockPR = {
      repository: {
        owner: { login: 'owner' },
        name: 'repo'
      },
      author: { login: 'author' },
      participants: {
        nodes: [
          { login: 'author' }, // Author participated but should be excluded from collab count
          { login: 'collab1' }, // Only this collaborator should count
          { login: 'user1' }
        ]
      }
    };

    const result = await getMaintainerEngagement(mockOctokit, mockPR);

    expect(getCollaborators).toHaveBeenCalledWith(mockOctokit, 'owner', 'repo');
    expect(result).toBe('Single Maintainer Engagement'); // Only collab1 should count
  });

  it('should handle empty collaborators list', async () => {
    // Mock empty collaborators
    (getCollaborators as jest.MockedFunction<typeof getCollaborators>)
      .mockResolvedValue([]);

    const mockPR = {
      repository: {
        owner: { login: 'owner' },
        name: 'repo'
      },
      author: { login: 'author' },
      participants: {
        nodes: [
          { login: 'user1' },
          { login: 'user2' }
        ]
      }
    };

    const result = await getMaintainerEngagement(mockOctokit, mockPR);

    expect(getCollaborators).toHaveBeenCalledWith(mockOctokit, 'owner', 'repo');
    expect(result).toBe('No Maintainer Engagement');
  });

  it('should handle empty participants list', async () => {
    // Mock collaborators
    (getCollaborators as jest.MockedFunction<typeof getCollaborators>)
      .mockResolvedValue(['collab1', 'collab2']);

    const mockPR = {
      repository: {
        owner: { login: 'owner' },
        name: 'repo'
      },
      author: { login: 'author' },
      participants: {
        nodes: [] // No participants
      }
    };

    const result = await getMaintainerEngagement(mockOctokit, mockPR);

    expect(getCollaborators).toHaveBeenCalledWith(mockOctokit, 'owner', 'repo');
    expect(result).toBe('No Maintainer Engagement');
  });
});