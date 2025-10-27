import type {Premises} from "../interfaces/Premises.ts";
import {useEffect, useState} from "react";
import type {DynamicParametersConfig} from "../interfaces/DynamicParametersConfig.ts";
import {getFieldDisplayName} from "../constants/fieldTranslations.ts";
import styles from "./DynamicFilters.module.css";

interface DynamicFiltersProps {
    premises: Premises[];
    currentConfig: DynamicParametersConfig | null;
    onConfigChange: (config: DynamicParametersConfig) => void;
}

function DynamicFilters({premises, currentConfig, onConfigChange}: DynamicFiltersProps) {
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
            <div className={styles.filtersContainer}>
                <h3 className={styles.filtersTitle}>Фільтри</h3>
                <p className={styles.noData}>Немає даних для аналізу.</p>
            </div>
        );
    }

    return (
        <div className={styles.filtersContainer}>
            <h3 className={styles.filtersTitle}>Фільтри</h3>
            
            <div className={styles.filtersSection}>
                <h4 className={styles.sectionTitle}>Фактори диференціації</h4>
                <div className={styles.fieldsList}>
                    {availableFields.map(field => (
                        <label key={field} className={styles.fieldLabel}>
                            <input
                                type="checkbox"
                                checked={!!config.importantFields[field]}
                                onChange={() => handleFieldToggle(field)}
                                className={styles.checkbox}
                            />
                            <span className={styles.fieldName}>{getFieldDisplayName(field)}</span>
                        </label>
                    ))}
                </div>
            </div>

            {selectedFields.length > 0 && (
                <div className={styles.weightsSection}>
                    <h4 className={styles.sectionTitle}>Ваги факторів</h4>
                    <div className={styles.totalWeight}>
                        Загальна вага: {(totalWeight * 100).toFixed(1)}%
                    </div>

                    <div className={styles.weightsList}>
                        {selectedFields.map(field => (
                            <div key={field} className={styles.weightItem}>
                                <div className={styles.weightHeader}>
                                    <span className={styles.weightFieldName}>{getFieldDisplayName(field)}</span>
                                    <span className={styles.weightValue}>
                                        {((config.weights[field] || 0) * 100).toFixed(1)}%
                                    </span>
                                </div>

                                <div className={styles.sliderContainer}>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        step="1"
                                        value={((config.weights[field] || 0) * 100)}
                                        onChange={(e) => handleWeightChange(field, Number(e.target.value) / 100)}
                                        className={styles.slider}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default DynamicFilters;
