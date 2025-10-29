import {useState, useEffect} from "react";
import {calculateScoringByIds} from "../api/ScoringApi.ts";
import {saveCommittedPrices, type CommittedPricesItem, type BulkCommittedPricesRequest} from "../api/CommittedPricesApi.ts";
import {downloadPremisesExcel} from "../api/PremisesApi.ts";
import type {DistributionConfig} from "../interfaces/DistributionConfig.ts";
import type {RealEstateObject} from "../interfaces/RealEstateObject.ts";
import type {PricingConfig} from "../interfaces/PricingConfig.ts";
import {useNotification} from "../hooks/useNotification.ts";

interface SelectViewFromDataFrameProps {
    activeConfig: DistributionConfig;
    activeObject?: RealEstateObject;
    pricingConfig: PricingConfig;
}

function ShowCalculationProcessTable({activeConfig, activeObject, pricingConfig}: SelectViewFromDataFrameProps) {
    const { showError, showSuccess } = useNotification();
    const [scoringLoading, setScoringLoading] = useState(false);
    const [scoringError, setScoringError] = useState<string | null>(null);
    const [scoringData, setScoringData] = useState<any>(null);
    const [saveLoading, setSaveLoading] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [downloadLoading, setDownloadLoading] = useState(false);

    const fetchCalculationData = async () => {
        if (!activeObject?.id || !activeConfig?.id) {
            console.warn("Missing required IDs for calculation");
            return;
        }

        setScoringLoading(true);
        setScoringError(null);
        
        try {
            const data = await calculateScoringByIds(activeObject.id, activeConfig.id);
            setScoringData(data);
        } catch (error) {
            console.error("Error fetching calculation data:", error);
            setScoringError("Не вдалося отримати дані розрахунків з сервера");
        } finally {
            setScoringLoading(false);
        }
    };

    const handleSavePrices = async () => {
        if (!activeObject?.id || !activeConfig?.id || !pricingConfig?.id) {
            console.warn("Missing required IDs for saving prices");
            setSaveError("Відсутні необхідні дані для збереження");
            return;
        }

        if (!scoringData) {
            setSaveError("Спочатку потрібно розрахувати ціни");
            return;
        }

        if (!scoringData.premises || scoringData.premises.length === 0) {
            setSaveError("Немає даних про приміщення для збереження");
            return;
        }

        setSaveLoading(true);
        setSaveError(null);

        try {
            // Подготавливаем массив данных для всех квартир
            const commitedPrices: CommittedPricesItem[] = scoringData.premises
                .filter((premise: any) => premise.calculation)
                .map((premise: any) => ({
                    reo_id: activeObject.id,
                    pricing_config_id: pricingConfig.id,
                    distribution_config_id: activeConfig.id,
                    is_active: true,
                    actual_price: premise.calculation.actual_price_per_sqm || 0,
                    x_rank: premise.calculation.normalized_rank || 0,
                    content: premise
                }));

            const request: BulkCommittedPricesRequest = {
                commited_prices: commitedPrices
            };

            console.log(`Saving committed prices for ${commitedPrices.length} premises:`, request);
            
            await saveCommittedPrices(request);

            showSuccess(`Ціни успішно збережено для ${commitedPrices.length} приміщень!`);
        } catch (error) {
            console.error("Error saving prices:", error);
            setSaveError("Не вдалося зберегти ціни");
            showError("Не вдалося зберегти ціни");
        } finally {
            setSaveLoading(false);
        }
    };

    const handleDownloadSpecification = async () => {
        if (!activeObject?.id || !activeConfig?.id) {
            console.warn("Missing required IDs for downloading specification");
            setSaveError("Відсутні необхідні дані для завантаження");
            return;
        }

        setDownloadLoading(true);
        setSaveError(null);

        try {
            await downloadPremisesExcel(activeObject.id, activeConfig.id);
            showSuccess("Специфікацію успішно завантажено!");
        } catch (error) {
            console.error("Error downloading specification:", error);
            setSaveError("Не вдалося завантажити специфікацію");
            showError("Не вдалося завантажити специфікацію");
        } finally {
            setDownloadLoading(false);
        }
    };

    useEffect(() => {
        fetchCalculationData();
    }, [activeObject?.id, activeConfig?.id]);

    return (
        <section>
            <h2>Процес розрахунків</h2>

            <div style={{ marginTop: 24 }}>
                <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                    <button
                        className="_calculateButton_19p30_143"
                        onClick={fetchCalculationData}
                        disabled={scoringLoading}
                    >
                        {scoringLoading ? "Розрахунок..." : "Розрахувати ціну"}
                    </button>
                    
                    <button
                        className="_calculateButton_19p30_143"
                        onClick={handleSavePrices}
                        disabled={saveLoading || !scoringData}
                        style={{ 
                            backgroundColor: scoringData ? "#28a745" : "#6c757d",
                            color: "white",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "4px",
                            cursor: scoringData ? "pointer" : "not-allowed"
                        }}
                    >
                        {saveLoading 
                            ? `Збереження... (${scoringData?.premises?.length || 0} приміщень)` 
                            : `Зберегти ціни (${scoringData?.premises?.length || 0} приміщень)`
                        }
                    </button>
                    
                    <button
                        className="_calculateButton_19p30_143"
                        onClick={handleDownloadSpecification}
                        disabled={downloadLoading || !activeObject?.id || !activeConfig?.id}
                        style={{ 
                            backgroundColor: (activeObject?.id && activeConfig?.id) ? "#007bff" : "#6c757d",
                            color: "white",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "4px",
                            cursor: (activeObject?.id && activeConfig?.id) ? "pointer" : "not-allowed"
                        }}
                    >
                        {downloadLoading ? "Завантаження..." : "Завантажити Специфікацію"}
                    </button>
                </div>

                {scoringError && (
                    <div style={{ color: "red", marginTop: 12 }}>{scoringError}</div>
                )}

                {saveError && (
                    <div style={{ color: "red", marginTop: 12 }}>{saveError}</div>
                )}

                {scoringData?.premises?.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                        <h3>Результати розрахунків (з API)</h3>
                        
                        {/* Показываем общие параметры */}
                        {scoringData.calculation_params && (
                            <div style={{ marginBottom: 16 }}>
                                <h4>Розрахункові параметри:</h4>
                                <ul>
                                    <li>Spread (OnBoarding Spread): {scoringData.calculation_params.spread?.toFixed(4) ?? "N/A"}</li>
                                    <li>Fit Spread Rate: {scoringData.calculation_params.fit_spread_rate?.toFixed(4) ?? "N/A"}</li>
                                    <li>Scope: {scoringData.calculation_params.scope?.toFixed(4) ?? "N/A"}</li>
                                    <li>Base Price: {scoringData.calculation_params.base_price?.toFixed(2) ?? "N/A"}</li>
                                    <li>Min Price: {scoringData.calculation_params.min_price?.toFixed(2) ?? "N/A"}</li>
                                    <li>Max Price: {scoringData.calculation_params.max_price?.toFixed(2) ?? "N/A"}</li>
                                    <li>Min Liq Rate: {scoringData.calculation_params.min_liq_rate?.toFixed(4) ?? "N/A"}</li>
                                    <li>Max Liq Rate: {scoringData.calculation_params.max_liq_rate?.toFixed(4) ?? "N/A"}</li>
                                    <li>Total Conditional Cost: {scoringData.calculation_params.total_conditional_cost?.toFixed(2) ?? "N/A"}</li>
                                    <li>Current Price Per SQM: {scoringData.calculation_params.current_price_per_sqm?.toFixed(2) ?? "N/A"}</li>
                                </ul>
                            </div>
                        )}

                        <table>
                            <thead>
                            <tr>
                                <th>Premises ID</th>
                                <th>Number</th>
                                <th>Status</th>
                                <th>Estimated Area m²</th>
                                <th>Floor</th>
                                <th>Number of Units</th>
                                <th>Scoring</th>
                                <th>Normalized Scoring</th>
                                <th>Normalized Rank</th>
                                <th>Preset Value</th>
                                <th>Mixed Scoring</th>
                                <th>Running Total Mixed</th>
                                <th>Normalized Running Total</th>
                                <th>Fit Conditional Value</th>
                                <th>Conditional Cost</th>
                                <th>Cost Share</th>
                                <th>Actual Cost</th>
                                <th>Actual Price per SQM</th>
                                <th>Final Price</th>
                            </tr>
                            </thead>
                            <tbody>
                            {scoringData.premises.map((p: any) => {
                                const c = p.calculation || {};
                                const fmt = (v: any, d = 4) => {
                                    if (v === null || v === undefined) return "N/A";
                                    if (typeof v !== "number") return String(v);
                                    return v.toFixed(d);
                                };
                                return (
                                    <tr key={p.premises_id}>
                                        <td>{p.premises_id}</td>
                                        <td>{p.number ?? "N/A"}</td>
                                        <td>{p.status ?? "N/A"}</td>
                                        <td>{p.estimated_area_m2 != null ? Number(p.estimated_area_m2).toFixed(2) : "N/A"}</td>
                                        <td>{p.floor ?? "N/A"}</td>
                                        <td>{p.number_of_unit ?? "N/A"}</td>
                                        <td>{fmt(c.scoring, 4)}</td>
                                        <td>{fmt(c.normalized_scoring, 4)}</td>
                                        <td>{fmt(c.normalized_rank, 4)}</td>
                                        <td>{fmt(c.preset_value, 4)}</td>
                                        <td>{fmt(c.mixed_scoring, 4)}</td>
                                        <td>{fmt(c.running_total_mixed, 4)}</td>
                                        <td>{fmt(c.normalized_running_total, 4)}</td>
                                        <td>{fmt(c.fit_conditional_value, 4)}</td>
                                        <td>{c.conditional_cost != null ? Number(c.conditional_cost).toFixed(2) : "N/A"}</td>
                                        <td>{fmt(c.cost_share, 4)}</td>
                                        <td>{c.actual_cost != null ? Number(c.actual_cost).toFixed(2) : "N/A"}</td>
                                        <td>{c.actual_price_per_sqm != null ? Number(c.actual_price_per_sqm).toFixed(2) : "N/A"}</td>
                                        <td>{c.final_price != null ? Number(c.final_price).toFixed(2) : "N/A"}</td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </section>
    );
}

export default ShowCalculationProcessTable;