import { api } from "./BaseApi.ts";
export async function createDistributionConfig(func_name, content) {
    const { data } = await api.post("/distribution-configs/", {
        func_name: func_name,
        content: content
    });
    return data;
}
export async function fetchDistributionConfigs() {
    const { data } = await api.get("/distribution-configs/");
    return data;
}
