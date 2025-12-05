import type {Premises} from "../interfaces/Premises.ts";
import {useEffect, useState} from "react";
import type {DynamicParametersConfig} from "../interfaces/DynamicParametersConfig.ts";
import {getFieldDisplayName} from "../constants/fieldTranslations.ts";
import styles from "./DynamicFilters.module.css";
import {api} from "../api/BaseApi.ts";
import {useNotification} from "../hooks/useNotification.ts";

import type {ColumnPriorities} from "./PremisesParameters.tsx";

interface DynamicFiltersProps {
    premises: Premises[];
    currentConfig: DynamicParametersConfig | null;
    onConfigChange: (config: DynamicParametersConfig) => void;
    reoId: number;
    ranging?: ColumnPriorities;
}

function DynamicFilters({premises, currentConfig, onConfigChange, reoId, ranging}: DynamicFiltersProps) {
    const { showSuccess, showError } = useNotification();
    const [config, setConfig] = useState<DynamicParametersConfig>({
        importantFields: {},
        weights: {},
    });
    const [isLoadingBestFlat, setIsLoadingBestFlat] = useState(false);
    const [isLoadingBestFloor, setIsLoadingBestFloor] = useState(false);
    const selectedFields = Object.keys(config.importantFields);

    useEffect(() => {
        if (currentConfig) {
            setConfig(currentConfig);
        }
    }, [currentConfig]);

    type FieldVisibilityRule = 'hidden' | 'always' | 'conditional';

    const fieldVisibilityRules: Record<string, FieldVisibilityRule> = {
        // Hidden fields
        'property_type': 'hidden',
        'premises_id': 'hidden',
        'estimated_area_m2': 'hidden',
        'price_per_meter': 'hidden',
        'status': 'hidden',
        'sales_amount': 'hidden',
        
        // Always show fields
        'number_of_unit': 'always',
        'number': 'always',
        'floor': 'always',
        'layout_type': 'always',
        'total_area_m2': 'always',
        'number_of_rooms': 'always',
        'view_from_window': 'always',
        
        // Conditional fields (show if all premises have defined, two or more different values)
        'entrance': 'conditional',
        'full_price': 'conditional',
        'living_area_m2': 'conditional',
        'kitchen_area_m2': 'conditional',
        'number_of_levels': 'conditional',
        'number_of_loggias': 'conditional',
        'number_of_balconies': 'conditional',
        'number_of_bathrooms_with_toilets': 'conditional',
        'number_of_separate_bathrooms': 'conditional',
        'number_of_terraces': 'conditional',
        'studio': 'conditional',
    };

    function shouldShowConditionalField(fieldName: string): boolean {
        const allDefined = premises.every(premise => {
            const value = premise[fieldName as keyof Premises];
            if (typeof value === 'boolean') {
                return true;
            }
            return value !== undefined && value !== null && value !== '';
        });

        if (!allDefined) {
            return false;
        }

        const values = new Set<string>();
        premises.forEach(premise => {
            const value = premise[fieldName as keyof Premises];
            if (typeof value === 'boolean') {
                values.add(String(value));
            } else if (value !== undefined && value !== null && value !== '') {
                values.add(String(value));
            }
        });

        return values.size >= 2;
    }

    function getAvailableFields(): string[] {
        const firstPremise = premises[0];
        const baseFields = Object.keys(firstPremise).filter(key =>
            key !== 'id' && key !== 'reo_id' && key !== "uploaded" && key !== "customcontent"
        );

        const filteredBaseFields = baseFields.filter(field => {
            const rule = fieldVisibilityRules[field];
            
            if (rule === 'hidden') {
                return false;
            }
            
            if (rule === 'always') {
                return true;
            }
            
            if (rule === 'conditional') {
                return shouldShowConditionalField(field);
            }
            
            return true;
        });

        const customContentKeys = new Set<string>();
        premises.forEach(premise => {
            if (premise.customcontent && typeof premise.customcontent === 'object') {
                Object.keys(premise.customcontent).forEach(key => {
                    customContentKeys.add(key);
                });
            }
        });

        const filteredCustomFields = Array.from(customContentKeys).filter(field => {
            const allDefined = premises.every(premise => {
                const customContent = premise.customcontent;
                if (!customContent || typeof customContent !== 'object') {
                    return false;
                }
                const value = customContent[field];
                return value !== undefined && value !== null && value !== '';
            });

            if (!allDefined) {
                return false;
            }

            const values = new Set<string>();
            premises.forEach(premise => {
                const customContent = premise.customcontent;
                if (customContent && typeof customContent === 'object') {
                    const value = customContent[field];
                    if (value !== undefined && value !== null && value !== '') {
                        values.add(String(value));
                    }
                }
            });

            return values.size >= 2;
        });

        const availableFieldsFromPremises = [...filteredBaseFields, ...filteredCustomFields];
        const availableFieldsSet = new Set(availableFieldsFromPremises);

        // Add fields from currentConfig.importantFields that are not in available fields
        // This ensures that fields like layout_score from API config are shown even if not in premises data
        if (currentConfig && currentConfig.importantFields) {
            Object.keys(currentConfig.importantFields).forEach(field => {
                if (!availableFieldsSet.has(field)) {
                    availableFieldsSet.add(field);
                }
            });
        }

        // Also add fields from ranging that are not in available fields
        // This ensures fields from API response are shown even if not in current premises data
        if (ranging) {
            Object.keys(ranging).forEach(field => {
                if (!availableFieldsSet.has(field)) {
                    availableFieldsSet.add(field);
                }
            });
        }

        return Array.from(availableFieldsSet);
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

    async function handleBestFlatLabel() {
        setIsLoadingBestFlat(true);
        try {
            const response = await api.get(`/agents/best-flat-label/${reoId}`);
            showSuccess('Метку найкращої квартири успішно отримано!');
            console.log('Best flat label response:', response.data);
        } catch (error: any) {
            console.error("Error fetching best flat label:", error);
            showError('Не вдалося отримати метку найкращої квартири.');
        } finally {
            setIsLoadingBestFlat(false);
        }
    }

    async function handleBestFloorLabel() {
        setIsLoadingBestFloor(true);
        try {
            const response = await api.get(`/agents/best-floor/${reoId}`);
            showSuccess('Метку найкращого поверху успішно отримано!');
            console.log('Best floor label response:', response.data);
        } catch (error: any) {
            console.error("Error fetching best floor label:", error);
            showError('Не вдалося отримати метку найкращого поверху.');
        } finally {
            setIsLoadingBestFloor(false);
        }
    }


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
                        <div key={field} className={styles.fieldRow}>
                            <label className={styles.fieldLabel}>
                                <input
                                    type="checkbox"
                                    checked={!!config.importantFields[field]}
                                    onChange={() => handleFieldToggle(field)}
                                    className={styles.checkbox}
                                />
                                <span className={styles.fieldName}>{getFieldDisplayName(field)}</span>
                            </label>
                            {field === 'number' && (
                                <button
                                    onClick={handleBestFlatLabel}
                                    disabled={isLoadingBestFlat}
                                    className={styles.bestFlatButton}
                                    title="Отримати естетичний рейтинг номерів"
                                >
                                    {isLoadingBestFlat ? '...' : '★'}
                                </button>
                            )}
                            {field === 'floor' && (
                                <button
                                    onClick={handleBestFloorLabel}
                                    disabled={isLoadingBestFloor}
                                    className={styles.bestFlatButton}
                                    title="Отримати естетичний рейтинг поверхів"
                                >
                                    {isLoadingBestFloor ? '...' : '★'}
                                </button>
                            )}
                        </div>
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
