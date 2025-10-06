import type {DistributionConfig} from "../interfaces/DistributionConfig.ts";

export function applyDistribution(length: number, presetConfig: DistributionConfig): number[] {
    let type = presetConfig.content.function_type;
    if (type === undefined || typeof type !== "string") {
        console.warn("Warning: function_type is undefined or not a string, defaulting to 'Uniform'");
        type = "Uniform"; // Default to Uniform if type is undefined or not a string
    }
    const params: {
        mean?: number;
        stdDev?: number;
        mean1?: number;
        mean2?: number;
    } = presetConfig.content;
    if (params.mean !== undefined && typeof params.mean !== "number" || type === "Bimodal") {
        console.warn("Warning: mean is not a number, defaulting to 1/3");
    }
    if (params.mean1 !== undefined && typeof params.mean1 !== "number" || type === "Bimodal") {
        console.warn("Warning: mean1 is not a number, defaulting to 1/3");
    }
    if (params.mean2 !== undefined && typeof params.mean2 !== "number" || type === "Bimodal") {
        console.warn("Warning: mean2 is not a number, defaulting to 2/3");
    }
    if (params.stdDev !== undefined && typeof params.stdDev !== "number" || type === "Bimodal") {
        console.warn("Warning: stdDev is not a number, defaulting to 1/10");
    }
    if (type === "Gaussian" && params.mean === undefined || isNaN(params.mean)) {
        console.warn("Warning: mean is undefined or NaN, defaulting to 0.5");
    }
    if (type === "Gaussian" && params.stdDev === undefined || isNaN(params.stdDev) || params.stdDev! <= 0) {
        console.warn("Warning: stdDev is undefined, NaN, or non-positive, defaulting to 1/6");
    }

    if (type === "Bimodal") {
        const { mean1 = 1 / 3, mean2 = 2 / 3, stdDev = 1 / 10 } = params;
        return Array.from({ length }, (_, i) => {
            const x = (i + 1) / length;
            const z1 = (x - mean1) / stdDev;
            const z2 = (x - mean2) / stdDev;
            return Math.exp(-0.5 * z1 * z1) + Math.exp(-0.5 * z2 * z2);
        });
    } else if (type === "Gaussian") {
        const { mean = 0.5, stdDev = 1 / 6 } = params;
        return Array.from({ length }, (_, i) => {
            const x = (i + 1) / length;
            const z = (x - mean) / stdDev;
            return Math.exp(-0.5 * z * z);
        });
    } else if (type === "Uniform") {
        return Array.from({ length }, (_, i) => (i + 1) / length);
    }

    return Array(length).fill(1);
}