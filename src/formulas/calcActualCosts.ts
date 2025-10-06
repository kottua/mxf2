import type {ScoredFlat} from "../interfaces/ScoredFlat.ts";
import type {ActualCost} from "../interfaces/ActualCost.ts";

// TODO: Does it make sense to return N/A or use -1 or something else to indicate N/A?
export function calculateActualCosts(flatsWithScores: ScoredFlat[], currentPricePerSQM: number, premCondCostShr: number[])
    : ActualCost[]
{
    const total_area = flatsWithScores.reduce((sum, flatData) => sum + (flatData.area || 0), 0);
    const actual_cost = total_area * currentPricePerSQM;

    return flatsWithScores.map((flatData, i) => {
        const area = flatData.area || 1e-10; // Avoid division by zero
        const actual_price_per_sqm = area === 0 ? 0: (actual_cost * premCondCostShr[i]) / area;
        return { unitNumber: flatData.unitNumber, actualCost: actual_cost, actualPricePerSQM: actual_price_per_sqm };
    });
}