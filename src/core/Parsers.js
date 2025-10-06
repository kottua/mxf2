export function getStaticFromPricingConfig(pricingConfig) {
    if (!pricingConfig || !pricingConfig.content)
        return null;
    return pricingConfig.content.staticConfig;
}
export function getDynamicFromPricingConfig(pricingConfig) {
    if (!pricingConfig || !pricingConfig.content)
        return null;
    return pricingConfig.content.dynamicConfig;
}
