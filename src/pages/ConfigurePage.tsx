import { useEffect, useState } from "react";
import { fetchRealEstateObject } from "../api/RealEstateObjectApi.ts";
import { useNavigate, useParams } from "react-router-dom";
import { createPricingConfig, fetchPricingConfig } from "../api/PricingConfigApi.ts";
import DynamicParameters from "../components/DynamicParameters.tsx";
import StaticParameters from "../components/StaticParameters.tsx";
import type { StaticParametersConfig } from "../interfaces/StaticParameters.ts";
import { getDynamicFromPricingConfig, getStaticFromPricingConfig } from "../core/Parsers.ts";
import type { DynamicParametersConfig } from "../interfaces/DynamicParametersConfig.ts";
import type { PricingConfig } from "../interfaces/PricingConfig.ts";
import PremisesParameters, { type ColumnPriorities } from "../components/PremisesParameters.tsx";
import { useActiveRealEstateObject } from "../contexts/ActiveRealEstateObjectContext.tsx";
import styles from "./ConfigurePage.module.css";
import type { DistributionConfig } from "../interfaces/DistributionConfig.ts";
import { fetchDistributionConfigs } from "../api/DistributionConfigApi.ts";
import CreateDistributionPresetForm from "../components/CreateDistributionPresetForm.tsx";

function ConfigurePage() {
    const { id } = useParams();
    const { activeObject, setActiveObject, isLoading, setIsLoading } = useActiveRealEstateObject();
    const [dynamicConfig, setDynamicConfig] = useState<DynamicParametersConfig | null>(null);
    const [staticConfig, setStaticConfig] = useState<StaticParametersConfig | null>(null);
    const [pricingConfig, setPricingConfig] = useState<PricingConfig | null>(null);
    const [distribConfigs, setDistribConfigs] = useState<DistributionConfig[]>([]);
    const [activeDistribConfig, setActiveDistribConfig] = useState<DistributionConfig | null>(null);
    const [priorities, setPriorities] = useState<ColumnPriorities>({});
    const [showDistribForm, setShowDistribForm] = useState(false); // State to toggle form visibility
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetchRealEstateObject(Number(id));
                setActiveObject(response);
            } catch (error) {
                console.error("Error fetching real estate object:", error);
                alert("Не вдалося завантажити дані об'єкта.");
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

        async function getDistributionConfigs() {
            try {
                const response = await fetchDistributionConfigs();
                setDistribConfigs(response);
                if (response.length > 0 && !activeDistribConfig) {
                    setActiveDistribConfig(response[0]);
                }
            } catch (error) {
                console.error("Error fetching distribution configs:", error);
            } finally {
                setIsLoading(false);
            }
        }

        if (activeObject && activeObject.id === Number(id)) {
            if (activeObject.pricing_configs.length === 0) {
                setIsLoading(false);
                return;
            }
            getPricingConfig();
            getDistributionConfigs();
            return;
        }

        fetchData();
        getPricingConfig();
        getDistributionConfigs();
    }, [activeObject, id, setActiveObject, setIsLoading]);

    function handleBackBtn() {
        navigate(-1);
    }

    function checkIsEngineReady(): boolean {
        return !(!dynamicConfig || !staticConfig);
    }

    function handleGoToEngine() {
        if (!checkIsEngineReady()) {
            alert("Будь ласка, заповніть всі параметри перед переходом до Engine");
            return;
        }
        navigate(`/engine/${id}`);
    }

    async function handleSaveConfig() {
        if (!dynamicConfig || !staticConfig) {
            alert("Будь ласка, заповніть всі параметри");
            return;
        }
        setIsLoading(true);
        try {
            const configToSave: PricingConfig = {
                id: pricingConfig?.id || 0,
                is_active: true,
                reo_id: Number(id),
                content: {
                    staticConfig,
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
            alert("Конфігурацію успішно збережено!");
        } catch (error) {
            console.error("Error saving pricing config:", error);
            alert("Не вдалося зберегти конфігурацію.");
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
                <h1 className={styles.pageTitle}>Конфігурація</h1>
                <button onClick={handleBackBtn} className={styles.backButton}>
                    Назад
                </button>
            </header>

            <p className={styles.objectInfo}>
                Конфігурація для об'єкта: <strong>{activeObject?.name}</strong>
            </p>

            <section className={styles.section}>
                <h2>Динамічні параметри</h2>
                <DynamicParameters
                    premises={activeObject.premises}
                    currentConfig={dynamicConfig}
                    onConfigChange={setDynamicConfig}
                />
            </section>

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

            <section className={styles.section}>
                <h2>Статичні параметри</h2>
                <StaticParameters
                    currentConfig={staticConfig}
                    setStaticConfig={setStaticConfig}
                    incomePlans={activeObject.income_plans || []}
                    premises={activeObject.premises || []}
                    distribConfigs={distribConfigs}
                />
            </section>

            <section className={styles.section}>
                <h2>Налаштування дистрибуції</h2>
                <button
                    onClick={() => setShowDistribForm(!showDistribForm)}
                    className={styles.navButton}
                >
                    {showDistribForm ? "Приховати форму" : "+ Додати дистрибуцію"}
                </button>

                {showDistribForm && (
                    <CreateDistributionPresetForm setDistributeConfig={setDistribConfigs} />
                )}

                <h3>Доступні конфіги</h3>
                {distribConfigs.length === 0 ? (
                    <p>Немає збережених дистрибуцій.</p>
                ) : (
                    <ul>
                        {distribConfigs.map((config) => (
                            <li key={config.id}>
                                <strong>{config.func_name || `Config ${config.id}`}</strong> - ID: {config.id} - Content:{" "}
                                {JSON.stringify(config.content)}
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <div className={styles.actions}>
                <button onClick={handleSaveConfig} className={styles.saveButton}>
                    Зберегти конфігурацію
                </button>
                <button onClick={handleGoToEngine} className={styles.navButton}>
                    Перейти до Engine
                </button>
            </div>
        </main>
    );
}

export default ConfigurePage;