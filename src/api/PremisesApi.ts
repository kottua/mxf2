import type { Premises } from "../interfaces/Premises.ts";
import {api} from "./BaseApi.ts";

export interface PremisesCreateRequest {
    reo_id: number;
    property_type: string;
    premises_id: string;
    number_of_unit: number;
    number: number;
    entrance: string;
    floor: number;
    layout_type: string;
    full_price?: number;
    total_area_m2: number;
    estimated_area_m2: number;
    price_per_meter: number;
    number_of_rooms: number;
    living_area_m2?: number;
    kitchen_area_m2?: number;
    view_from_window?: string;
    number_of_levels?: number;
    number_of_loggias?: number;
    number_of_balconies?: number;
    number_of_bathrooms_with_toilets?: number;
    number_of_separate_bathrooms?: number;
    number_of_terraces?: number;
    studio: boolean;
    status: string;
    sales_amount?: number;
    customcontent?: Record<string, unknown>;
}

export async function updatePremisesBulk(request: PremisesCreateRequest[]){
    const { data } = await api.post<Premises[]>("/premises/bulk", {
        "premises": request
    });
    return data;
}