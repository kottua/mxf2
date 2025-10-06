import type {RealEstateObject} from "./RealEstateObject.ts";
import type {PricingConfig} from "./PricingConfig.ts";
import type {DistributionConfig} from "./DistributionConfig.ts";

export interface CommittedPrices {
    id: number;
    reo_id: number;
    pricing_config_id: number;
    distribution_config_id: number;
    created_at: string;
    is_active: boolean;
    actual_price: number;
    x_rank: number;
    content: Record<string, unknown>;
    real_estate_object: RealEstateObject;
    pricing_config: PricingConfig;
    distribution_config: DistributionConfig;
}
