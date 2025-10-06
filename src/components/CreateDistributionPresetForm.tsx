import React, { type FormEvent, useState } from 'react';
import DistributionDynamicParams from "./DistributionDynamicParams.tsx";
import { createDistributionConfig } from "../api/DistributionConfigApi.ts";
import type {DistributionConfig} from "../interfaces/DistributionConfig.ts";

interface CreateDistributionProps {
    setDistributeConfig: (config: (prev: DistributionConfig[]) => (DistributionConfig | any)[]) => void;
}

interface DistributionFunctionConfig {
    func: string;
    params: Record<string, { default: number; min: number; max: number }>;
}

function CreateDistributionPresetForm({ setDistributeConfig }: CreateDistributionProps) {
    const [presetName, setPresetName] = useState<string>("");
    const distributionFunctions = ["Uniform", "Gaussian", "Bimodal"];
    const [functionName, setFunctionName] = useState("Uniform");
    const [presetNameInput, setPresetNameInput] = useState("");

    const distributionFunctionsConfig: Record<string, DistributionFunctionConfig> = {
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
                mean: { default: 0.5, min: 0, max: 1 },
                stdDev: { default: 20.00, min: 0.01, max: 50 }
            }
        },
        bimodal: {
            func: "bimodal",
            params: {
                mean1: { default: 0.33, min: 0, max: 1 },
                mean2: { default: 0.67, min: 0, max: 1 },
                stdDev: { default: 10, min: 0.01, max: 50 }
            }
        }
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);

        const params: Record<string, number | string> = {};
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
            const response = await createDistributionConfig(
                presetName.toLowerCase(),
                params
            );
            setDistributeConfig((prev: DistributionConfig[]) => [...prev, response]);

        } catch (error) {
            console.error('Error while creating:', error);
        }
    };

    const handleFunctionChange = (newFunctionName: string) => {
        setFunctionName(newFunctionName);
    };

    const handlePresetNameChange = (name: string) => {
        setPresetNameInput(name);
        setPresetName(name);
    };

    return (
        <section>
            <h2>Створити пресет дистрибуції</h2>
            <form onSubmit={handleSubmit}>
                <p>
                    <label htmlFor="preset_name">Назва пресету</label>
                    <input
                        type="text"
                        id="preset_name"
                        name="preset_name"
                        value={presetNameInput}
                        onChange={(e) => handlePresetNameChange(e.target.value)}
                        placeholder="Введіть назву пресету"
                        required
                    />
                </p>

                <p>
                    <label htmlFor="function_type">Тип функції</label>
                    <select
                        name="function_type"
                        id="function_type"
                        value={functionName}
                        onChange={(e) => handleFunctionChange(e.target.value)}
                        required
                    >
                        {distributionFunctions.map((item, index) => (
                            <option value={item} key={index}>
                                {item}
                            </option>
                        ))}
                    </select>
                </p>

                <DistributionDynamicParams functionName={functionName} />

                <button type="submit">Зберегти</button>
            </form>
        </section>
    );
}

export default CreateDistributionPresetForm;