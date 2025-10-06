import type {RealEstateObject} from "./RealEstateObject.ts";
import type {Sales} from "./Sales.ts";

export interface Premises {
    id: number;
    reo_id: number;
    uploaded: string;
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
    created_at: string;
    updated_at: string;
    real_estate_object: RealEstateObject;
    sales: Sales[];
}
