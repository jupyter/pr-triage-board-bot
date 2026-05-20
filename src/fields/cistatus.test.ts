/**
 * @jest-environment node
 */

import { getCIStatus } from './cistatus.js';
import type { PaginatedOctokit } from '../utils.js';

// Mock the PaginatedOctokit type for testing
const mockOctokit = {} as PaginatedOctokit;

describe('getCIStatus', () => {
    it('should return "Tests Passing" when statusCheckRollup state is SUCCESS', async () => {
        const mockPR = {
            statusCheckRollup: {
                state: 'SUCCESS'
            },
            url: 'https://example.com/pr/1'
        };

        const result = await getCIStatus(mockOctokit, mockPR);
        expect(result).toBe('Tests Passing');
    });

    it('should return "Tests Failing" when statusCheckRollup state is FAILURE', async () => {
        const mockPR = {
            statusCheckRollup: {
                state: 'FAILURE'
            },
            url: 'https://example.com/pr/2'
        };

        const result = await getCIStatus(mockOctokit, mockPR);
        expect(result).toBe('Tests Failing');
    });

    it('should return null when statusCheckRollup state is neither SUCCESS nor FAILURE', async () => {
        const mockPR = {
            statusCheckRollup: {
                state: 'PENDING'
            },
            url: 'https://example.com/pr/3'
        };

        // We'll spy on console.log to verify it's called when an unhandled state is encountered
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

        const result = await getCIStatus(mockOctokit, mockPR);

        expect(consoleSpy).toHaveBeenCalledWith('found unhandled rollup state');
        expect(consoleSpy).toHaveBeenCalledWith('PENDING');
        expect(consoleSpy).toHaveBeenCalledWith('https://example.com/pr/3');
        expect(result).toBeNull();

        consoleSpy.mockRestore();
    });

    it('should return null when statusCheckRollup is undefined', async () => {
        const mockPR = {
            statusCheckRollup: undefined,
            url: 'https://example.com/pr/4'
        };

        const result = await getCIStatus(mockOctokit, mockPR);
        expect(result).toBeNull();
    });

    it('should return null when statusCheckRollup is null', async () => {
        const mockPR = {
            statusCheckRollup: null,
            url: 'https://example.com/pr/5'
        };

        const result = await getCIStatus(mockOctokit, mockPR);
        expect(result).toBeNull();
    });

    it('should return null when PR object has no statusCheckRollup property', async () => {
        const mockPR = {
            url: 'https://example.com/pr/6'
        };

        const result = await getCIStatus(mockOctokit, mockPR);
        expect(result).toBeNull();
    });

    it('should handle various other statusCheckRollup states as unhandled', async () => {
        const mockPR = {
            statusCheckRollup: {
                state: 'ERROR'
            },
            url: 'https://example.com/pr/7'
        };

        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

        const result = await getCIStatus(mockOctokit, mockPR);

        expect(consoleSpy).toHaveBeenCalledWith('found unhandled rollup state');
        expect(consoleSpy).toHaveBeenCalledWith('ERROR');
        expect(consoleSpy).toHaveBeenCalledWith('https://example.com/pr/7');
        expect(result).toBeNull();

        consoleSpy.mockRestore();
    });
});