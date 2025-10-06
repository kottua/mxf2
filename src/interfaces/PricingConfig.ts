import type { CommittedPrices } from "./CommitedPrices.ts";
import type {RealEstateObject} from "./RealEstateObject.ts";
import type {StaticParametersConfig} from "./StaticParameters.ts";
import type {DynamicParametersConfig} from "./DynamicParametersConfig.ts";
import type {ColumnPriorities} from "../components/PremisesParameters.tsx";

interface Content {
    staticConfig: StaticParametersConfig;
    dynamicConfig: DynamicParametersConfig;
    ranging: ColumnPriorities;
}

export interface PricingConfig {
    id: number;
    is_active: boolean;
    reo_id: number;
    content: Content;
    created_at: string;
    updated_at: string;
    real_estate_object: RealEstateObject;
    committed_prices: CommittedPrices[];
}