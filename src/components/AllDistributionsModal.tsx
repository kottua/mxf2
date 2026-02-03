import React from 'react';
import type { DistributionConfig } from "../interfaces/DistributionConfig.ts";
import { deleteDistributionConfig } from "../api/DistributionConfigApi.ts";
import styles from "./AllDistributionsModal.module.css";

interface AllDistributionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    distribConfigs: DistributionConfig[];
    onDeleteConfig: (configId: number) => void;
}

function AllDistributionsModal({ isOpen, onClose, distribConfigs, onDeleteConfig }: AllDistributionsModalProps) {
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

    function handleBackdropClick(e: React.MouseEvent) {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={handleBackdropClick}>
            <div className={styles.modal}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Всі дистрибуції</h2>
                    <button 
                        onClick={onClose}
                        className={styles.closeButton}
                    >
                        ✕
                    </button>
                </div>

                <div className={styles.modalContent}>
                    <div className={styles.statsBar}>
                        <span className={styles.totalCount}>
                            Всього дистрибуцій: {distribConfigs.length}
                        </span>
                    </div>

                    <div className={styles.distributionsList}>
                        {distribConfigs.length === 0 ? (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}>📊</div>
                                <p className={styles.emptyText}>Немає збережених дистрибуцій</p>
                            </div>
                        ) : (
                            distribConfigs.map((config) => (
                                <div key={config.id} className={styles.distributionCard}>
                                    <div className={styles.cardHeader}>
                                        <div className={styles.cardIcon}>
                                            {getFunctionIcon(config.content?.function_type || 'Unknown')}
                                        </div>
                                        <div className={styles.cardInfo}>
                                            <h4 className={styles.cardName}>
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
                                            <span className={styles.cardType}>
                                                {getFunctionDisplayName(config.content?.function_type || 'Unknown')}
                                            </span>
                                        </div>
                                        <div className={styles.cardActions}>
                                            <span className={styles.cardId}>ID: {config.id}</span>
                                            {config.config_status !== "default" && (
                                                <button 
                                                    onClick={() => onDeleteConfig(config.id)}
                                                    className={styles.deleteButton}
                                                    title="Видалити дистрибуцію"
                                                >
                                                    🗑️
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className={styles.cardContent}>
                                        <div className={styles.cardParams}>
                                            {formatContent(config.content)}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className={styles.modalFooter}>
                    <button 
                        onClick={onClose}
                        className={styles.closeFooterButton}
                    >
                        Закрити
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AllDistributionsModal;
