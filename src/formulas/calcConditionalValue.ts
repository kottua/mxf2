export function calculateConditionalValue(normContributeRt: number, fitSpreadRate?: number) : number {
    if (fitSpreadRate === 0  || fitSpreadRate === undefined) {
        console.warn('Fit Spread Rate is zero or undefined, using 1e-10 for Conditional Value.');
        fitSpreadRate = 1e-10;
    }
    return normContributeRt / fitSpreadRate;
}