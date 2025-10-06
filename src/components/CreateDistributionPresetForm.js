import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import DistributionDynamicParams from "./DistributionDynamicParams.tsx";
import { createDistributionConfig } from "../api/DistributionConfigApi.ts";
function CreateDistributionPresetForm({ setDistributeConfig }) {
    const [presetName, setPresetName] = useState("");
    const distributionFunctions = ["Uniform", "Gaussian", "Bimodal"];
    const [functionName, setFunctionName] = useState("Uniform");
    const [presetNameInput, setPresetNameInput] = useState("");
    const distributionFunctionsConfig = {
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
    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        const params = {};
        const selectedConfig = distributionFunctionsConfig[functionName.toLowerCase()];
        if (selectedConfig) {
            Object.keys(selectedConfig.params).forEach(paramName => {
                const value = formData.get(paramName);
                if (value) {
                    params[paramName] = Number(value);
                }
            });
        }
        if (presetName.trim() === "") {
            alert("Будь ласка, введіть назву пресету.");
            return;
        }
        params["function_type"] = functionName;
        try {
            const response = await createDistributionConfig(presetName.toLowerCase(), params);
            setDistributeConfig((prev) => [...prev, response]);
        }
        catch (error) {
            console.error('Error while creating:', error);
        }
    };
    const handleFunctionChange = (newFunctionName) => {
        setFunctionName(newFunctionName);
    };
    const handlePresetNameChange = (name) => {
        setPresetNameInput(name);
        setPresetName(name);
    };
    return (_jsxs("section", { children: [_jsx("h2", { children: "\u0421\u0442\u0432\u043E\u0440\u0438\u0442\u0438 \u043F\u0440\u0435\u0441\u0435\u0442 \u0434\u0438\u0441\u0442\u0440\u0438\u0431\u0443\u0446\u0456\u0457" }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("p", { children: [_jsx("label", { htmlFor: "preset_name", children: "\u041D\u0430\u0437\u0432\u0430 \u043F\u0440\u0435\u0441\u0435\u0442\u0443" }), _jsx("input", { type: "text", id: "preset_name", name: "preset_name", value: presetNameInput, onChange: (e) => handlePresetNameChange(e.target.value), placeholder: "\u0412\u0432\u0435\u0434\u0456\u0442\u044C \u043D\u0430\u0437\u0432\u0443 \u043F\u0440\u0435\u0441\u0435\u0442\u0443", required: true })] }), _jsxs("p", { children: [_jsx("label", { htmlFor: "function_type", children: "\u0422\u0438\u043F \u0444\u0443\u043D\u043A\u0446\u0456\u0457" }), _jsx("select", { name: "function_type", id: "function_type", value: functionName, onChange: (e) => handleFunctionChange(e.target.value), required: true, children: distributionFunctions.map((item, index) => (_jsx("option", { value: item, children: item }, index))) })] }), _jsx(DistributionDynamicParams, { functionName: functionName }), _jsx("button", { type: "submit", children: "\u0417\u0431\u0435\u0440\u0435\u0433\u0442\u0438" })] })] }));
}
export default CreateDistributionPresetForm;
