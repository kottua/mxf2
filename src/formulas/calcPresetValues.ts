import {applyDistribution} from "../core/applyDistribution.ts";
import type {DistributionConfig} from "../interfaces/DistributionConfig.ts";

export function calculatePresetValues(maxRank: number, presetConfig: DistributionConfig, rankNorm: number[]) {
    const rawPresetValues = applyDistribution(maxRank, presetConfig);

    return rankNorm.map((rank) => {
        const index = Math.floor((rank - (1 / maxRank)) * (maxRank - 1));
        return rawPresetValues[index] || rawPresetValues[rawPresetValues.length - 1];
    });
}