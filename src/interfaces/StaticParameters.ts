export interface StaticParametersConfig {
    bargainGap: number;
    maxify_factor: number;
    current_price_per_sqm: number;
    minimum_liq_refusal_price: number;
    maximum_liq_refusal_price: number;
    overestimate_correct_factor: number;
    oversold_method: "pieces" | "area";
    sigma: number;
    similarityThreshold: number;
    // maxBonus: number;
    // bonusFactor: number;
    // bonusScale: number;
    distribConfigId: number;
}
