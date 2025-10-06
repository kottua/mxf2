import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import styles from "./DynamicParameters.module.css";
function DynamicParameters({ premises, currentConfig, onConfigChange }) {
    const [config, setConfig] = useState({
        importantFields: {},
        weights: {},
    });
    const selectedFields = Object.keys(config.importantFields);
    useEffect(() => {
        if (currentConfig) {
            setConfig(currentConfig);
        }
    }, [currentConfig]);
    function getAvailableFields() {
        const firstPremise = premises[0];
        const baseFields = Object.keys(firstPremise).filter(key => key !== 'id' && key !== 'reo_id' && key !== "uploaded" && key !== "customcontent");
        // Отримуємо всі унікальні ключі з customcontent з усіх premises
        const customContentKeys = new Set();
        premises.forEach(premise => {
            if (premise.customcontent && typeof premise.customcontent === 'object') {
                Object.keys(premise.customcontent).forEach(key => {
                    customContentKeys.add(key);
                });
            }
        });
        return [...baseFields, ...Array.from(customContentKeys)];
    }
    function handleFieldToggle(field) {
        const newImportantFields = { ...config.importantFields };
        const currentlySelected = newImportantFields[field];
        if (currentlySelected) {
            delete newImportantFields[field];
        }
        else {
            newImportantFields[field] = true;
        }
        const selectedFields = Object.keys(newImportantFields);
        const newWeights = {};
        selectedFields.forEach(fieldName => {
            newWeights[fieldName] = 1 / selectedFields.length;
        });
        const newConfig = {
            importantFields: newImportantFields,
            weights: newWeights,
        };
        setConfig(newConfig);
        onConfigChange(newConfig);
    }
    function handleWeightChange(field, newWeight) {
        const newWeights = { ...config.weights };
        newWeights[field] = newWeight;
        const totalWeight = Object.values(newWeights).reduce((sum, weight) => sum + weight, 0);
        Object.keys(newWeights).forEach(key => {
            newWeights[key] = newWeights[key] / totalWeight;
        });
        const newConfig = {
            importantFields: config.importantFields,
            weights: newWeights
        };
        setConfig(newConfig);
        onConfigChange(newConfig);
    }
    const totalWeight = Object.values(config.weights).reduce((sum, weight) => sum + weight, 0);
    const availableFields = getAvailableFields();
    if (availableFields.length === 0) {
        return (_jsxs("section", { className: styles.section, children: [_jsx("h3", { children: "\u041E\u0431\u0435\u0440\u0456\u0442\u044C \u043F\u043E\u043B\u044F \u0434\u043B\u044F \u0430\u043D\u0430\u043B\u0456\u0437\u0443" }), _jsx("p", { children: "\u041D\u0435\u043C\u0430\u0454 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u0438\u0445 \u043F\u043E\u043B\u0456\u0432 \u0434\u043B\u044F \u0430\u043D\u0430\u043B\u0456\u0437\u0443. \u0421\u043F\u043E\u0447\u0430\u0442\u043A\u0443 \u0437\u0430\u0432\u0430\u043D\u0442\u0430\u0436\u0442\u0435 \u0434\u0430\u043D\u0456 \u0441\u043F\u0435\u0446\u0438\u0444\u0456\u043A\u0430\u0446\u0456\u0457." })] }));
    }
    return (_jsxs("section", { className: styles.section, children: [_jsx("h4", { children: "\u041E\u0431\u0435\u0440\u0456\u0442\u044C \u043F\u043E\u043B\u044F \u0434\u043B\u044F \u0430\u043D\u0430\u043B\u0456\u0437\u0443" }), currentConfig && (_jsxs("details", { className: styles.currentConfig, children: [_jsx("summary", { children: "\u041F\u043E\u0442\u043E\u0447\u043D\u0456 \u0434\u0438\u043D\u0430\u043C\u0456\u0447\u043D\u0456 \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u0438 \u2193" }), _jsx("pre", { children: JSON.stringify(currentConfig, null, 2) })] })), _jsx("div", { className: styles.fieldsGrid, children: availableFields.map(field => (_jsxs("label", { className: styles.fieldLabel, children: [_jsx("input", { type: "checkbox", checked: !!config.importantFields[field], onChange: () => handleFieldToggle(field), id: `${field}_box` }), _jsx("span", { children: field })] }, field))) }), selectedFields.length > 0 && (_jsxs("div", { className: styles.weightsSection, children: [_jsx("h4", { children: "\u041D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F \u0432\u0430\u0433 \u043F\u043E\u043B\u0456\u0432" }), _jsxs("div", { className: styles.totalWeight, children: ["\u0417\u0430\u0433\u0430\u043B\u044C\u043D\u0430 \u0432\u0430\u0433\u0430: ", (totalWeight * 100).toFixed(1), "%"] }), _jsx("div", { className: styles.weightsGrid, children: selectedFields.map(field => (_jsxs("div", { className: styles.weightItem, children: [_jsxs("div", { className: styles.weightHeader, children: [_jsx("span", { className: styles.weightFieldName, children: field }), _jsxs("span", { className: styles.weightValue, children: [((config.weights[field] || 0) * 100).toFixed(1), "%"] })] }), _jsxs("div", { className: styles.sliderContainer, children: [_jsx("input", { id: `${field}_slider`, type: "range", min: "0", max: "100", step: "1", value: ((config.weights[field] || 0) * 100), onChange: (e) => handleWeightChange(field, Number(e.target.value) / 100), className: styles.slider }), _jsxs("span", { className: styles.sliderPercentage, children: [((config.weights[field] || 0) * 100).toFixed(0), "%"] })] })] }, field))) })] }))] }));
}
export default DynamicParameters;
