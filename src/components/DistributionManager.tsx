import React, { useState } from 'react';
import type { DistributionConfig } from "../interfaces/DistributionConfig.ts";
import CreateDistributionModal from "./CreateDistributionModal";
import AllDistributionsModal from "./AllDistributionsModal.tsx";
import { deleteDistributionConfig } from "../api/DistributionConfigApi.ts";
import styles from "./DistributionManager.module.css";
import {useNotification} from "../hooks/useNotification.ts";

interface DistributionManagerProps {
    distribConfigs: DistributionConfig[];
    setDistribConfigs: (configs: DistributionConfig[]) => void;
}

function DistributionManager({ distribConfigs, setDistribConfigs }: DistributionManagerProps) {
    const { showError } = useNotification();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAllDistributionsModalOpen, setIsAllDistributionsModalOpen] = useState(false);

    const recentDistributions = distribConfigs.slice(-3);
    const hasMoreDistributions = distribConfigs.length > 3;

    function getFunctionDisplayName(functionType: string): string {
        switch (functionType) {
            case 'Gaussian':
                return 'Гаусова';
            case 'Uniform':
                return 'Рівномірна';
            case 'Bimodal':
                return 'Бімодальна';
            default:
                return functionType;
        }
    }

    function getFunctionIcon(functionType: string): string {
        switch (functionType) {
            case 'Gaussian':
                return '📊';
            case 'Uniform':
                return '📈';
            case 'Bimodal':
                return '📉';
            default:
                return '📋';
        }
    }

    function formatContent(content: any): string {
        if (typeof content === 'object') {
            const { function_type, ...params } = content;
            const paramStrings = Object.entries(params).map(([key, value]) => {
                if (typeof value === 'number') {
                    return `${key}: ${value}`;
                }
                return `${key}: ${value}`;
            });
            return paramStrings.join(', ');
        }
        return String(content);
    }

    function handleDeleteConfig(configId: number) {
        if (window.confirm('Ви впевнені, що хочете видалити цю дистрибуцію?')) {
            deleteDistributionConfig(configId)
                .then(() => {
                    const updatedConfigs = distribConfigs.filter(config => config.id !== configId);
                    setDistribConfigs(updatedConfigs);
                })
                .catch((error) => {
                    console.error('Error deleting distribution config:', error);
                    showError('Помилка при видаленні дистрибуції. Спробуйте ще раз.');
                });
        }
    }

    return (
        <div className={styles.manager}>
            <div className={styles.header}>
                <h3 className={styles.title}>Налаштування дистрибуції</h3>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className={styles.createButton}
                >
                    Створити пресет
                </button>
            </div>

            <div className={styles.configsList}>
                {distribConfigs.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>📊</div>
                        <p className={styles.emptyText}>Немає збережених дистрибуцій</p>
                        <p className={styles.emptySubtext}>Створіть перший пресет дистрибуції</p>
                    </div>
                ) : (
                    <>
                        {recentDistributions.map((config) => (
                            <div key={config.id} className={styles.configCard}>
                                <div className={styles.configHeader}>
                                    <div className={styles.configIcon}>
                                        {getFunctionIcon(String(config.content?.function_type || 'Unknown'))}
                                    </div>
                                    <div className={styles.configInfo}>
                                        <h4 className={styles.configName}>
                                            {config.func_name || `Конфігурація ${config.id}`}
                                            <span
                                                className={
                                                    config.config_status === "default"
                                                        ? styles.configStatusDefault
                                                        : styles.configStatusCustom
                                                }
                                                title={config.config_status === "default" ? "Конфіг за замовчуванням" : "Власний конфіг"}
                                            >
                                                {config.config_status === "default" ? "За замовчуванням" : "Власний"}
                                            </span>
                                        </h4>
                                        <span className={styles.configType}>
                                            {getFunctionDisplayName(String(config.content?.function_type || 'Unknown'))}
                                        </span>
                                    </div>
                                    {config.config_status !== "default" && (
                                        <button 
                                            onClick={() => handleDeleteConfig(config.id)}
                                            className={styles.deleteButton}
                                            title="Видалити дистрибуцію"
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </div>
                                
                                <div className={styles.configDetails}>
                                    <div className={styles.configId}>ID: {config.id}</div>
                                    <div className={styles.configParams}>
                                        {formatContent(config.content)}
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {hasMoreDistributions && (
                            <button 
                                onClick={() => setIsAllDistributionsModalOpen(true)}
                                className={styles.showAllButton}
                            >
                                Показати всі дистрибуції ({distribConfigs.length})
                            </button>
                        )}
                    </>
                )}
            </div>

            {isModalOpen && (
                <CreateDistributionModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={(newConfig) => {
                        setDistribConfigs([...distribConfigs, newConfig]);
                        setIsModalOpen(false);
                    }}
                />
            )}

            {isAllDistributionsModalOpen && (
                <AllDistributionsModal
                    isOpen={isAllDistributionsModalOpen}
                    onClose={() => setIsAllDistributionsModalOpen(false)}
                    distribConfigs={distribConfigs}
                    onDeleteConfig={handleDeleteConfig}
                />
            )}
        </div>
    );
}

export default DistributionManager;
