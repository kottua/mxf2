import { useEffect, useState } from "react";
import { fetchRealEstateObject } from "../api/RealEstateObjectApi.ts";
import { useNavigate, useParams } from "react-router-dom";
import { createPricingConfig, fetchPricingConfig, updatePricingConfig } from "../api/PricingConfigApi.ts";
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
import { calculateOnboardingPrice } from "../core/pricingConfiguration.ts";

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
                
                if (response.pricing_config) {
                    const staticConfig = getStaticFromPricingConfig(response.pricing_config);
                    const dynamicConfig = getDynamicFromPricingConfig(response.pricing_config);
                    
                    setStaticConfig(staticConfig);
                    setDynamicConfig(dynamicConfig);
                    setPriorities(response.pricing_config.content?.ranging || {});
                    setPricingConfig(response.pricing_config);
                    
                    if (staticConfig?.distribConfigId) {
                        const selectedConfig = distribConfigs.find(
                            (config) => config.id === staticConfig.distribConfigId
                        );
                        setActiveDistribConfig(selectedConfig || null);
                    }
                } else {
                    try {
                        const pricingConfigResponse = await fetchPricingConfig(Number(id));
                        const staticConfig = getStaticFromPricingConfig(pricingConfigResponse);
                        setStaticConfig(staticConfig);
                        setDynamicConfig(getDynamicFromPricingConfig(pricingConfigResponse));
                        setPriorities(pricingConfigResponse.content?.ranging || {});
                        setPricingConfig(pricingConfigResponse);
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
            } catch (error) {
                console.error("Error fetching real estate object:", error);
                showError("Не вдалося завантажити дані об'єкта.");
            } finally {
                setIsLoading(false);
            }
        }

        if (activeObject && activeObject.id === Number(id)) {
            if (activeObject.pricing_config && !pricingConfig) {
                const staticConfig = getStaticFromPricingConfig(activeObject.pricing_config);
                const dynamicConfig = getDynamicFromPricingConfig(activeObject.pricing_config);
                
                setStaticConfig(staticConfig);
                setDynamicConfig(dynamicConfig);
                setPriorities(activeObject.pricing_config.content?.ranging || {});
                setPricingConfig(activeObject.pricing_config);
                
                if (staticConfig?.distribConfigId) {
                    const selectedConfig = distribConfigs.find(
                        (config) => config.id === staticConfig.distribConfigId
                    );
                    setActiveDistribConfig(selectedConfig || null);
                }
                setIsLoading(false);
                return;
            }
            setIsLoading(false);
            return;
        }

        fetchData();
    }, [activeObject, id, setActiveObject, setIsLoading, distribConfigs, pricingConfig]);

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
        // Защита от повторных запросов
        if (isLoading) {
            return;
        }
        
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
        
        // Получаем значения из формы
        const currentPricePerSqm = Number(formData.get('current_price_per_sqm')) || 0;
        let onboardingCurrentPricePerSqm = Number(formData.get('onboarding_current_price_per_sqm')) || 0;
        
        // Определяем, является ли это первым сохранением
        const isFirstSave = !pricingConfig?.id || pricingConfig.id === 0;
        
        // Если это первое сохранение и onboarding_current_price_per_sqm равна 0, рассчитываем ее
        if (isFirstSave && onboardingCurrentPricePerSqm === 0 && activeObject) {
            const oversoldMethod = (formData.get('oversold_method') as "pieces" | "area") || "pieces";
            onboardingCurrentPricePerSqm = calculateOnboardingPrice(
                { current_price_per_sqm: currentPricePerSqm.toString() },
                activeObject.premises || [],
                { oversold_method: oversoldMethod },
                activeObject.income_plans || []
            );
        } else if (!isFirstSave && staticConfig?.onboarding_current_price_per_sqm !== undefined) {
            // Если конфиг уже существует, используем значение из конфига (не пересчитываем)
            onboardingCurrentPricePerSqm = staticConfig.onboarding_current_price_per_sqm;
        }
        
        const staticConfigData: StaticParametersConfig = {
            bargainGap: Number(formData.get('negotiation_discount')) || 0,
            maxify_factor: Number(formData.get('maxify_factor')) || 0,
            current_price_per_sqm: currentPricePerSqm,
            onboarding_current_price_per_sqm: onboardingCurrentPricePerSqm,
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
            // Формируем полный объект content со всеми данными
            const contentToSave = {
                staticConfig: staticConfigData,
                dynamicConfig: dynamicConfig!,
                ranging: priorities || {},
            };

            // Проверяем наличие pricing_config в activeObject или в состоянии
            // Это важно, чтобы избежать повторного POST запроса при быстром двойном клике
            const currentPricingConfig = pricingConfig || activeObject?.pricing_config;

            // Если pricing_config уже существует, обновляем его через PUT
            if (currentPricingConfig?.id && currentPricingConfig.id > 0) {
                const updatedConfig = await updatePricingConfig(currentPricingConfig.id, contentToSave);
                setPricingConfig(updatedConfig);
                
                // Обновляем также activeObject.pricing_config
                if (activeObject && updatedConfig) {
                    setActiveObject({
                        ...activeObject,
                        pricing_config: updatedConfig
                    });
                }
                
                showSuccess("Конфігурацію успішно оновлено!");
            } else {
                // Если конфига нет, создаем новый через POST
                const configToSave: PricingConfig = {
                    id: 0,
                    is_active: true,
                    reo_id: Number(id),
                    content: contentToSave,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    real_estate_object: activeObject!,
                    committed_prices: [],
                };

                const response = await createPricingConfig(Number(id), configToSave);
                // API возвращает массив, берем последний элемент (новый конфиг)
                const newConfig = Array.isArray(response) ? response[response.length - 1] : response;
                setPricingConfig(newConfig);
                
                // Обновляем также activeObject.pricing_config, чтобы при следующем сохранении использовался PUT
                if (activeObject && newConfig) {
                    setActiveObject({
                        ...activeObject,
                        pricing_config: newConfig
                    });
                }
                
                showSuccess("Конфігурацію успішно збережено!");
            }
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