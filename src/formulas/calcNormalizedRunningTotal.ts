export function calculateNormalizedRunningTotal(spMixedRt: number[]) : number[] {
    const maxSpMixedRt = Math.max(...spMixedRt);
    return spMixedRt.map(value => (maxSpMixedRt === 0 ? 0 : value / maxSpMixedRt));
}