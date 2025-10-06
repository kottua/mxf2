import { api } from "./BaseApi.ts";
export async function updateIncomePlanBulk(request) {
    const { data } = await api.post("/income-plans/bulk", {
        "plans": request
    });
    return data;
}
