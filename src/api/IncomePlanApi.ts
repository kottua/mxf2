import {api} from "./BaseApi.ts";
import type {IncomePlan} from "../interfaces/IncomePlan.ts";

export interface IncomePlanCreateRequest {
    reo_id: number;
    property_type: string;
    period_begin: string;
    period_end: string;
    area: number;
    planned_sales_revenue: number;
    price_per_sqm: number;
    price_per_sqm_end: number;
}

export async function updateIncomePlanBulk(request: IncomePlanCreateRequest[]): Promise<IncomePlan[]>{
    const { data } = await api.post<IncomePlan[]>("/income-plans/bulk", {
        "plans": request
    });
    return data;
}