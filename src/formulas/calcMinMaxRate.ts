export function calculateMinMaxRate(min_liq_refusal_price?: number, max_liq_refusal_price?: number): { minLiqRate: number, maxLiqRate: number } {
    if (min_liq_refusal_price === undefined || isNaN(min_liq_refusal_price) || max_liq_refusal_price === undefined || isNaN(max_liq_refusal_price)) {
        console.error("Invalid input: min_liq_refusal_price or max_liq_refusal_price is undefined or not a number");
        return { minLiqRate: 0, maxLiqRate: 0 };
    }
    if (min_liq_refusal_price === 0) {
        console.warn("Warning: min_liq_refusal_price is zero, using 1e-10");
        min_liq_refusal_price = 1e-10;
    }
    if (max_liq_refusal_price === 0) {
        console.warn("Warning: max_liq_refusal_price is zero, using 1e-10");
        max_liq_refusal_price = 1e-10;
    }
    return { minLiqRate: min_liq_refusal_price, maxLiqRate: max_liq_refusal_price };
}