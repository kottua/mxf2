export interface DynamicParametersConfig {
    importantFields: Record<string, boolean>; // e.g {'floor': true, 'area': false}
    weights: Record<string, number>; // e.g {'floor': 0.3, 'area': 0.7}
}