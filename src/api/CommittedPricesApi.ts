import { api } from "./BaseApi.ts";

export interface CommittedPricesItem {
    reo_id: number;
    pricing_config_id: number;
    distribution_config_id: number;
    is_active: boolean;
    actual_price: number;
    x_rank: number;
    content: Record<string, any>;
}

export interface BulkCommittedPricesRequest {
    commited_prices: CommittedPricesItem[];
}

export async function saveCommittedPrices(request: BulkCommittedPricesRequest): Promise<any> {
    try {
        console.log("Sending request to API:", request);
        const { data } = await api.post("/committed-prices/bulk", request);
        return data;
    } catch (error) {
        console.error("Error saving committed prices:", error);
        throw new Error("Не вдалося зберегти ціни");
    }
}
