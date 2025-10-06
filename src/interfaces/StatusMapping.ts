import type {RealEstateObject} from "./RealEstateObject.ts";

export interface StatusMapping {
    id: number;
    reo_id: number;
    dev_status: string;
    sys_status: string;
    real_estate_object: RealEstateObject;
}