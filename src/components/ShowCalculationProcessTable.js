import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { calculateNormalizedRanks, calculateNormalizedScoring, calculatePresetValues, calculateMixedScoring, calculateRunningTotalMixedScoring, calculateNormalizedRunningTotal, calculateScope, calculateFitSpreadRate, calculateConditionalCosts, calculateActualCosts, } from "../core/actualPricePerSQM.ts";
import { calculateOnboardingPrice } from "../core/pricingConfiguration.ts";
// Function to get active configuration
const getActiveConfig = (distribConfigs, activeConfigId) => {
    if (!distribConfigs || !activeConfigId) {
        return null;
    }
    const config = distribConfigs.find((config) => config.id === activeConfigId) || null;
    return config;
};
// Function to calculate conditional costs
const getConditionalCosts = (premise, conditionalValue) => {
    return (premise.total_area_m2 * (conditionalValue || 1)).toFixed(2);
};
function ShowCalculationProcessTable({ premises, scoringData, calculationProcessData, distribConfigs, activeConfigId, activeObject, incomePlans = [], // Default to empty array if not provided
 }) {
    // Get active configuration
    const activeConfig = getActiveConfig(distribConfigs, activeConfigId);
    // Define config for calculateOnboardingPrice
    const config = {
        oversold_method: activeConfig?.content || 'pieces', // Default to 'pieces' if not specified
    };
    // Filter available premises and calculate scoring
    const availablePremisesWithIndices = premises
        .map((premise, index) => ({ premise, originalIndex: index }))
        .filter(({ premise }) => premise.status === "available");
    if (availablePremisesWithIndices.length === 0) {
        return (_jsxs("section", { children: [_jsx("h2", { children: "\u041F\u0440\u043E\u0446\u0435\u0441 \u0440\u043E\u0437\u0440\u0430\u0445\u0443\u043D\u043A\u0456\u0432" }), _jsx("p", { children: "\u041D\u0435\u043C\u0430\u0454 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u0438\u0445 \u043F\u0440\u0438\u043C\u0456\u0449\u0435\u043D\u044C \u0434\u043B\u044F \u0432\u0456\u0434\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u043D\u044F" })] }));
    }
    // Prepare premises with scoring data
    const premisesWithScores = availablePremisesWithIndices.map(({ premise, originalIndex }) => {
        const scoringValue = parseFloat(String(scoringData[premise.id])) || 0;
        const area = parseFloat(premise.total_area_m2.toString()) || 0;
        // Calculate onboarding price for this premise
        const unitData = {
            current_price_per_sqm: activeObject.pricing_configs[activeObject.pricing_configs.length - 1].content.staticConfig.current_price_per_sqm || '0',
        };
        const onboardingPrice = calculateOnboardingPrice(unitData, premises, config, incomePlans);
        return {
            premise,
            originalIndex,
            unitNumber: premise.number,
            scoring: scoringValue,
            area,
            onboardingPrice, // Add onboarding price
        };
    });
    // Sort premises by scoring
    premisesWithScores.sort((a, b) => a.scoring - b.scoring);
    // Calculate all required values using imported functions
    const rank_norm = calculateNormalizedRanks(premisesWithScores.length);
    const score_norm = calculateNormalizedScoring(premisesWithScores);
    const presetConfig = activeConfig?.content || {
        type: "Bimodal",
        params: { mean1: 1 / 3, mean2: 2 / 3, stdDev: 1 / 10 },
    };
    const preset_value = calculatePresetValues(premisesWithScores.length, presetConfig, rank_norm);
    const sp_mixed = calculateMixedScoring(score_norm, preset_value);
    const sp_mixed_rt = calculateRunningTotalMixedScoring(sp_mixed);
    const sp_mixed_rt_norm = calculateNormalizedRunningTotal(sp_mixed_rt);
    const sp_mixed_rt_norm_scope = calculateScope(sp_mixed_rt_norm);
    // Calculate spread from calculation process data
    const spread = calculationProcessData?.onBoardingSpread || 0;
    const fit_spread_rate = calculateFitSpreadRate(sp_mixed_rt_norm_scope, spread);
    // Calculate conditional costs
    const { conditionalCosts, prem_cond_cost_shr } = calculateConditionalCosts(premisesWithScores, sp_mixed_rt_norm, fit_spread_rate);
    // Calculate actual costs
    const currentPricePerSQM = activeObject.pricing_configs[activeObject.pricing_configs.length - 1].content.staticConfig.current_price_per_sqm || 0;
    const actual_costs = calculateActualCosts(premisesWithScores, currentPricePerSQM, prem_cond_cost_shr);
    // Map back to original order for display
    const displayData = premisesWithScores.map((premiseData, index) => {
        return {
            ...premiseData,
            rank_norm: rank_norm[index],
            score_norm: score_norm[index],
            preset_value: preset_value[index],
            sp_mixed: sp_mixed[index],
            sp_mixed_rt: sp_mixed_rt[index],
            sp_mixed_rt_norm: sp_mixed_rt_norm[index],
            fit_cond_value: conditionalCosts[index]?.fit_cond_value || 0,
            cond_cost: conditionalCosts[index]?.cond_cost || 0,
            prem_cond_cost_shr: prem_cond_cost_shr[index] || 0,
            actual_cost: actual_costs[index]?.actual_cost || 0,
            actual_price_per_sqm: actual_costs[index]?.actual_price_per_sqm || "N/A",
            onboardingPrice: premiseData.onboardingPrice, // Include onboarding price
        };
    }).sort((a, b) => a.originalIndex - b.originalIndex);
    return (_jsxs("section", { children: [_jsx("h2", { children: "\u041F\u0440\u043E\u0446\u0435\u0441 \u0440\u043E\u0437\u0440\u0430\u0445\u0443\u043D\u043A\u0456\u0432" }), _jsxs("h2", { children: ["\u0412\u0438\u0431\u0440\u0430\u043D\u0438\u0439 \u043A\u043E\u043D\u0444\u0456\u0433", _jsx("pre", { children: JSON.stringify(activeConfig, null, 2) })] }), _jsx("h3", { children: "\u0420\u043E\u0437\u0440\u0430\u0445\u0443\u043D\u043A\u043E\u0432\u0456 \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u0438:" }), _jsxs("ul", { children: [_jsxs("li", { children: ["Spread (OnBoarding Spread): ", spread.toFixed(4)] }), _jsxs("li", { children: ["Fit Spread Rate: ", fit_spread_rate.toFixed(4)] }), _jsxs("li", { children: ["Scope: ", sp_mixed_rt_norm_scope.toFixed(4)] })] }), _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Premises ID" }), _jsx("th", { children: "Number" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Estimated Area m2" }), _jsx("th", { children: "Floor" }), _jsx("th", { children: "Number of unit" }), _jsx("th", { children: "Scoring" }), _jsx("th", { children: "Normalized Scoring" }), _jsx("th", { children: "Normalized Rank" }), _jsx("th", { children: "Preset Value" }), _jsx("th", { children: "Mixed Scoring" }), _jsx("th", { children: "Running Total Mixed" }), _jsx("th", { children: "Normalized Running Total" }), _jsx("th", { children: "Fit Conditional Value" }), _jsx("th", { children: "Conditional Cost" }), _jsx("th", { children: "Cost Share" }), _jsx("th", { children: "Actual Cost" }), _jsx("th", { children: "Actual price per SQM" }), _jsx("th", { children: "Onboarding Price per SQM" }), " "] }) }), _jsx("tbody", { children: displayData.map((premise) => (_jsxs("tr", { children: [_jsx("td", { children: premise.premise.premises_id }), _jsx("td", { children: premise.premise.number }), _jsx("td", { children: premise.premise.status }), _jsx("td", { children: premise.premise.estimated_area_m2 }), _jsx("td", { children: premise.premise.floor }), _jsx("td", { children: premise.premise.number_of_unit }), _jsx("td", { children: premise.scoring === 0 ? "N/A" : premise.scoring.toFixed(4) }), _jsx("td", { children: premise.score_norm?.toFixed(4) ?? "N/A" }), _jsx("td", { children: premise.rank_norm?.toFixed(4) ?? "N/A" }), _jsx("td", { children: premise.preset_value?.toFixed(4) ?? "N/A" }), _jsx("td", { children: premise.sp_mixed?.toFixed(4) ?? "N/A" }), _jsx("td", { children: premise.sp_mixed_rt?.toFixed(4) ?? "N/A" }), _jsx("td", { children: premise.sp_mixed_rt_norm?.toFixed(4) ?? "N/A" }), _jsx("td", { children: premise.fit_cond_value?.toFixed(4) ?? "N/A" }), _jsx("td", { children: premise.cond_cost?.toFixed(2) ?? "N/A" }), _jsx("td", { children: premise.prem_cond_cost_shr?.toFixed(4) ?? "N/A" }), _jsx("td", { children: premise.actual_cost?.toFixed(2) ?? "N/A" }), _jsx("td", { children: typeof premise.actual_price_per_sqm === "number"
                                        ? premise.actual_price_per_sqm.toFixed(2)
                                        : premise.actual_price_per_sqm }), _jsx("td", { children: premise.onboardingPrice.toFixed(2) }), " "] }, premise.premise.id))) })] })] }));
}
export default ShowCalculationProcessTable;
