import type {Premises} from "../interfaces/Premises.ts";
import {useEffect, useState} from "react";
import type {DynamicParametersConfig} from "../interfaces/DynamicParametersConfig.ts";
import styles from "./DynamicParameters.module.css";

interface DynamicParametersProps {
    premises: Premises[];
    currentConfig: DynamicParametersConfig | null;
    onConfigChange: (config: DynamicParametersConfig) => void;
}

function DynamicParameters({premises, currentConfig, onConfigChange}: DynamicParametersProps) {
    const [config, setConfig] = useState<DynamicParametersConfig>({
        importantFields: {},
        weights: {},
    });
    const selectedFields = Object.keys(config.importantFields);

    useEffect(() => {
        if (currentConfig) {
            setConfig(currentConfig);
        }
    }, [currentConfig]);

    function getAvailableFields(): string[] {
        const firstPremise = premises[0];
        const baseFields = Object.keys(firstPremise).filter(key =>
            key !== 'id' && key !== 'reo_id' && key !== "uploaded" && key !== "customcontent"
        );

        // Отримуємо всі унікальні ключі з customcontent з усіх premises
        const customContentKeys = new Set<string>();
        premises.forEach(premise => {
            if (premise.customcontent && typeof premise.customcontent === 'object') {
                Object.keys(premise.customcontent).forEach(key => {
                    customContentKeys.add(key);
                });
            }
        });

        return [...baseFields, ...Array.from(customContentKeys)];
    }

    function handleFieldToggle(field: string) {
        const newImportantFields = { ...config.importantFields };
        const currentlySelected = newImportantFields[field];

        if (currentlySelected) {
            delete newImportantFields[field];
        } else {
            newImportantFields[field] = true;
        }

        const selectedFields = Object.keys(newImportantFields);
        const newWeights: Record<string, number> = {};

        selectedFields.forEach(fieldName => {
            newWeights[fieldName] = 1 / selectedFields.length;
        });

        const newConfig = {
            importantFields: newImportantFields,
            weights: newWeights,
        }

        setConfig(newConfig);
        onConfigChange(newConfig);
    }

    function handleWeightChange(field: string, newWeight: number) {
        const newWeights = { ...config.weights };
        newWeights[field] = newWeight;

        const totalWeight = Object.values(newWeights).reduce((sum, weight) => sum + weight, 0);
        Object.keys(newWeights).forEach(key => {
            newWeights[key] = newWeights[key] / totalWeight;
        });

        const newConfig = {
            importantFields: config.importantFields,
            weights: newWeights
        };

        setConfig(newConfig);
        onConfigChange(newConfig);
    }

    const totalWeight = Object.values(config.weights).reduce((sum, weight) => sum + weight, 0);
    const availableFields = getAvailableFields();

    if (availableFields.length === 0){
        return (
            <section className={styles.section}>
                <h3>Оберіть поля для аналізу</h3>
                <p>Немає доступних полів для аналізу. Спочатку завантажте дані специфікації.</p>
            </section>
        );
    }

    return (
        <section className={styles.section}>
            <h4>Оберіть поля для аналізу</h4>

            {currentConfig && (
                <details className={styles.currentConfig}>
                    <summary>Поточні динамічні параметри ↓</summary>
                    <pre>{JSON.stringify(currentConfig, null, 2)}</pre>
                </details>
            )}

            <div className={styles.fieldsGrid}>
                {availableFields.map(field => (
                    <label key={field} className={styles.fieldLabel}>
                        <input
                            type="checkbox"
                            checked={!!config.importantFields[field]}
                            onChange={() => handleFieldToggle(field)}
                            id={`${field}_box`}
                        />
                        <span>{field}</span>
                    </label>
                ))}
            </div>

            {selectedFields.length > 0 && (
                <div className={styles.weightsSection}>
                    <h4>Налаштування ваг полів</h4>
                    <div className={styles.totalWeight}>
                        Загальна вага: {(totalWeight * 100).toFixed(1)}%
                    </div>

                    <div className={styles.weightsGrid}>
                        {selectedFields.map(field => (
                            <div key={field} className={styles.weightItem}>
                                <div className={styles.weightHeader}>
                                    <span className={styles.weightFieldName}>{field}</span>
                                    <span className={styles.weightValue}>
                                        {((config.weights[field] || 0) * 100).toFixed(1)}%
                                    </span>
                                </div>

                                <div className={styles.sliderContainer}>
                                    <input
                                        id={`${field}_slider`}
                                        type="range"
                                        min="0"
                                        max="100"
                                        step="1"
                                        value={((config.weights[field] || 0) * 100)}
                                        onChange={(e) => handleWeightChange(field, Number(e.target.value) / 100)}
                                        className={styles.slider}
                                    />
                                    <span className={styles.sliderPercentage}>
                                        {((config.weights[field] || 0) * 100).toFixed(0)}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}

export default DynamicParameters;