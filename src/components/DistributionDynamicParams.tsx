import React from 'react';

interface DistributionDynamicParamsProps {
    functionName: string;
}

interface ParamDetails {
    default: number;
    min: number;
    max: number;
}

interface DistributionFunction {
    func: string;
    params: Record<string, ParamDetails>;
}

function DistributionDynamicParams({ functionName }: DistributionDynamicParamsProps) {
    const distributionFunctions: Record<string, DistributionFunction> = {
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
                mean: { default: 0.50, min: 0, max: 1 },
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

    const functionKey = functionName.toLowerCase();
    const selectedFunction = distributionFunctions[functionKey];

    if (!selectedFunction) {
        return <p>Виберіть функцію дистрибуції.</p>;
    }

    if (Object.keys(selectedFunction.params).length === 0) {
        return <p>Функція {functionName} не має параметрів для налаштування.</p>;
    }

    return (
        <>
            {Object.entries(selectedFunction.params).map(([paramName, paramDetails]) => (
                <p key={paramName}>
                    <label htmlFor={paramName}>
                        {paramName}:
                    </label>
                    <input
                        type="number"
                        id={paramName}
                        name={paramName}
                        defaultValue={paramDetails.default}
                        min={paramDetails.min}
                        max={paramDetails.max}
                        step="0.01"
                    />
                </p>
            ))}
        </>
    );
}

export default DistributionDynamicParams;