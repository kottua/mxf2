import type { CommittedPrices } from "./CommitedPrices";

export type ConfigStatus = "default" | "custom";

export interface DistributionConfig {
    id: number;
    func_name: string;
    content: Record<string, unknown>;
    is_active: boolean;
    committed_prices: CommittedPrices[];
    config_status?: ConfigStatus;
}
