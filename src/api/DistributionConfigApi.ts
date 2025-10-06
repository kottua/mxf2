import {api} from "./BaseApi.ts";
import type {DistributionConfig} from "../interfaces/DistributionConfig.ts";


export async function createDistributionConfig(func_name: string, content: Record<string, number|string>){
    const {data} = await api.post("/distribution-configs/", {
        func_name: func_name,
        content: content
    });
    return data;
}

export async function fetchDistributionConfigs(){
    const {data} = await api.get<DistributionConfig[]>("/distribution-configs/");
    return data;
}

export async function fetchDistributionConfig(id: number){
    const {data} = await api.get<DistributionConfig>(`/distribution-configs/${id}/`);
    return data;
}