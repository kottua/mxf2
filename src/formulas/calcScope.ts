export function calculateScope (spMixedRtNorm: number[]): number {
    return Math.max(...spMixedRtNorm) - Math.min(...spMixedRtNorm);
}
