import type {DistributionConfig} from "../interfaces/DistributionConfig.ts";
import type {RealEstateObject} from "../interfaces/RealEstateObject.ts";
import {calculateNormalizedRanks} from "../formulas/calcNormalizedRanks.ts";
import {calculateNormalizedScoring} from "../formulas/calcNormalScoring.ts";
import {calculatePresetValues} from "../formulas/calcPresetValues.ts";
import {calculateMixedScoring} from "../formulas/calcMixedScoring.ts";
import {calculateScope} from "../formulas/calcScope.ts";
import {calculateFitSpreadRate} from "../formulas/calcFitSpreadRate.ts";
import {calculateConditionalCosts} from "../formulas/calcConditionalCosts.ts";
import {calculateNormalizedRunningTotal} from "../formulas/calcNormalizedRunningTotal.ts";
import {calculateActualCosts} from "../formulas/calcActualCosts.ts";
import {calculateRunningTotalMixedScoring} from "../formulas/calcRunningTotalMixedScoring.ts";
import {calculateBasePrice} from "../formulas/calcBasePrice.ts";
import {calculateMinMaxRate} from "../formulas/calcMinMaxRate.ts";
import {calculateMinMaxPrice} from "../formulas/calcMinMaxPrice.ts";
import {calculateSpread} from "../formulas/calcSpread.ts";
import {filterAndScoreFlats} from "../core/filterAndScoreFlats.ts";
import {calculateFinalPrice} from "../formulas/calcFinalPrice.ts";
import {calculateFitCondValues} from "../formulas/calcFitCondValues.ts";
import type {PricingConfig} from "../interfaces/PricingConfig.ts";

interface SelectViewFromDataFrameProps {
    activeConfig: DistributionConfig;
    activeObject?: RealEstateObject;
    pricingConfig: PricingConfig;
}

