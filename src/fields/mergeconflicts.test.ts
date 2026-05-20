import { getMergeConflicts } from "./mergeconflicts.js";
import type { PaginatedOctokit } from "../utils.js";

describe("getMergeConflicts", () => {
    let mockOctokit: PaginatedOctokit;
    let mockPr: any;

    beforeEach(() => {
        mockOctokit = {} as PaginatedOctokit;
    });

    it("should return 'Merge Conflicts' when pr.mergeable is 'CONFLICTING'", async () => {
        mockPr = { mergeable: "CONFLICTING" };
        const result = await getMergeConflicts(mockOctokit, mockPr);
        expect(result).toBe("Merge Conflicts");
    });

    it("should return 'No Merge Conflicts' when pr.mergeable is 'MERGEABLE'", async () => {
        mockPr = { mergeable: "MERGEABLE" };
        const result = await getMergeConflicts(mockOctokit, mockPr);
        expect(result).toBe("No Merge Conflicts");
    });

    it("should return null when pr.mergeable is 'UNKNOWN'", async () => {
        mockPr = { mergeable: "UNKNOWN" };
        const result = await getMergeConflicts(mockOctokit, mockPr);
        expect(result).toBeNull();
    });

    it("should return null for other mergeable states", async () => {
        // Test with an undefined mergeable state
        mockPr = { mergeable: undefined };
        const result = await getMergeConflicts(mockOctokit, mockPr);
        expect(result).toBeNull();

        // Test with a null mergeable state
        mockPr = { mergeable: null };
        const result2 = await getMergeConflicts(mockOctokit, mockPr);
        expect(result2).toBeNull();

        // Test with an unknown string value
        mockPr = { mergeable: "SOME_OTHER_STATE" };
        const result3 = await getMergeConflicts(mockOctokit, mockPr);
        expect(result3).toBeNull();
    });
});