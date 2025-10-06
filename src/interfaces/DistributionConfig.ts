import type { CommittedPrices } from "./CommitedPrices";

export interface DistributionConfig {
    id: number;
    func_name: string;
    content: Record<string, unknown>;
    is_active: boolean;
    committed_prices: CommittedPrices[];
}
