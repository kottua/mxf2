import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { calculateOnboardingPrice } from "../core/pricingConfiguration.ts";
import styles from "./StaticParameters.module.css";
function StaticParameters({ currentConfig, setStaticConfig, incomePlans, premises }) {
    const [bargainGap, setBargainGap] = useState(0);
    const [maxify_factor, setMaxifyFactor] = useState(0);
    const [current_price_per_sqm, setCurrentPricePerSqm] = useState(0);
    const [minimum_liq_refusal_price, setMinimumLiqRefusalPrice] = useState(0);
    const [maximum_liq_refusal_price, setMaximumLiqRefusalPrice] = useState(0);
    const [overestimate_correct_factor, setOverestimateCorrectFactor] = useState(0);
    const [oversold_method, setOversoldMethod] = useState("pieces");
    const [sigma, setSigma] = useState(0);
    const [similarityThreshold, setSimilarityThreshold] = useState(0);
    const [maxBonus, setMaxBonus] = useState(0);
    const [bonusFactor, setBonusFactor] = useState(0);
    const [bonusScale, setBonusScale] = useState(0);
    useEffect(() => {
        if (currentConfig) {
            setBargainGap(currentConfig.bargainGap);
            setMaxifyFactor(currentConfig.maxify_factor);
            setCurrentPricePerSqm(currentConfig.current_price_per_sqm);
            setMinimumLiqRefusalPrice(currentConfig.minimum_liq_refusal_price);
            setMaximumLiqRefusalPrice(currentConfig.maximum_liq_refusal_price);
            setOverestimateCorrectFactor(currentConfig.overestimate_correct_factor);
            setOversoldMethod(currentConfig.oversold_method);
            setSigma(currentConfig.sigma);
            setSimilarityThreshold(currentConfig.similarityThreshold);
            setMaxBonus(currentConfig.maxBonus);
            setBonusFactor(currentConfig.bonusFactor);
            setBonusScale(currentConfig.bonusScale);
        }
    }, [currentConfig]);
    // TODO FIX CALCULATIONS
    useEffect(() => {
        if (premises && incomePlans.length > 0) {
            console.log('Recalculating price with:', {
                premisesCount: premises.length,
                incomePlansCount: incomePlans.length,
                oversold_method,
            });
            const newPrice = calculateOnboardingPrice({ current_price_per_sqm: current_price_per_sqm.toString() }, premises, { oversold_method: oversold_method }, incomePlans);
            console.log('New calculated price:', newPrice);
            setCurrentPricePerSqm(newPrice);
        }
        else {
            console.log('Cannot calculate - missing data:', {
                hasPremises: !!premises,
                hasIncomePlans: incomePlans.length > 0,
            });
        }
    }, [oversold_method, incomePlans, premises, current_price_per_sqm]);
    function handleSubmit(e) {
        e.preventDefault();
        const newConfig = {
            bargainGap,
            maxify_factor,
            current_price_per_sqm,
            minimum_liq_refusal_price,
            maximum_liq_refusal_price,
            overestimate_correct_factor,
            oversold_method: oversold_method,
            sigma,
            similarityThreshold,
            maxBonus,
            bonusFactor,
            bonusScale
        };
        setStaticConfig(newConfig);
        alert('Статичні параметри збережено!');
    }
    return (_jsxs("section", { className: styles.section, children: [_jsx("h2", { className: styles.title, children: "\u0421\u0442\u0430\u0442\u0438\u0447\u043D\u0456 \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u0438" }), currentConfig && (_jsxs("details", { className: styles.details, children: [_jsx("summary", { className: styles.summary, children: "\u041F\u043E\u0442\u043E\u0447\u043D\u0456 \u0441\u0442\u0430\u0442\u0438\u0447\u043D\u0456 \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u0438" }), _jsx("pre", { className: styles.pre, children: JSON.stringify(currentConfig, null, 2) })] })), _jsxs("form", { onSubmit: handleSubmit, className: styles.form, children: [_jsxs("div", { className: styles.formGrid, children: [_jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "negotiation_discount", className: styles.label, children: "Bargain gap" }), _jsx("input", { type: "number", onChange: (e) => setBargainGap(Number(e.target.value)), id: 'negotiation_discount', step: "0.01", value: bargainGap, className: styles.input })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "maxify_factor", className: styles.label, children: "Maxify factor" }), _jsx("input", { type: "number", onChange: (e) => setMaxifyFactor(Number(e.target.value)), id: 'maxify_factor', step: "0.01", value: maxify_factor, className: styles.input })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "current_price_per_sqm", className: styles.label, children: "Onboarding price per sq.m" }), _jsx("input", { type: "number", id: 'current_price_per_sqm', value: current_price_per_sqm, readOnly: true, className: `${styles.input} ${styles.readonly}` })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "minimum_liq_refusal_price", className: styles.label, children: "Minimum liquidity refusal price per sq.m" }), _jsx("input", { type: "number", onChange: (e) => setMinimumLiqRefusalPrice(Number(e.target.value)), id: 'minimum_liq_refusal_price', step: "0.01", required: true, value: minimum_liq_refusal_price, className: styles.input })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "maximum_liq_refusal_price", className: styles.label, children: "Maximum liquidity refusal price per sq.m" }), _jsx("input", { type: "number", onChange: (e) => setMaximumLiqRefusalPrice(Number(e.target.value)), id: 'maximum_liq_refusal_price', step: "0.01", required: true, value: maximum_liq_refusal_price, className: styles.input })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "overestimate_correct_factor", className: styles.label, children: "Overestimate correction factor" }), _jsx("input", { type: "number", onChange: (e) => setOverestimateCorrectFactor(Number(e.target.value)), id: 'overestimate_correct_factor', step: "0.01", value: overestimate_correct_factor, className: styles.input })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "oversold_method", className: styles.label, children: "Oversold method" }), _jsxs("select", { onChange: (e) => setOversoldMethod(e.target.value), id: 'oversold_method', value: oversold_method, className: styles.select, children: [_jsx("option", { value: "pieces", children: "pieces" }), _jsx("option", { value: "area", children: "area" })] })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "sigma", className: styles.label, children: "Sigma (for similarity)" }), _jsx("input", { type: "number", onChange: (e) => setSigma(Number(e.target.value)), id: 'sigma', step: "0.1", min: "0.1", value: sigma, className: styles.input })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "similarityThreshold", className: styles.label, children: "Similarity Threshold" }), _jsx("input", { type: "number", onChange: (e) => setSimilarityThreshold(Number(e.target.value)), id: 'similarityThreshold', step: "0.01", min: "0", max: "1", value: similarityThreshold, className: styles.input })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "maxBonus", className: styles.label, children: "Max Bonus" }), _jsx("input", { type: "number", onChange: (e) => setMaxBonus(Number(e.target.value)), id: 'maxBonus', step: "0.1", min: "0", value: maxBonus, className: styles.input })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "bonusFactor", className: styles.label, children: "Bonus Factor" }), _jsx("input", { type: "number", onChange: (e) => setBonusFactor(Number(e.target.value)), id: 'bonusFactor', step: "0.01", min: "0", max: "1", value: bonusFactor, className: styles.input })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "bonusScale", className: styles.label, children: "Bonus Scale" }), _jsx("input", { type: "number", onChange: (e) => setBonusScale(Number(e.target.value)), id: 'bonusScale', step: "0.1", min: "0", max: "1", value: bonusScale, className: styles.input })] })] }), _jsx("button", { type: 'submit', className: styles.submitButton, children: "\u0417\u0431\u0435\u0440\u0435\u0433\u0442\u0438 \u0441\u0442\u0430\u0442\u0438\u0447\u043D\u0456 \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u0438" })] })] }));
}
export default StaticParameters;
