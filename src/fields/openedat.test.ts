import { getOpenedAt } from "./openedat.js";
import type { PaginatedOctokit } from "../utils.js";

describe("getOpenedAt", () => {
    test("should return a date equal to pr.createdAt with time component removed", async () => {
        // Mock PR object with createdAt
        const mockPr = {
            createdAt: "2023-06-15T14:30:00Z"
        };

        // Mock octokit (not used in this function but required by type)
        const mockOctokit: PaginatedOctokit = {} as any;

        // Call the function
        const result = await getOpenedAt(mockOctokit, mockPr);

        // Expect result to be a Date object
        expect(result).toBeInstanceOf(Date);

        // Check that the date is correct (2023-06-15)
        expect(result.getUTCFullYear()).toBe(2023);
        expect(result.getUTCMonth()).toBe(5); // June is month 5 (0-indexed)
        expect(result.getUTCDate()).toBe(15);

        // Check that the time component is removed (00:00:00.000 UTC)
        expect(result.getUTCHours()).toBe(0);
        expect(result.getUTCMinutes()).toBe(0);
        expect(result.getUTCSeconds()).toBe(0);
        expect(result.getUTCMilliseconds()).toBe(0);
    });

    test("should handle different date formats correctly", async () => {
        const mockPr = {
            createdAt: "2022-01-01T23:59:59.999Z"
        };

        const mockOctokit: PaginatedOctokit = {} as any;
        const result = await getOpenedAt(mockOctokit, mockPr);

        expect(result).toBeInstanceOf(Date);
        expect(result.getUTCFullYear()).toBe(2022);
        expect(result.getUTCMonth()).toBe(0); // January is month 0 (0-indexed)
        expect(result.getUTCDate()).toBe(1);

        // Time should still be zeroed out
        expect(result.getUTCHours()).toBe(0);
        expect(result.getUTCMinutes()).toBe(0);
        expect(result.getUTCSeconds()).toBe(0);
        expect(result.getUTCMilliseconds()).toBe(0);
    });

    test("should handle edge case dates", async () => {
        // Test leap year date
        const mockPr = {
            createdAt: "2020-02-29T12:00:00Z" // Leap year
        };

        const mockOctokit: PaginatedOctokit = {} as any;
        const result = await getOpenedAt(mockOctokit, mockPr);

        expect(result).toBeInstanceOf(Date);
        expect(result.getUTCFullYear()).toBe(2020);
        expect(result.getUTCMonth()).toBe(1); // February is month 1 (0-indexed)
        expect(result.getUTCDate()).toBe(29);

        // Time should still be zeroed out
        expect(result.getUTCHours()).toBe(0);
        expect(result.getUTCMinutes()).toBe(0);
        expect(result.getUTCSeconds()).toBe(0);
        expect(result.getUTCMilliseconds()).toBe(0);
    });

    test("should handle dates at different times of day", async () => {
        const mockPr = {
            createdAt: "2023-12-25T05:45:30.123Z" // Early morning
        };

        const mockOctokit: PaginatedOctokit = {} as any;
        const result = await getOpenedAt(mockOctokit, mockPr);

        expect(result).toBeInstanceOf(Date);
        expect(result.getUTCFullYear()).toBe(2023);
        expect(result.getUTCMonth()).toBe(11); // December is month 11 (0-indexed)
        expect(result.getUTCDate()).toBe(25);

        // Time should still be zeroed out regardless of original time
        expect(result.getUTCHours()).toBe(0);
        expect(result.getUTCMinutes()).toBe(0);
        expect(result.getUTCSeconds()).toBe(0);
        expect(result.getUTCMilliseconds()).toBe(0);
    });

    test("should handle minimal date values", async () => {
        const mockPr = {
            createdAt: "1970-01-01T00:00:00Z" // Unix epoch
        };

        const mockOctokit: PaginatedOctokit = {} as any;
        const result = await getOpenedAt(mockOctokit, mockPr);

        expect(result).toBeInstanceOf(Date);
        expect(result.getUTCFullYear()).toBe(1970);
        expect(result.getUTCMonth()).toBe(0); // January is month 0 (0-indexed)
        expect(result.getUTCDate()).toBe(1);

        // Time should still be zeroed out
        expect(result.getUTCHours()).toBe(0);
        expect(result.getUTCMinutes()).toBe(0);
        expect(result.getUTCSeconds()).toBe(0);
        expect(result.getUTCMilliseconds()).toBe(0);
    });
});