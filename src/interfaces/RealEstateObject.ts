import type { CommittedPrices } from "./CommitedPrices";
import type { PricingConfig } from "./PricingConfig";
import type {IncomePlan} from "./IncomePlan.ts";
import type {StatusMapping} from "./StatusMapping.ts";
import type {Premises} from "./Premises.ts";

export interface RealEstateObject {
    id: number;
    name: string;
    lon?: number;
    lat?: number;
    curr?: string;
    url?: string;
    is_deleted: boolean;
    custom_fields?: Record<string, unknown>;
    created: string;
    updated_at: string;
    premises: Premises[];
    pricing_configs: PricingConfig[];
    committed_prices: CommittedPrices[];
    income_plans: IncomePlan[];
    status_mappings: StatusMapping[];

    // one to one -> distribution config
}