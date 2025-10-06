import type {RealEstateObjectData} from "../interfaces/RealEstateObjectData.ts";
import type {PremisesCreateRequest} from "../api/PremisesApi.ts";
import type {IncomePlanData} from "../interfaces/IncomePlanData.ts";
import type {IncomePlanCreateRequest} from "../api/IncomePlanApi.ts";
import type {Premises} from "../interfaces/Premises.ts";
import type {IncomePlan} from "../interfaces/IncomePlan.ts";

export function transformToPremisesCreateRequest (data: RealEstateObjectData[], reoId: number): PremisesCreateRequest[] {
    return data.map((item) => ({
        reo_id: reoId,
        property_type: item['Property type'] ?? '', // Provide default if undefined
        premises_id: String(item['Premises ID'] ?? ''), // Convert to string
        number_of_unit: Number(item['Number of unit'] ?? 0), // Convert to number
        number: Number(item.Number ?? 0), // Convert to number
        entrance: String(item.Entrance ?? ''), // Convert to string
        floor: Number(item.Floor ?? 0), // Convert to number
        layout_type: item['Layout type'] ?? '', // Provide default if undefined
        full_price: item['Full price'], // Optional, no default needed
        total_area_m2: Number(item['Total area, m2']), // Convert to number
        estimated_area_m2: Number(item['Estimated area, m2']), // Convert to number
        price_per_meter: Number(item['Price per meter']), // Convert to number
        number_of_rooms: Number(item['Number of rooms']), // Convert to number
        living_area_m2: item['Living area, m2'], // Optional, no default needed
        kitchen_area_m2: item['Kitchen area, m2'], // Optional, no default needed
        view_from_window: item['View from window'], // Optional, no default needed
        number_of_levels: item['Number of levels'], // Optional, no default needed
        number_of_loggias: item['Number of loggias'], // Optional, no default needed
        number_of_balconies: item['Number of balconies'], // Optional, no default needed
        number_of_bathrooms_with_toilets: item['Number of bathrooms with toilets'], // Optional
        number_of_separate_bathrooms: item['Number of separate bathrooms'], // Optional
        number_of_terraces: item['Number of terraces'], // Optional
        studio: Boolean(item.Studio ?? false), // Convert to boolean
        status: item.Status ?? '', // Provide default if undefined
        sales_amount: item['Sales amount'], // Optional, no default needed
        customcontent: item.custom_fields, // Map custom_fields to customcontent
    }));
}

export function transformToIncomePlanCreateRequest(data: IncomePlanData[], reoId: number): IncomePlanCreateRequest[] {
    return data.map((item) => ({
        reo_id: reoId,
        property_type: item['Property type'] ?? '', // Provide default if undefined
        period_begin: String(item['period_begin'] ?? ''), // Convert to string
        period_end: String(item['period_end'] ?? ''), // Convert to string
        area: Number(item.area ?? 0), // Convert to number
        planned_sales_revenue: Number(item.planned_sales_revenue ?? 0), // Convert to number
        price_per_sqm: Number(item.price_per_sqm ?? 0), // Convert to number
        price_per_sqm_end: Number(item.price_per_sqm_end ?? 0), // Convert to number
    }));
}

export function mapPremisesToRealEstateObjectData(premises: Premises[]): RealEstateObjectData[] {
    return premises.map(premise => ({
        'Property type': premise.property_type,
        'Premises ID': premise.premises_id,
        'Number of unit': premise.number_of_unit,
        Number: premise.number,
        Entrance: premise.entrance,
        Floor: premise.floor,
        'Layout type': premise.layout_type,
        'Full price': premise.full_price,
        'Total area, m2': premise.total_area_m2,
        'Estimated area, m2': premise.estimated_area_m2,
        'Price per meter': premise.price_per_meter,
        'Number of rooms': premise.number_of_rooms,
        'Living area, m2': premise.living_area_m2,
        'Kitchen area, m2': premise.kitchen_area_m2,
        'View from window': premise.view_from_window,
        'Number of levels': premise.number_of_levels,
        'Number of loggias': premise.number_of_loggias,
        'Number of balconies': premise.number_of_balconies,
        'Number of bathrooms with toilets': premise.number_of_bathrooms_with_toilets,
        'Number of separate bathrooms': premise.number_of_separate_bathrooms,
        'Number of terraces': premise.number_of_terraces,
        Studio: premise.studio,
        Status: premise.status,
        'Sales amount': premise.sales_amount,
        custom_fields: premise.customcontent,
    }));
}


export function mapIncomePlanToIncomePlanData(incomePlans: IncomePlan[]): IncomePlanData[] {
    return incomePlans.map(plan => ({
        'Property type': plan.property_type,
        period_begin: plan.period_begin,
        period_end: plan.period_end,
        area: plan.area,
        planned_sales_revenue: plan.planned_sales_revenue,
        price_per_sqm: plan.price_per_sqm,
        price_per_sqm_end: plan.price_per_sqm_end,
    }));
}