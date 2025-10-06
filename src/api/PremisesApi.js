import { api } from "./BaseApi.ts";
export async function updatePremisesBulk(request) {
    const { data } = await api.post("/premises/bulk", {
        "premises": request
    });
    return data;
}
