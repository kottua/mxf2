import type { Premises } from "../interfaces/Premises.ts";
import type { RealEstateObject } from "../interfaces/RealEstateObject.ts";
import type {ScoredFlat} from "../interfaces/ScoredFlat.ts";
import {scoring} from "./scoring.ts";
import type {PricingConfig} from "../interfaces/PricingConfig.ts";

/**
 * Filters available flats, calculates their scoring and area, and sorts by scoring.
 * @returns Array of scored flats sorted by scoring in ascending order, or empty array if no flats are available or inputs are invalid.
 */
export function filterAndScoreFlats(
    premises?: Premises[],
    realObject?: RealEstateObject,
    pricing?: PricingConfig
): ScoredFlat [] {
    // Check for valid input
    if (!premises || !Array.isArray(premises) || premises.length === 0) {
        console.error("Invalid input: premises is undefined, not an array, or empty");
        return [];
    }
    if (!realObject || !pricing.content) {
        console.error("Invalid input: realObject or pricing_configs is undefined or empty");
        return [];
    }

    // Get the latest pricing configuration
    const config = pricing.content;
    if (!config || !config.dynamicConfig || !config.staticConfig || !config.ranging) {
        console.error("Invalid input: pricing config is incomplete");
        return [];
    }

    // Get available flats with their original indices
    const availableFlatsWithIndices = premises
        .map((flat, index) => ({ flat, originalIndex: index }))
        .filter(({ flat }) => {
            if (flat.status !== "available") {
                console.warn(`Flat ${flat.id} skipped: status is "${flat.status}"`);
                return false;
            }
            return true;
        });

    if (availableFlatsWithIndices.length === 0) {
        console.warn("No available flats found");
        return [];
    }

    // Calculate scoring and area for each flat, then sort by scoring
    return availableFlatsWithIndices
        .map(({ flat, originalIndex }) => {
            // Check area
            const areaRaw = typeof flat.estimated_area_m2 === "string" ? parseFloat(flat.estimated_area_m2) : flat.estimated_area_m2;
            let area = areaRaw;
            if (isNaN(areaRaw) || areaRaw === undefined) {
                console.error(`Invalid area for flat ${flat.number}: estimated_area_m2 is not a number, using 1e-10`);
                area = 1e-10;
            } else if (areaRaw === 0) {
                console.warn(`Warning: area for flat ${flat.number} is zero, using 1e-10`);
                area = 1e-10;
            }

            // Calculate scoring
            let scoringValue = 0;
            try {
                const scoringRaw = scoring(
                    flat,
                    premises,
                    config.dynamicConfig,
                    config.staticConfig,
                    config.ranging
                );
                scoringValue = parseFloat(scoringRaw);
                if (isNaN(scoringValue) || scoringValue === undefined) {
                    console.error(`Invalid scoring for flat ${flat.number}: scoring is not a number, using 0`);
                    scoringValue = 0;
                } else if (scoringValue === 0) {
                    console.warn(`Warning: scoring for flat ${flat.number} is zero, keeping 0`);
                }
            } catch (error) {
                console.error(`Error calculating scoring for flat ${flat.number}: ${(error as Error).message}`);
                scoringValue = 0;
            }

            return {
                flat,
                originalIndex,
                unitNumber: flat.number,
                scoring: scoringValue,
                area,
            };
        })
        .sort((a, b) => a.scoring - b.scoring); // Sort by scoring in ascending order
}