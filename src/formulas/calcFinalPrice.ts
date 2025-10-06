import type {StaticParametersConfig} from "../interfaces/StaticParameters.ts";

// TODO: use engine name here. now avoiding it for simplicity

export function calculateFinalPrice(
    basePrice: number,
    fitCondValue: number[],
    selectedEngine: string,
    staticConfig: StaticParametersConfig,
    minPrice: number,
    maxPrice: number
): number[] {
    // Check for invalid inputs
    if (!fitCondValue || fitCondValue.length === 0) {
        console.warn('fitCondValue is undefined or empty, returning an array with minPrice.');
        return [minPrice];
    }

    // Calculate price for each fitCondValue
    return fitCondValue.map((value) => {
        // Example for Regular engine
        let price = basePrice * value * (1 - (staticConfig.bargainGap || 0) / 100);

        // Clamp price between minPrice and maxPrice
        price = Math.max(price, minPrice);
        price = Math.min(price, maxPrice || Infinity);

        return price;
    });
}