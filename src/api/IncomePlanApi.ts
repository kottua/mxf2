import {api} from "./BaseApi.ts";
import type {IncomePlan} from "../interfaces/IncomePlan.ts";
import type {IncomePlanData} from "../interfaces/IncomePlanData.ts";

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

export async function uploadIncomePlansFile(
    file: File
): Promise<IncomePlanData[]> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post<IncomePlanData[]>(
        "/income-plans/upload/income-plans", 
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        }
    );

    // Validate that we received an array
    if (!Array.isArray(data)) {
        console.error('Income plans API response is not an array:', data);
        throw new Error('Income plans API response is not in expected format');
    }
    
    return data;
}