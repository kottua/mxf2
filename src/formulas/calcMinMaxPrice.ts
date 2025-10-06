export function calculateMinMaxPrice(basePrice?: number, minLiqRate?: number, maxLiqRate?: number): { minPrice: number, maxPrice: number } {
    if (basePrice === undefined || isNaN(basePrice) || minLiqRate === undefined || isNaN(minLiqRate) || maxLiqRate === undefined || isNaN(maxLiqRate)) {
        console.error("Invalid input: basePrice, minLiqRate, or maxLiqRate is undefined or not a number");
        return { minPrice: 0, maxPrice: 0 };
    }
    if (minLiqRate === 0) {
        console.warn("Warning: minLiqRate is zero, using 1e-10");
        minLiqRate = 1e-10;
    }
    if (maxLiqRate === 0) {
        console.warn("Warning: maxLiqRate is zero, using 1e-10");
        maxLiqRate = 1e-10;
    }
    const minPrice = basePrice * minLiqRate;
    const maxPrice = basePrice * maxLiqRate;
    return { minPrice, maxPrice };
}