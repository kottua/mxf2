import type { Premises } from "../interfaces/Premises.ts";
import type { DynamicParametersConfig } from "../interfaces/DynamicParametersConfig.ts";
import type { StaticParametersConfig } from "../interfaces/StaticParameters.ts";
import type { ColumnPriorities } from "../components/PremisesParameters.tsx";

interface FieldConfig {
    field: string;
    weight: number;
    priorities: ColumnPriorities[string];
}

interface SoldFlat {
    flat: Premises;
    features: number[];
    soldScore: number;
}

export function scoring(
    unitData: Premises,
    specData: Premises[],
    dynamicConfig: DynamicParametersConfig,
    staticConfig: StaticParametersConfig,
    ranging: ColumnPriorities
): string {

    if (!specData || !Array.isArray(specData) || specData.length === 0) {
        console.warn('Returning 0.0000 due to empty specData');
        return "0.0000";
    }

    const selectedFields = Object.keys(dynamicConfig.importantFields).filter(
        (f) => dynamicConfig.importantFields[f]
    );
    if (selectedFields.length === 0) {
        console.warn('Returning 0.0000 due to no selected important fields');
        return "0.0000";
    }

    const scoringFields: FieldConfig[] = selectedFields.map((field) => ({
        field,
        weight: dynamicConfig.weights[field] || 0,
        priorities: ranging[field] || []
    }));

    const weights = scoringFields.map((field) => parseFloat(field.weight.toString()) || 0);

    const getRankForField = (flat: Premises, fieldConfig: FieldConfig): number => {
        const fieldName = fieldConfig.field;
        const priorities = fieldConfig.priorities || [];
        const value = flat[fieldName as keyof Premises];

        if (typeof value === "number" || !isNaN(parseFloat(value as string))) {
            const numericValue = typeof value === "number" ? value : parseFloat(value as string);

            for (const priorityGroup of priorities) {
                if (priorityGroup.values.includes(numericValue.toString())) {
                    return priorityGroup.priority;
                }
            }

            return Math.max(...priorities.map(p => p.priority), 1);
        }

        const stringValue = value?.toString() || "";
        for (const priorityGroup of priorities) {
            if (priorityGroup.values.includes(stringValue)) {
                return priorityGroup.priority;
            }
        }

        return Math.max(...priorities.map(p => p.priority), 1);
    };

    const maxRanks = scoringFields.map((fieldConfig) =>
        Math.max(...(fieldConfig.priorities?.map(p => p.priority) || [1]), 1)
    );

    const soldFlats: SoldFlat[] = specData
        .filter((flat) => flat.status === "sold")
        .map((flat) => ({
            flat,
            features: scoringFields.map((fieldConfig) => getRankForField(flat, fieldConfig)),
            soldScore: 1.0,
        }));


    const targetRanks = scoringFields.map((fieldConfig) => getRankForField(unitData, fieldConfig));

    const targetFlat = { features: targetRanks };

    if (soldFlats.length === 0) {
        // Обчислення інвертованих рангів
        const inverseRanks = targetRanks.map((rank, i) => maxRanks[i] - rank + 1);

        // Нормалізація інвертованих рангів
        const normalizedInverseRanks = inverseRanks.map((inverseRank, i) =>
            maxRanks[i] === 0 ? 0 : inverseRank / maxRanks[i]
        );

        // Обчислення скорингу з нормалізованих інвертованих рангів
        const rawScore = normalizedInverseRanks.reduce((sum, normRank, i) => sum + normRank * weights[i], 0);

        return rawScore.toFixed(4);
    }

    // --- НОВА ЛОГІКА ---
    // 1. Для кожного фактора окремо рахуємо similarity з усіма sold
    // 2. Нормалізуємо внески
    // 3. Після нормалізації застосовуємо ваги

    const factorSimilarities: number[] = new Array(scoringFields.length).fill(0);

    soldFlats.forEach((soldFlat) => {
        scoringFields.forEach((fieldConfig, i) => {
            const diff = Math.abs(targetFlat.features[i] - soldFlat.features[i]);
            const normalizedDiff = diff / maxRanks[i];

            // Подібність для фактора (гаусівська)
            const similarity = Math.exp(-normalizedDiff * normalizedDiff / (2 * staticConfig.sigma * staticConfig.sigma));

            if (similarity > staticConfig.similarityThreshold) {
                factorSimilarities[i] += similarity;
            }
        });
    });


    // нормалізація кожного фактора
    const normalizedSimilarities = factorSimilarities.map((s) =>
        s > 0 ? s / Math.max(...factorSimilarities) : 0
    );


    // ваги після нормалізації
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const normalizedWeights = weights.map((w) => (totalWeight > 0 ? w / totalWeight : 0));

    // фінальний скоринг
    const finalScore = normalizedSimilarities.reduce(
        (sum, sim, i) => sum + sim * normalizedWeights[i],
        0
    );

    return finalScore.toFixed(6);
}