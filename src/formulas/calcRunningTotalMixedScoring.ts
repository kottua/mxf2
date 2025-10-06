export function calculateRunningTotalMixedScoring(spMixed: number[]): number[] {
    const sp_mixed_rt = new Array(spMixed.length).fill(0);
    for (let i = 0; i < spMixed.length; i++) {
        sp_mixed_rt[i] = i === 0 ? 0 : sp_mixed_rt[i - 1] + spMixed[i];
    }
    return sp_mixed_rt;
}
