import type {ActualCost} from "../interfaces/ActualCost.ts";
import type {ScoredFlat} from "../interfaces/ScoredFlat.ts";

// TODO: Does it make sense to return N/A or use -1 or something else to indicate N/A?
export function calculateActualPricePerSQM(flatWithScores: ScoredFlat[], actualCosts: ActualCost[], premCondCostShr: number[]): number[] {
    return actualCosts.map((cost, i) => {
        // if area is 0, use 0.0000000001 to avoid division by zero
        const area = flatWithScores[i].flat.total_area_m2 || 1e-10;
        return (cost.actualCost * premCondCostShr[i]) / area;
    });
}