import type {RealEstateObject} from "./RealEstateObject.ts";

export interface IncomePlan {
    id: number;
    uploaded_at: string;
    is_active: boolean;
    reo_id: number;
    property_type: string;
    period_begin: string;
    period_end: string;
    area: number;
    planned_sales_revenue: number;
    price_per_sqm: number;
    price_per_sqm_end: number;
    is_deleted: boolean;
    real_estate_object: RealEstateObject;
}
