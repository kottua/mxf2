import { useEffect, useState } from "react";
import { fetchRealEstateObject } from "../api/RealEstateObjectApi.ts";
import { useNavigate, useParams } from "react-router-dom";
import { createPricingConfig, fetchPricingConfig } from "../api/PricingConfigApi.ts";
import DynamicFilters from "../components/DynamicFilters.tsx";
import StaticParametersPanel from "../components/StaticParametersPanel.tsx";
import type { StaticParametersConfig } from "../interfaces/StaticParameters.ts";
import { getDynamicFromPricingConfig, getStaticFromPricingConfig } from "../core/Parsers.ts";
import type { DynamicParametersConfig } from "../interfaces/DynamicParametersConfig.ts";
import type { PricingConfig } from "../interfaces/PricingConfig.ts";
import PremisesParameters, { type ColumnPriorities } from "../components/PremisesParameters.tsx";
import { useActiveRealEstateObject } from "../contexts/ActiveRealEstateObjectContext.tsx";
import styles from "./ConfigurePage.module.css";
import type { DistributionConfig } from "../interfaces/DistributionConfig.ts";
import { fetchDistributionConfigs } from "../api/DistributionConfigApi.ts";
import DistributionManager from "../components/DistributionManager.tsx";
import {useNotification} from "../hooks/useNotification.ts";

