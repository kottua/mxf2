import React, { type FormEvent, useState } from 'react';
import DistributionDynamicParams from "./DistributionDynamicParams.tsx";
import { createDistributionConfig } from "../api/DistributionConfigApi.ts";
import type { DistributionConfig } from "../interfaces/DistributionConfig.ts";
import styles from "./CreateDistributionModal.module.css";
import {useNotification} from "../hooks/useNotification.ts";

interface CreateDistributionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (config: DistributionConfig) => void;
}

interface DistributionFunctionConfig {
    func: string;
    params: Record<string, { default: number; min: number; max: number }>;
}

function CreateDistributionModal({ isOpen, onClose, onSuccess }: CreateDistributionModalProps) {
    const { showError } = useNotification();
    const [presetName, setPresetName] = useState<string>("");
    const [functionName, setFunctionName] = useState("Uniform");
    const [isLoading, setIsLoading] = useState(false);

    const distributionFunctions = ["Uniform", "Gaussian", "Bimodal"];

    const distributionFunctionsConfig: Record<string, DistributionFunctionConfig> = {
        uniform: {
            func: "uniform",
            params: {
                k: { default: 1, min: 0, max: 10000000 },
                b: { default: 1, min: 0, max: 10000000 },
            }
        },
        gaussian: {
            func: "gaussian",
            params: {
                mean: { default: 0.5, min: 0, max: 1 },
                stdDev: { default: 20.00, min: 0.01, max: 50 }
            }
        },
        bimodal: {
            func: "bimodal",
            params: {
                mean1: { default: 0.33, min: 0, max: 1 },
                mean2: { default: 0.67, min: 0, max: 1 },
                stdDev: { default: 10, min: 0.01, max: 50 }
            }
        }
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        
        if (presetName.trim() === "") {
            showError("Будь ласка, введіть назву пресету.");
            return;
        }

        setIsLoading(true);

        try {
            const form = event.target as HTMLFormElement;
            const formData = new FormData(form);

            const params: Record<string, number | string> = {};
            const selectedConfig = distributionFunctionsConfig[functionName.toLowerCase()];

            if (selectedConfig) {
                Object.keys(selectedConfig.params).forEach(paramName => {
                    const value = formData.get(paramName);
                    if (value) {
                        params[paramName] = Number(value);
                    }
                });
            }

            params["function_type"] = functionName;

            const response = await createDistributionConfig(
                presetName.toLowerCase(),
                params
            );

            onSuccess(response);
            
            // Reset form
            setPresetName("");
            setFunctionName("Uniform");
            
        } catch (error) {
            console.error('Error while creating:', error);
            showError("Помилка при створенні дистрибуції. Спробуйте ще раз.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            onClose();
        }
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={handleBackdropClick}>
            <div className={styles.modal}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Створити пресет дистрибуції</h2>
                    <button 
                        onClick={handleClose}
                        className={styles.closeButton}
                        disabled={isLoading}
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    <div className={styles.formGroup}>
                        <label htmlFor="preset_name" className={styles.label}>
                            Назва пресету
                        </label>
                        <input
                            type="text"
                            id="preset_name"
                            name="preset_name"
                            value={presetName}
                            onChange={(e) => setPresetName(e.target.value)}
                            placeholder="Введіть назву пресету"
                            className={styles.input}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="function_type" className={styles.label}>
                            Тип функції
                        </label>
                        <select
                            name="function_type"
                            id="function_type"
                            value={functionName}
                            onChange={(e) => setFunctionName(e.target.value)}
                            className={styles.select}
                            required
                            disabled={isLoading}
                        >
                            {distributionFunctions.map((item, index) => (
                                <option value={item} key={index}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.paramsSection}>
                        <h3 className={styles.paramsTitle}>Параметри функції</h3>
                        <DistributionDynamicParams functionName={functionName} />
                    </div>

                    <div className={styles.modalActions}>
                        <button 
                            type="button" 
                            onClick={handleClose}
                            className={styles.cancelButton}
                            disabled={isLoading}
                        >
                            Скасувати
                        </button>
                        <button 
                            type="submit" 
                            className={styles.submitButton}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Створення...' : 'Створити'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateDistributionModal;
