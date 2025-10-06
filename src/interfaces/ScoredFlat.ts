import type {Premises} from "./Premises.ts";

export interface ScoredFlat {
    flat: Premises;
    originalIndex: number;
    unitNumber: number;
    scoring: number;
    area: number;
}