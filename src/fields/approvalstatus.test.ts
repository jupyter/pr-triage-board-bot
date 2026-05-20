import { getApprovalStatus } from './approvalstatus.js';

describe('getApprovalStatus', () => {
    // Mock PaginatedOctokit - not used directly in the function logic, so minimal mock is sufficient
    const mockOctokit = {} as any;

    test('should return "Changes Requested" when there is at least one CHANGES_REQUESTED review from maintainer', async () => {
        const pr = {
            reviews: {
                nodes: [
                    {
                        authorCanPushToRepository: true,
                        isMinimized: false,
                        state: "CHANGES_REQUESTED"
                    },
                    {
                        authorCanPushToRepository: true,
                        isMinimized: false,
                        state: "APPROVED"
                    }
                ]
            }
        };

        const result = await getApprovalStatus(mockOctokit, pr);
        expect(result).toBe("Changes Requested");
    });

    test('should return "Maintainer Approved" when there are approvals but no changes requested from maintainers', async () => {
        const pr = {
            reviews: {
                nodes: [
                    {
                        authorCanPushToRepository: true,
                        isMinimized: false,
                        state: "APPROVED"
                    },
                    {
                        authorCanPushToRepository: true,
                        isMinimized: false,
                        state: "COMMENTED"
                    }
                ]
            }
        };

        const result = await getApprovalStatus(mockOctokit, pr);
        expect(result).toBe("Maintainer Approved");
    });

    test('should return null when there are no reviews', async () => {
        const pr = {
            reviews: {
                nodes: []
            }
        };

        const result = await getApprovalStatus(mockOctokit, pr);
        expect(result).toBeNull();
    });

    test('should return null when there are no reviews with nodes property', async () => {
        const pr = {
            reviews: {}
        };

        const result = await getApprovalStatus(mockOctokit, pr);
        expect(result).toBeNull();
    });

    test('should return null when there are no maintainer reviews (authorCanPushToRepository is false)', async () => {
        const pr = {
            reviews: {
                nodes: [
                    {
                        authorCanPushToRepository: false,
                        isMinimized: false,
                        state: "APPROVED"
                    },
                    {
                        authorCanPushToRepository: false,
                        isMinimized: false,
                        state: "CHANGES_REQUESTED"
                    }
                ]
            }
        };

        const result = await getApprovalStatus(mockOctokit, pr);
        expect(result).toBeNull();
    });

    test('should ignore minimized reviews', async () => {
        const pr = {
            reviews: {
                nodes: [
                    {
                        authorCanPushToRepository: true,
                        isMinimized: true,
                        state: "CHANGES_REQUESTED"
                    },
                    {
                        authorCanPushToRepository: true,
                        isMinimized: true,
                        state: "APPROVED"
                    }
                ]
            }
        };

        const result = await getApprovalStatus(mockOctokit, pr);
        expect(result).toBeNull();
    });

    test('should handle mixed maintainer and non-maintainer reviews correctly', async () => {
        const pr = {
            reviews: {
                nodes: [
                    {
                        authorCanPushToRepository: false, // Non-maintainer
                        isMinimized: false,
                        state: "CHANGES_REQUESTED"
                    },
                    {
                        authorCanPushToRepository: true, // Maintainer
                        isMinimized: false,
                        state: "APPROVED"
                    }
                ]
            }
        };

        const result = await getApprovalStatus(mockOctokit, pr);
        expect(result).toBe("Maintainer Approved");
    });

    test('should return null when all maintainer reviews are commented only', async () => {
        const pr = {
            reviews: {
                nodes: [
                    {
                        authorCanPushToRepository: true,
                        isMinimized: false,
                        state: "COMMENTED"
                    },
                    {
                        authorCanPushToRepository: true,
                        isMinimized: false,
                        state: "PENDING"
                    }
                ]
            }
        };

        const result = await getApprovalStatus(mockOctokit, pr);
        expect(result).toBeNull();
    });

    test('should handle PR without reviews property (edge case)', async () => {
        const pr = {};

        // Since the original implementation has a bug where accessing pr.reviews.nodes
        // causes an error when pr.reviews doesn't exist, we expect it to throw
        await expect(getApprovalStatus(mockOctokit, pr)).rejects.toThrow();
    });
});