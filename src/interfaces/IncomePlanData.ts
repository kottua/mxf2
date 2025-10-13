export interface IncomePlanData {
    'Property type'?: string;
    'period_begin'?: string | number;
    'period_end'?: string | number;
    'area'?: number;
    'planned_sales_revenue'?: number;
    'price_per_sqm'?: number;
    'price_per_sqm_end'?: number;
    customcontent?: Record<string, unknown>;
}