export function calculateBasePrice(price_per_sqm?: number): number {
    if (price_per_sqm === undefined || isNaN(price_per_sqm)) {
        console.error("Invalid input: price_per_sqm is undefined or not a number");
        return 0;
    }
    if (price_per_sqm === 0) {
        console.warn("Warning: price_per_sqm is zero, using 1e-10");
        price_per_sqm = 1e-10;
    }
    return price_per_sqm;
}