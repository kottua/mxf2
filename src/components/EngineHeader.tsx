import type { ChangeEvent } from "react";
import styles from "./EngineHeader.module.css";

interface EngineHeaderProps {
    objectName: string;
    selectedEngine: string;
    setSelectedEngine: (engine: string) => void;
    selectedMetric: string;
    setSelectedMetric: (metric: string) => void;
}

function EngineHeader({
                          objectName,
                          selectedEngine,
                          setSelectedEngine,
                          selectedMetric,
                          setSelectedMetric,
                      }: EngineHeaderProps) {
    const handleEngineChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setSelectedEngine(e.target.value);
    };

    const handleMetricChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setSelectedMetric(e.target.value);
    };

    return (
        <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Назва: {objectName || "Без назви"}</h2>
            <div className={styles.selectorsContainer}>
                <label className={styles.label}>
                    Движок:
                    <select
                        className={styles.select}
                        value={selectedEngine}
                        onChange={handleEngineChange}
                    >
                        <option value="Regular">Regular</option>
                        <option value="Oh, Elon">Oh, Elon</option>
                    </select>
                </label>
                <label className={styles.label}>
                    Метрика:
                    <select
                        className={styles.select}
                        value={selectedMetric}
                        onChange={handleMetricChange}
                    >
                        <option value="Unit Number">Номер квартири</option>
                        <option value="Current price per sqm">Поточна ціна за м²</option>
                        <option value="Scoring">Scoring</option>
                        <option value="Score Mixed">Score Mixed</option>
                        <option value="presetValue">Preset Value</option>
                        <option value="actualPricePerSQM">Actual Price per sqm</option>
                    </select>
                </label>
            </div>
        </section>
    );
}

export default EngineHeader;