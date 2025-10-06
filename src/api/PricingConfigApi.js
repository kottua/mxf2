import { api } from "./BaseApi.ts";
export async function fetchPricingConfig(objId) {
    const { data } = await api.get(`/pricing-configs/${objId}`);
    return data;
}
export async function createPricingConfig(objId, config) {
    const { data } = await api.post('/pricing-configs/', {
        'is_active': true,
        'reo_id': objId,
        'content': config.content
    });
    return data;
}
