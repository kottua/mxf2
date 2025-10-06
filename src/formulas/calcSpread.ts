export function calculateSpread(maxLiqRate?: number, minLiqRate?: number): number {
    if (maxLiqRate === undefined || minLiqRate === undefined || isNaN(maxLiqRate) || isNaN(minLiqRate)) {
        console.error("Invalid input: maxLiqRate or minLiqRate must be valid numbers");
    }
    if (minLiqRate <= 0) {
        console.warn("Warning: minLiqRate is zero or negative, using 1e-10");
        return (maxLiqRate / 1e-10) - 1;
    }
    return (maxLiqRate / minLiqRate) - 1;
}