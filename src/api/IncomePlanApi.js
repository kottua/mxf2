import { api } from "./BaseApi.ts";

export async function updateIncomePlanBulk(request) {
    const { data } = await api.post("/income-plans/bulk", {
        "plans": request
    });
    return data;
}

export async function uploadIncomePlansFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('Sending income plans file to API');
    
    const { data } = await api.post(
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
