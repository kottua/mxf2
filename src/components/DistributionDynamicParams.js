import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
function DistributionDynamicParams({ functionName }) {
    const distributionFunctions = {
        uniform: {
            func: "uniform",
            params: {
                k: { default: 1, min: 0, max: 10000000 },
                b: { default: 1, min: 0, max: 10000000 },
            }
        },
        gaussian: {
            func: "gaussian",
            params: {
                mean: { default: 50, min: 0, max: 100 },
                stdDev: { default: 16.67, min: 0.01, max: 50 }
            }
        },
        bimodal: {
            func: "bimodal",
            params: {
                mean1: { default: 33.33, min: 0, max: 100 },
                mean2: { default: 66.67, min: 0, max: 100 },
                stdDev: { default: 10, min: 0.01, max: 50 }
            }
        }
    };
    const functionKey = functionName.toLowerCase();
    const selectedFunction = distributionFunctions[functionKey];
    if (!selectedFunction) {
        return _jsx("p", { children: "\u0412\u0438\u0431\u0435\u0440\u0456\u0442\u044C \u0444\u0443\u043D\u043A\u0446\u0456\u044E \u0434\u0438\u0441\u0442\u0440\u0438\u0431\u0443\u0446\u0456\u0457." });
    }
    if (Object.keys(selectedFunction.params).length === 0) {
        return _jsxs("p", { children: ["\u0424\u0443\u043D\u043A\u0446\u0456\u044F ", functionName, " \u043D\u0435 \u043C\u0430\u0454 \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u0456\u0432 \u0434\u043B\u044F \u043D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F."] });
    }
    return (_jsx(_Fragment, { children: Object.entries(selectedFunction.params).map(([paramName, paramDetails]) => (_jsxs("p", { children: [_jsxs("label", { htmlFor: paramName, children: [paramName, ":"] }), _jsx("input", { type: "number", id: paramName, name: paramName, defaultValue: paramDetails.default, min: paramDetails.min, max: paramDetails.max, step: "0.01" })] }, paramName))) }));
}
export default DistributionDynamicParams;
