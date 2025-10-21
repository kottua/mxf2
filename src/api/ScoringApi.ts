import { api } from "./BaseApi.ts";

// Интерфейс для запроса scoring
export interface ScoringRequest {
    premises: any[];
    realEstateObject: any;
    pricingConfig: any;
    distributionConfig: any;
    incomePlans: any[];
    selectedEngine?: string;
}

// Функция для отправки запроса на вычисление scoring
export async function calculateScoring(request: ScoringRequest): Promise<any> {
    try {
        const { data } = await api.post("/calculate/scoring/", request);
        return data;
    } catch (error) {
        console.error("Error calculating scoring:", error);
        throw new Error("Не вдалося обчислити скоринг");
    }
}

// GET by ids: /calculate/scoring/{reo_id}/{distribution_config_id}
export async function calculateScoringByIds(reoId: number | string, distributionConfigId: number | string): Promise<any> {
    try {
        const { data } = await api.get(`/calculate/scoring/${reoId}/${distributionConfigId}`);
        return data;
    } catch (error) {
        console.error("Error calculating scoring by ids:", error);
        throw new Error("Не вдалося отримати результати скорингу");
    }
}