function ShowCalculationProcessTable({activeConfig, activeObject, pricingConfig}: SelectViewFromDataFrameProps) {
    // step 1
    const pricePerSQM = activeObject.income_plans[activeObject.income_plans.length-1].price_per_sqm;
    const basePrice = calculateBasePrice(pricePerSQM);

    const minRefPrice = pricingConfig.content.staticConfig.minimum_liq_refusal_price;
    const maxRefPrice = pricingConfig.content.staticConfig.maximum_liq_refusal_price;
    const {minLiqRate, maxLiqRate} = calculateMinMaxRate(minRefPrice, maxRefPrice);

    const {minPrice, maxPrice} = calculateMinMaxPrice(basePrice, minLiqRate, maxLiqRate);

    // step 2
    const spread = calculateSpread(maxLiqRate, minLiqRate);

    // step 3
    const flatsWithScores = filterAndScoreFlats(activeObject.premises, activeObject, pricingConfig);

    // step 4
    const rankNorm = calculateNormalizedRanks(flatsWithScores.length);

    // step 5
    const scoreNorm = calculateNormalizedScoring(flatsWithScores);

    // step 6 TODO: check may be exception here
    const presetValues = calculatePresetValues(flatsWithScores.length, activeConfig, rankNorm);

    // step 7
    const spMixed = calculateMixedScoring(scoreNorm, presetValues);

    // step 8
    const spMixedRt = calculateRunningTotalMixedScoring(spMixed);

    // step 9
    const spMixedRtNorm = calculateNormalizedRunningTotal(spMixedRt);

    // step 10
    const spMixedRtNormScope = calculateScope(spMixedRtNorm);

    // step 11
    const fitSpreadRate = calculateFitSpreadRate(spMixedRtNormScope, spread);

    // step 12
    const currentPricePerSQM = activeObject.pricing_configs[activeObject.pricing_configs.length-1].content.staticConfig.current_price_per_sqm;

    // step 13
    const fitCondValues = calculateFitCondValues(spMixedRtNorm, minLiqRate, maxLiqRate, currentPricePerSQM);

    // step 12
    const { conditionalCosts, totalCondCost, premCondCostShr } = calculateConditionalCosts(flatsWithScores, fitCondValues); // Changed here. Was a single value

    // step 14
    const actualCosts = calculateActualCosts(flatsWithScores, currentPricePerSQM, premCondCostShr);

    // step 15
    const actualPricePerSQM = actualCosts.map((cost, i) => {
        const area = flatsWithScores[i].flat.total_area_m2 || 1e-10;
        const result = (cost.actualCost * premCondCostShr[i]) / area;
        return area === 0 ? "N/A" : result;
    });

    // TODO: change hardcoded value
    const engine = "Regular";
    const finalPrices = calculateFinalPrice(basePrice, fitCondValues, engine, pricingConfig.content.staticConfig, minPrice, maxPrice);

    return (
        <section>
            <h2>Процес розрахунків</h2>

            <h2>
                Вибраний конфіг
                <pre>{JSON.stringify(activeConfig, null, 2)}</pre>
            </h2>

            {/*<h2>*/}
            {/*    Вибраний прайсінг конфіг*/}
            {/*    <pre>{JSON.stringify(pricingConfig, null, 2)}</pre>*/}
            {/*</h2>*/}

            <h3>Розрахункові параметри:</h3>
            <ul>
                <li>Spread (OnBoarding Spread): {spread.toFixed(4)}</li>
                <li>Fit Spread Rate: {fitSpreadRate.toFixed(4) ?? "N/A"}</li>
                <li>Scope: {spMixedRtNormScope.toFixed(4)}</li>
                <li>Base Price: {basePrice.toFixed(2)}</li>
                <li>Min Price: {minPrice.toFixed(2)}</li>
                <li>Max Price: {maxPrice.toFixed(2)}</li>
                <li>Min Liq Rate: {minLiqRate.toFixed(4)}</li>
                <li>Max Liq Rate: {maxLiqRate.toFixed(4)}</li>
                <li>Total Conditional Cost: {totalCondCost.toFixed(2)}</li>
                <li>Current Price Per SQM: {currentPricePerSQM.toFixed(2)}</li>
            </ul>

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
                {flatsWithScores.map((premise, i) => (
                    <tr key={`${premise.flat.premises_id}-${i}`}>
                        <td>{premise.flat.premises_id}</td>
                        <td>{premise.flat.number ?? "N/A"}</td>
                        <td>{premise.flat.status ?? "N/A"}</td>
                        <td>{premise.flat.total_area_m2?.toFixed(2) ?? "N/A"}</td>
                        <td>{premise.flat.floor ?? "N/A"}</td>
                        <td>{premise.flat.number_of_unit ?? "N/A"}</td>
                        <td>{premise.scoring === 0 ? "N/A" : premise.scoring?.toFixed(4) ?? "N/A"}</td>
                        <td>{scoreNorm[i]?.toFixed(4) ?? "N/A"}</td>
                        <td>{rankNorm[i]?.toFixed(4) ?? "N/A"}</td>
                        <td>{presetValues[i]?.toFixed(4) ?? "N/A"}</td>
                        <td>{spMixed[i]?.toFixed(4) ?? "N/A"}</td>
                        <td>{spMixedRt[i]?.toFixed(4) ?? "N/A"}</td>
                        <td>{spMixedRtNorm[i]?.toFixed(4) ?? "N/A"}</td>
                        <td>{fitCondValues[i]?.toFixed(4) ?? "N/A"}</td>
                        <td>{conditionalCosts[i]?.cond_cost?.toFixed(2) ?? "N/A"}</td>
                        <td>{premCondCostShr[i]?.toFixed(4) ?? "N/A"}</td>
                        <td>{actualCosts[i]?.actualCost?.toFixed(2) ?? "N/A"}</td>
                        <td>
                            {typeof actualPricePerSQM[i] === "number"
                                ? actualPricePerSQM[i].toFixed(2)
                                : actualPricePerSQM[i] ?? "N/A"}
                        </td>
                        <td>{finalPrices[i]?.toFixed(2) ?? "N/A"}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </section>
    );
}

export default ShowCalculationProcessTable;