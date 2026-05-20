import { getTotalLinesChanged } from './totallineschanged.js';

describe('getTotalLinesChanged', () => {
    // Mock PaginatedOctokit - not used directly in the function logic, so minimal mock is sufficient
    const mockOctokit = {} as any;

    test('should return the sum of additions and deletions when both are present', async () => {
        const pr = {
            additions: 10,
            deletions: 5
        };

        const result = await getTotalLinesChanged(mockOctokit, pr);
        expect(result).toBe(15);
    });

    test('should return correct value when only additions are present', async () => {
        const pr = {
            additions: 20,
            deletions: 0
        };

        const result = await getTotalLinesChanged(mockOctokit, pr);
        expect(result).toBe(20);
    });

    test('should return correct value when only deletions are present', async () => {
        const pr = {
            additions: 0,
            deletions: 15
        };

        const result = await getTotalLinesChanged(mockOctokit, pr);
        expect(result).toBe(15);
    });

    test('should return 0 when both additions and deletions are 0', async () => {
        const pr = {
            additions: 0,
            deletions: 0
        };

        const result = await getTotalLinesChanged(mockOctokit, pr);
        expect(result).toBe(0);
    });

    test('should return correct value with negative additions and positive deletions', async () => {
        const pr = {
            additions: -5,
            deletions: 10
        };

        const result = await getTotalLinesChanged(mockOctokit, pr);
        expect(result).toBe(5);
    });

    test('should handle large numbers correctly', async () => {
        const pr = {
            additions: 999999,
            deletions: 1
        };

        const result = await getTotalLinesChanged(mockOctokit, pr);
        expect(result).toBe(1000000);
    });

    test('should handle edge case where PR object is missing additions or deletions', async () => {
        const pr = {
            additions: 10
            // deletions is missing
        };

        const result = await getTotalLinesChanged(mockOctokit, pr);
        expect(result).toBeNaN();
    });

    test('should handle edge case where PR object is missing deletions', async () => {
        const pr = {
            deletions: 10
            // additions is missing
        };

        const result = await getTotalLinesChanged(mockOctokit, pr);
        expect(result).toBeNaN();
    });

    test('should handle edge case where PR object is missing both additions and deletions', async () => {
        const pr = {};

        const result = await getTotalLinesChanged(mockOctokit, pr);
        expect(result).toBeNaN();
    });

    test('should handle null values for additions and deletions', async () => {
        const pr = {
            additions: null,
            deletions: null
        };

        const result = await getTotalLinesChanged(mockOctokit, pr);
        expect(result).toBe(0);
    });

    test('should handle undefined values for additions and deletions', async () => {
        const pr = {
            additions: undefined,
            deletions: undefined
        };

        const result = await getTotalLinesChanged(mockOctokit, pr);
        expect(result).toBeNaN();
    });
});