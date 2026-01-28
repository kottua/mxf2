import type { Premises } from "../interfaces/Premises.ts";
import type { RealEstateObjectData } from "../interfaces/RealEstateObjectData.ts";
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

export async function uploadSpecificationFile(
    file: File,
    reoId: number
): Promise<RealEstateObjectData[]> {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const { data } = await api.post<RealEstateObjectData[]>(
            `/premises/upload/specification/${reoId}`, 
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            }
        );

        // Validate that we received an array
        if (!Array.isArray(data)) {
            console.error('API response is not an array:', data);
            throw new Error('API response is not in expected format');
        }
        
        return data;
    } catch (error: any) {
        throw error;
    }
}

export async function downloadPremisesExcel(
    reo_id: number,
    distribution_config_id: number
): Promise<void> {
    const response = await api.get(
        `/premises/download/excel/${reo_id}/${distribution_config_id}`,
        {
            responseType: 'blob',
        }
    );

    // Extract filename from Content-Disposition header or use default
    const contentDisposition = response.headers['content-disposition'] || response.headers['Content-Disposition'];
    let filename = `premises_with_actual_price_reo_${reo_id}_dist_${distribution_config_id}.xlsx`;
    
    if (contentDisposition) {
        // Handle both quoted and unquoted filenames: filename="file.xlsx" or filename=file.xlsx
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1].replace(/['"]/g, '');
        }
    }

    // Create blob URL and trigger download
    const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}