import type { CommittedPrices } from "./CommitedPrices";
import type { PricingConfig } from "./PricingConfig";
import type {IncomePlan} from "./IncomePlan.ts";
import type {StatusMapping} from "./StatusMapping.ts";
import type {Premises} from "./Premises.ts";
import type {LayoutTypeAttachmentResponse} from "../api/LayoutAttachmentApi.ts";
import type {WindowViewAttachmentResponse} from "../api/WindowViewAttachmentApi.ts";

import type { CurrencyEnum, PropertyClassEnum } from "../types/enums";

export interface RealEstateObject {
    id: number;
    name: string;
    lon?: number;
    lat?: number;
    curr?: CurrencyEnum | string;
    property_class?: PropertyClassEnum | string;
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
    layout_type_attachments?: LayoutTypeAttachmentResponse[];
    window_view_attachments?: WindowViewAttachmentResponse[];

    // one to one -> distribution config
}