function ConfigurePage() {
    const { showError, showSuccess } = useNotification();
    const { id } = useParams();
    const { activeObject, setActiveObject, isLoading, setIsLoading } = useActiveRealEstateObject();
    const [dynamicConfig, setDynamicConfig] = useState<DynamicParametersConfig | null>(null);
    const [staticConfig, setStaticConfig] = useState<StaticParametersConfig | null>(null);
    const [pricingConfig, setPricingConfig] = useState<PricingConfig | null>(null);
    const [distribConfigs, setDistribConfigs] = useState<DistributionConfig[]>([]);
    const [activeDistribConfig, setActiveDistribConfig] = useState<DistributionConfig | null>(null);
    const [priorities, setPriorities] = useState<ColumnPriorities>({});
    const navigate = useNavigate();

    useEffect(() => {
        async function getDistributionConfigs() {
            try {
                const response = await fetchDistributionConfigs();
                setDistribConfigs(response);
                if (response.length > 0 && !activeDistribConfig) {
                    setActiveDistribConfig(response[0]);
                }
            } catch (error) {
                console.error("Error fetching distribution configs:", error);
            }
        }

        setDistribConfigs([]);
        setActiveDistribConfig(null);
        
        getDistributionConfigs();
    }, [id]);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetchRealEstateObject(Number(id));
                setActiveObject(response);
            } catch (error) {
                console.error("Error fetching real estate object:", error);
                showError("Не вдалося завантажити дані об'єкта.");
            }
        }

        async function getPricingConfig() {
            try {
                const response = await fetchPricingConfig(Number(id));
                const staticConfig = getStaticFromPricingConfig(response);
                setStaticConfig(staticConfig);
                setDynamicConfig(getDynamicFromPricingConfig(response));
                setPriorities(response.content?.ranging || {});
                setPricingConfig(response);
                if (staticConfig?.distribConfigId) {
                    const selectedConfig = distribConfigs.find(
                        (config) => config.id === staticConfig.distribConfigId
                    );
                    setActiveDistribConfig(selectedConfig || null);
                }
            } catch (error) {
                console.error("Error fetching pricing config:", error);
            }
        }

        if (activeObject && activeObject.id === Number(id)) {
            if (activeObject.pricing_configs.length === 0) {
                setIsLoading(false);
                return;
            }
            getPricingConfig();
            return;
        }

        fetchData();
        getPricingConfig();
    }, [activeObject, id, setActiveObject, setIsLoading, distribConfigs]);

    function handleBackBtn() {
        navigate(-1);
    }

    function checkIsEngineReady(): boolean {
        return !(!dynamicConfig || !staticConfig);
    }

    function handleGoToEngine() {
        if (!checkIsEngineReady()) {
            showError("Будь ласка, заповніть всі параметри перед переходом до Engine");
            return;
        }
        navigate(`/engine/${id}`);
    }

    async function handleSaveConfig() {
        if (!dynamicConfig) {
            showError("Будь ласка, заповніть динамічні параметри");
            return;
        }
        
        const staticForm = document.querySelector('form') as HTMLFormElement;
        if (!staticForm) {
            showError("Не знайдено форму статичних параметрів");
            return;
        }
        
        const formData = new FormData(staticForm);
        
        // Preserve the old onboarding_current_price_per_sqm if it exists in API
        // This ensures we always send the original onboarding value when updating config
        // onboarding_current_price_per_sqm is calculated only once (at first config creation)
        // If it doesn't exist in API (undefined), use the calculated value from the form
        const onboardingPrice = (staticConfig?.onboarding_current_price_per_sqm !== undefined)
            ? staticConfig.onboarding_current_price_per_sqm
            : Number(formData.get('onboarding_current_price_per_sqm')) || 0;
        
        const staticConfigData: StaticParametersConfig = {
            bargainGap: Number(formData.get('negotiation_discount')) || 0,
            maxify_factor: Number(formData.get('maxify_factor')) || 0,
            current_price_per_sqm: Number(formData.get('current_price_per_sqm')) || 0,
            onboarding_current_price_per_sqm: onboardingPrice,
            minimum_liq_refusal_price: Number(formData.get('minimum_liq_refusal_price')) || 0,
            maximum_liq_refusal_price: Number(formData.get('maximum_liq_refusal_price')) || 0,
            overestimate_correct_factor: Number(formData.get('overestimate_correct_factor')) || 0,
            oversold_method: (formData.get('oversold_method') as "pieces" | "area") || "pieces",
            sigma: Number(formData.get('sigma')) || 0,
            similarityThreshold: Number(formData.get('similarityThreshold')) || 0,
            distribConfigId: Number(formData.get('distributionConfig')) || null
        };
        
        setStaticConfig(staticConfigData);
        
        setIsLoading(true);
        try {
            const configToSave: PricingConfig = {
                id: pricingConfig?.id || 0,
                is_active: true,
                reo_id: Number(id),
                content: {
                    staticConfig: staticConfigData,
                    dynamicConfig,
                    ranging: priorities || {},
                },
                created_at: pricingConfig?.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString(),
                real_estate_object: activeObject!,
                committed_prices: pricingConfig?.committed_prices || [],
            };

            const response = await createPricingConfig(Number(id), configToSave);
            setPricingConfig(response[response.length - 1]);
            showSuccess("Конфігурацію успішно збережено!");
        } catch (error) {
            console.error("Error saving pricing config:", error);
            showError("Не вдалося зберегти конфігурацію.");
        } finally {
            setIsLoading(false);
        }
    }

    if (!activeObject || !activeObject.id || isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <p className={styles.loading}>Завантаження...</p>
            </div>
        );
    }

    return (
        <main className={styles.main}>
            <header className={styles.header}>
                <h1 className={styles.pageTitle}>Конфігурація ціноутворення</h1>
                <div className={styles.headerButtons}>
                    <button onClick={handleSaveConfig} className={styles.saveButton}>
                        Зберегти конфігурацію
                    </button>
                    <button onClick={handleGoToEngine} className={styles.navButton}>
                        Перейти до Engine
                    </button>
                    <button onClick={handleBackBtn} className={styles.backButton}>
                        Назад
                    </button>
                </div>
            </header>

            <div className={styles.contentLayout}>
                <div className={styles.filtersColumn}>
                    <DynamicFilters
                        premises={activeObject.premises}
                        currentConfig={dynamicConfig}
                        onConfigChange={setDynamicConfig}
                    />
                </div>

                <div className={styles.mainContent}>
                    {dynamicConfig?.importantFields && (
                        <section className={styles.section}>
                            <h2>Пріоритети параметрів</h2>
                            <PremisesParameters
                                premises={activeObject.premises}
                                selectedColumns={dynamicConfig?.importantFields}
                                setPriorities={setPriorities}
                                priorities={priorities}
                            />
                        </section>
                    )}
                </div>

                <div className={styles.staticColumn}>
                    <DistributionManager
                        distribConfigs={distribConfigs}
                        setDistribConfigs={setDistribConfigs}
                    />
                    <StaticParametersPanel
                        currentConfig={staticConfig}
                        setStaticConfig={setStaticConfig}
                        incomePlans={activeObject.income_plans || []}
                        premises={activeObject.premises || []}
                        distribConfigs={distribConfigs}
                    />
                </div>
            </div>
        </main>
    );
}

export default ConfigurePage;