import type {Premises} from "../interfaces/Premises.ts";
import type {DynamicParametersConfig} from "../interfaces/DynamicParametersConfig.ts";
import type {StaticParametersConfig} from "../interfaces/StaticParameters.ts";
import { scoring } from "../core/scoring.ts";
import type {ColumnPriorities} from "./PremisesParameters.tsx";
import styles from "./ChessboardTable.module.css";
import { useEffect, useMemo } from "react";

interface ChessboardTableProps {
    premises: Premises[];
    selectedMetric: string;
    dynamicConfig: DynamicParametersConfig;
    staticConfig: StaticParametersConfig;
    ranging: ColumnPriorities;
    setScoringData: (data: Record<number, number | string>) => void;
}

function ChessboardTable({ premises, selectedMetric, staticConfig, dynamicConfig, ranging, setScoringData }: ChessboardTableProps) {
    const scoringData = useMemo(() => {
        return premises.reduce((acc, item) => {
            const score = scoring(
                item,
                premises.filter(flat => flat.id !== item.id),
                dynamicConfig,
                staticConfig,
                ranging
            );
            return { ...acc, [item.id]: score };
        }, {} as Record<number, number>);
    }, [premises, dynamicConfig, staticConfig, ranging]);

    useEffect(() => {
        setScoringData(scoringData);
    }, [scoringData, setScoringData]);

    const floors = [...new Set(premises.map((item) => item.floor))].sort((a, b) => a - b);
    const units = [...new Set(premises.map((item) => item.number_of_unit))].sort((a, b) => a - b);

    function getMetricValue(floor: number, unit: number) {
        const item = premises.find((flat) => flat.floor === floor && flat.number_of_unit === unit);
        if (!item) return "N/A";

        if (selectedMetric === "Unit Number") {
            return item.number;
        } else if (selectedMetric === "Scoring") {
            return scoringData[item.id] ?? "N/A";
        } else if (selectedMetric === "presetValue") {
            // TODO: Логіка для presetValue на основе scoringData
            return "N/A";
        } else if (selectedMetric === "actualPricePerSQM") {
            return item.price_per_meter;
        } else if (selectedMetric === "normContributeRT") {
            // TODO: Логіка
            return "N/A";
        } else if (selectedMetric === "conditionalValue") {
            // TODO: Логіка
            return "N/A";
        } else if (selectedMetric === "conditionalCost") {
            // TODO: Логіка
            return "N/A";
        } else if (selectedMetric === "transformRate") {
            // TODO: Логіка
            return "N/A";
        } else {
            return "N/A";
        }
    }

    const getCellClassName = (value: string | number | undefined) => {
        if (typeof value === 'string' && value.includes('₴')) {
            return styles.currencyCell;
        }
        if (typeof value === 'number' || !isNaN(Number(value))) {
            return styles.numberCell;
        }
        return styles.textCell;
    };

    return (
        <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Шахівниця цін</h2>
            <p className={styles.metricInfo}>Метрика: <strong>{selectedMetric}</strong></p>

            <div className={styles.tableContainer}>
                <table className={styles.chessboardTable}>
                    <thead>
                    <tr>
                        <th className={styles.cornerHeader}>Поверх / Unit</th>
                        {units.map((item) => (
                            <th key={item} className={styles.unitHeader}>
                                №{item}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {floors.map((floor) => (
                        <tr key={floor} className={styles.floorRow}>
                            <td className={styles.floorHeader}>{floor}</td>
                            {units.map((unit) => {
                                const value = getMetricValue(floor, unit);
                                return (
                                    <td key={`${floor}_${unit}`} className={`${styles.cell} ${getCellClassName(value)}`}>
                                        {value}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <div className={styles.tableInfo}>
                <p>Всього поверхів: <strong>{floors.length}</strong></p>
                <p>Всього квартир: <strong>{units.length}</strong></p>
                <p>Всього одиниць: <strong>{premises.length}</strong></p>
            </div>
        </section>
    );
}

export default ChessboardTable;