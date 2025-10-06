import type {PricingConfig} from "../interfaces/PricingConfig.ts";
import type {StaticParametersConfig} from "../interfaces/StaticParameters.ts";
import type {DynamicParametersConfig} from "../interfaces/DynamicParametersConfig.ts";

export function getStaticFromPricingConfig(pricingConfig: PricingConfig): StaticParametersConfig | null {
    if (!pricingConfig || !pricingConfig.content)  return null;

    return pricingConfig.content.staticConfig;
}

export function getDynamicFromPricingConfig(pricingConfig: PricingConfig): DynamicParametersConfig | null {
    if (!pricingConfig || !pricingConfig.content)  return null;

    return pricingConfig.content.dynamicConfig;
}