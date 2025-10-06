import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchRealEstateObject } from "../api/RealEstateObjectApi.ts";
import EngineHeader from "../components/EngineHeader.tsx";
import EnginePriceCalculator from "../components/EnginePriceCalculator.tsx";
import ChessboardTable from "../components/ChessboardTable.tsx";
import ShowCalculationProcessTable from "../components/ShowCalculationProcessTable.tsx";
import { useActiveRealEstateObject } from "../contexts/ActiveRealEstateObjectContext.tsx";
import styles from "./EnginePage.module.css";
import {fetchDistributionConfig} from "../api/DistributionConfigApi.ts";
import type { DistributionConfig } from "../interfaces/DistributionConfig.ts";
import { fetchPricingConfig } from "../api/PricingConfigApi.ts";
import type { PricingConfig } from "../interfaces/PricingConfig.ts";

export interface CalculationProcessData {
    onBoardingSpread: number;
    compensationRate: number;
    conditionalValue: number;
}

function EnginePage() {
    const { id } = useParams();
    const { activeObject, setActiveObject, isLoading, setIsLoading } = useActiveRealEstateObject();
    const [selectedEngine, setSelectedEngine] = useState("Regular");
    const [selectedMetric, setSelectedMetric] = useState("Unit Number");
    const [scoringData, setScoringData] = useState<Record<number, number | string>>({});
    const [calculationProcessData, setCalculationProcessData] = useState<CalculationProcessData | null>(null);
    const [activeConfig, setActiveConfig] = useState<DistributionConfig | null>(null);
    const [pricingConfig, setPricingConfig] = useState<PricingConfig | null>(null);

    const navigate = useNavigate();

    // Fetch real estate object and pricing config
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
                setPricingConfig(response);
            } catch (error) {
                console.error("Error fetching pricing config:", error);
                alert("Не вдалося завантажити pricing конфігурацію.");
            }
        }

        setIsLoading(true);
        Promise.all([fetchData(), getPricingConfig()]).finally(() => {
            setIsLoading(false);
        });
    }, [id, setActiveObject, setIsLoading]);

    // Fetch distribution config once pricingConfig is available
    useEffect(() => {
        async function getDistributionConfig() {
            if (!pricingConfig?.content?.staticConfig?.distribConfigId) {
                console.warn("Distribution Config ID is missing.");
                alert("Distribution Config ID відсутній.");
                return;
            }
            try {
                const response = await fetchDistributionConfig(
                    pricingConfig.content.staticConfig.distribConfigId
                );
                setActiveConfig(response);
            } catch (error) {
                console.error("Error fetching distribution config:", error);
                alert("Не вдалося завантажити distribution конфігурацію.");
            }
        }

        if (pricingConfig) {
            getDistributionConfig();
        }
    }, [pricingConfig]);

    function handleBackBtn() {
        navigate(-1);
    }

    if (!activeObject || isLoading || !pricingConfig || !pricingConfig.content || !activeConfig) {
        return <div className={styles.loading}>Завантаження...</div>;
    }

    return (
        <main className={styles.main}>
            <header className={styles.header}>
                <h1 className={styles.pageTitle}>Engine</h1>
                <button onClick={handleBackBtn} className={styles.backButton}>
                    Назад
                </button>
            </header>

            <p className={styles.objectInfo}>
                Engine для об'єкта: <strong>{activeObject?.name}</strong>
            </p>

            <EngineHeader
                objectName={activeObject.name}
                selectedEngine={selectedEngine}
                setSelectedEngine={setSelectedEngine}
                selectedMetric={selectedMetric}
                setSelectedMetric={setSelectedMetric}
            />

            <EnginePriceCalculator
                selectedEngine={selectedEngine}
                realObject={activeObject}
                setCalculationProcessData={setCalculationProcessData}
            />
            <section className={styles.section}>
                <h2>Шахівниця цін</h2>
                <ChessboardTable
                    selectedMetric={selectedMetric}
                    premises={activeObject.premises}
                    dynamicConfig={pricingConfig.content.dynamicConfig}
                    staticConfig={pricingConfig.content.staticConfig}
                    ranging={pricingConfig.content.ranging}
                    setScoringData={setScoringData}
                />
            </section>

            <section className={styles.section}>
                <h1>Ця частина сторінки і результати з'являються при рендері сторінки. Нічого робити не потрібно. Для простоти береться останній збережений конфіг.</h1>
                <ShowCalculationProcessTable
                    activeConfig={activeConfig}
                    activeObject={activeObject}
                    pricingConfig={pricingConfig}
                />
            </section>
        </main>
    );
}

export default EnginePage;