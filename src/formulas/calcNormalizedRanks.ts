/**
 * Calculates normalized ranks for a given number of flats.
 * @returns An array of normalized ranks (e.g., [1/n, 2/n, ..., 1] for n flats), or an empty array if input is invalid.
 */
export function calculateNormalizedRanks(flatsCount?: number): number[] {
    // Validate input
    if (flatsCount === undefined || isNaN(flatsCount)) {
        console.error("Invalid input: flatsCount is undefined or not a number");
        return [];
    }
    if (!Number.isInteger(flatsCount)) {
        console.error("Invalid input: flatsCount must be an integer");
        return [];
    }
    if (flatsCount <= 0) {
        console.error("Invalid input: flatsCount must be a positive integer");
        return [];
    }

    // Handle edge case: single flat
    if (flatsCount === 1) {
        console.warn("Warning: flatsCount is 1, returning [0]");
        return [0];
    }

    // Generate ranks [1, 2, ..., flatsCount]
    const maxRank = flatsCount;
    const ascScoringRanks = Array.from({ length: maxRank }, (_, i) => i + 1);

    // Normalize ranks
    return ascScoringRanks.map((rank) => {
        const normalized = rank / maxRank;
        if (normalized === 0) {
            console.warn("Warning: normalized rank is zero, using 1e-10");
            return 1e-10;
        }
        return normalized;
    });
}