import type {Premises} from "./Premises.ts";

export interface Sales {
    id: number;
    is_deleted: boolean;
    notified_at?: string;
    premises_id: number;
    saledate: string;
    amount: number;
    premises: Premises;
}