import type {ScoredFlat} from "../interfaces/ScoredFlat.ts";

export function calculateConditionalCosts (
    flatsWithScores: ScoredFlat[],
    fitCondValues: number[],
): {
    conditionalCosts: { unitNumber: number; fit_cond_value: number; cond_cost: number }[];
    totalCondCost: number;
    premCondCostShr: number[];
} {
    const conditionalCosts: { unitNumber: number; fit_cond_value: number; cond_cost: number }[] = [];
    let totalCondCost = 0;

    flatsWithScores.forEach((flatData, index) => {
        if (index >= fitCondValues.length){
            console.error(`Index ${index} out of bounds for fitCondValues with length ${fitCondValues.length}`);
            return;
        }
        const area = flatData.area || 0;
        const fit_cond_value = fitCondValues[index];
        const cond_cost = fit_cond_value * area;

        conditionalCosts.push({ unitNumber: flatData.unitNumber, fit_cond_value, cond_cost });
        totalCondCost += cond_cost;
    });

    const premCondCostShr = conditionalCosts.map(({ cond_cost }) =>
        totalCondCost === 0 ? 0 : cond_cost / totalCondCost
    );

    return { conditionalCosts, totalCondCost, premCondCostShr };
}
