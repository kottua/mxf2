export function scoring(unitData, specData, dynamicConfig, staticConfig, ranging) {
    if (!specData || !Array.isArray(specData) || specData.length === 0)
        return "0.0000";
    const selectedFields = Object.keys(dynamicConfig.importantFields).filter((f) => dynamicConfig.importantFields[f]);
    if (selectedFields.length === 0)
        return "0.0000";
    const scoringFields = selectedFields.map((field) => ({
        field,
        weight: dynamicConfig.weights[field] || 0,
        priorities: ranging[field] || []
    }));
    const weights = scoringFields.map((field) => parseFloat(field.weight.toString()) || 0);
    const getRankForField = (flat, fieldConfig) => {
        const fieldName = fieldConfig.field;
        const priorities = fieldConfig.priorities || [];
        const value = flat[fieldName];
        if (typeof value === "number" || !isNaN(parseFloat(value))) {
            const numericValue = typeof value === "number" ? value : parseFloat(value);
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
    const maxRanks = scoringFields.map((fieldConfig) => Math.max(...(fieldConfig.priorities?.map(p => p.priority) || [1]), 1));
    const soldFlats = specData
        .filter((flat) => flat.status === "sold")
        .map((flat) => ({
        flat,
        features: scoringFields.map((fieldConfig) => getRankForField(flat, fieldConfig)),
        soldScore: 1.0,
    }));
    const targetRanks = scoringFields.map((fieldConfig) => getRankForField(unitData, fieldConfig));
    const targetFlat = { features: targetRanks };
    if (soldFlats.length === 0) {
        const inverseRanks = targetRanks.map((rank, i) => maxRanks[i] - rank + 1);
        const rawScore = inverseRanks.reduce((sum, rank, i) => sum + rank * weights[i], 0);
        return rawScore.toFixed(4);
    }
    let totalScore = 0;
    let totalWeight = 0;
    const similarityThreshold = staticConfig.similarityThreshold || 0.1;
    const sigma = staticConfig.sigma || 1.0;
    const maxBonus = staticConfig.maxBonus || 1.0;
    const bonusFactor = staticConfig.bonusFactor || 0.2;
    soldFlats.forEach((soldFlat) => {
        const distanceSquared = soldFlat.features.reduce((acc, val, i) => {
            const diff = targetFlat.features[i] - val;
            return acc + weights[i] * diff * diff;
        }, 0);
        const similarity = Math.exp(-distanceSquared / (2 * sigma * sigma));
        if (similarity > similarityThreshold) {
            let bonus = 0;
            const maxDiff = Math.max(...maxRanks);
            soldFlat.features.forEach((rank, i) => {
                const diff = Math.abs(targetFlat.features[i] - rank);
                bonus += maxBonus * (1 - (diff / maxDiff) * bonusFactor);
            });
            bonus = bonus / soldFlat.features.length;
            totalScore += similarity * (1 + bonus);
            totalWeight += similarity;
        }
    });
    const finalScore = totalWeight > 0 ? totalScore / totalWeight : 0;
    return finalScore.toFixed(4);
}
