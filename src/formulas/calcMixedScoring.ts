export function calculateMixedScoring(scoreNorm: number[], presetValues: number[]): number[] {
    return scoreNorm.map((score, i) => score + score * presetValues[i]);
}