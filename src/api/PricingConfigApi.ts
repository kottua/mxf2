import {api} from "./BaseApi.ts";
import type {PricingConfig} from "../interfaces/PricingConfig.ts";

export async function fetchPricingConfig(objId: number){
    const {data} = await api.get<PricingConfig>(`/pricing-configs/${objId}`);
    return data;
}

export async function createPricingConfig(objId: number, config: PricingConfig) {
    const { data } = await api.post<PricingConfig[]>('/pricing-configs/', {
        'is_active': true,
        'reo_id': objId,
        'content': config.content
    });
    return data;
}