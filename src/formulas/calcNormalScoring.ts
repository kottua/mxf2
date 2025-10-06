import type {ScoredFlat} from "../interfaces/ScoredFlat";

/**
 * Calculates normalized scoring values for an array of flats.
 * @returns An array of normalized scoring values (scoring / maxScoring), or an empty array if input is invalid.
 */
export function calculateNormalizedScoring(flatsWithScores: ScoredFlat[]): number[] {
    // Validate input
    if (!flatsWithScores || !Array.isArray(flatsWithScores) || flatsWithScores.length === 0) {
        console.error("Invalid input: flatsWithScores is undefined, not an array, or empty");
        return [];
    }

    const scorings = flatsWithScores.map((flat, index) => {
        if (!flat || typeof flat.scoring !== "number" || isNaN(flat.scoring)) {
            console.error(`Invalid scoring for flat at index ${index}: scoring is not a valid number, using 0`);
            return 0;
        }
        if (flat.scoring === 0) {
            console.warn(`Warning: scoring for flat at index ${index} is zero, keeping 0`);
        }
        return flat.scoring;
    });

    // Find maximum scoring
    const maxScoring = Math.max(...scorings);
    if (maxScoring === -Infinity) {
        console.error("Invalid input: no valid scoring values found");
        return [];
    }
    if (maxScoring === 0) {
        console.warn("Warning: maxScoring is zero, returning array of zeros");
        return new Array(flatsWithScores.length).fill(0);
    }

    return scorings.map((scoring, index) => {
        const normalized = scoring / maxScoring;
        if (isNaN(normalized)) {
            console.error(`Invalid normalized scoring for flat at index ${index}: result is NaN, using 1e-10`);
            return 1e-10;
        }
        if (normalized === 0 && scoring !== 0) {
            console.warn(`Warning: normalized scoring for flat at index ${index} is zero, using 1e-10`);
            return 1e-10;
        }
        return normalized;
    });
}