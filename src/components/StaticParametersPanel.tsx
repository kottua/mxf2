import {type FormEvent, useEffect, useState} from "react";
import type {StaticParametersConfig} from "../interfaces/StaticParameters.ts";
import {calculateOnboardingPrice} from "../core/pricingConfiguration.ts";
import type {IncomePlan} from "../interfaces/IncomePlan.ts";
import type {Premises} from "../interfaces/Premises.ts";
import styles from "./StaticParametersPanel.module.css";
import type {DistributionConfig} from "../interfaces/DistributionConfig.ts";
import {useNotification} from "../hooks/useNotification.ts";

interface StaticParametersPanelProps {
    currentConfig: StaticParametersConfig | null;
    setStaticConfig: (config: StaticParametersConfig) => void;
    incomePlans: IncomePlan[];
    premises: Premises[];
    distribConfigs: DistributionConfig[];
}

function StaticParametersPanel({ currentConfig, setStaticConfig, incomePlans, premises, distribConfigs }: StaticParametersPanelProps) {
    const { showSuccess } = useNotification();
    const [bargainGap, setBargainGap] = useState(0);
    const [maxify_factor, setMaxifyFactor] = useState(0);
    const [current_price_per_sqm, setCurrentPricePerSqm] = useState(0);
    const [minimum_liq_refusal_price, setMinimumLiqRefusalPrice] = useState(0);
    const [maximum_liq_refusal_price, setMaximumLiqRefusalPrice] = useState(0);
    const [overestimate_correct_factor, setOverestimateCorrectFactor] = useState(0);
    const [oversold_method, setOversoldMethod] = useState("pieces");
    const [sigma, setSigma] = useState(0);
    const [similarityThreshold, setSimilarityThreshold] = useState(0);
    const [activeConfigId, setActiveConfigId] = useState<number | null>(null);


    useEffect(() => {
        if (currentConfig) {
            setBargainGap(currentConfig.bargainGap);
            setMaxifyFactor(currentConfig.maxify_factor);
            setCurrentPricePerSqm(currentConfig.current_price_per_sqm);
            setMinimumLiqRefusalPrice(currentConfig.minimum_liq_refusal_price);
            setMaximumLiqRefusalPrice(currentConfig.maximum_liq_refusal_price);
            setOverestimateCorrectFactor(currentConfig.overestimate_correct_factor);
            setOversoldMethod(currentConfig.oversold_method);
            setSigma(currentConfig.sigma);
            setSimilarityThreshold(currentConfig.similarityThreshold);
            setActiveConfigId(currentConfig.distribConfigId ?? distribConfigs[0]?.id ?? null);
        } else if (distribConfigs.length > 0) {
            setActiveConfigId(distribConfigs[0].id);
        }
    }, [currentConfig, distribConfigs]);


    useEffect(() => {
        if (premises && incomePlans.length > 0) {
            const newPrice = calculateOnboardingPrice(
                { current_price_per_sqm: current_price_per_sqm.toString() },
                premises,
                { oversold_method: oversold_method as "pieces" | "area" },
                incomePlans
            );

            setCurrentPricePerSqm(newPrice);
        } else {
            console.error('Cannot calculate - missing data:', {
                hasPremises: !!premises,
                hasIncomePlans: incomePlans.length > 0,
            });
        }
    }, [oversold_method, incomePlans, premises, current_price_per_sqm]);

    function handleSubmit(e: FormEvent){
        e.preventDefault();

        const newConfig: StaticParametersConfig = {
            bargainGap,
            maxify_factor,
            current_price_per_sqm,
            minimum_liq_refusal_price,
            maximum_liq_refusal_price,
            overestimate_correct_factor,
            oversold_method: oversold_method as "pieces" | "area",
            sigma,
            similarityThreshold,
            distribConfigId: activeConfigId
        }
        setStaticConfig(newConfig);
        showSuccess('Статичні параметри локально збережено!');
    }

    return (
        <div className={styles.panel}>
            <h3 className={styles.title}>Статичні параметри</h3>
            
            {currentConfig && (
                <details className={styles.details}>
                    <summary className={styles.summary}>Поточні статичні параметри</summary>
                    <pre className={styles.pre}>{JSON.stringify(currentConfig, null, 2)}</pre>
                </details>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label htmlFor="negotiation_discount" className={styles.label}>Розмір торгу</label>
                        <input
                            type="number"
                            onChange={(e) => setBargainGap(Number(e.target.value))}
                            id='negotiation_discount'
                            name='negotiation_discount'
                            step="0.01"
                            value={bargainGap}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="maxify_factor" className={styles.label}>Maxify фактор</label>
                        <input
                            type="number"
                            onChange={(e) => setMaxifyFactor(Number(e.target.value))}
                            id='maxify_factor'
                            name='maxify_factor'
                            step="0.01"
                            value={maxify_factor}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="current_price_per_sqm" className={styles.label}>Базова ціна за м²</label>
                        <input
                            type="number"
                            id='current_price_per_sqm'
                            name='current_price_per_sqm'
                            value={current_price_per_sqm}
                            readOnly
                            className={`${styles.input} ${styles.readonly}`}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="minimum_liq_refusal_price" className={styles.label}>Ціна відмови для найгіршої ліквідності за м²</label>
                        <input
                            type="number"
                            onChange={(e) => setMinimumLiqRefusalPrice(Number(e.target.value))}
                            id='minimum_liq_refusal_price'
                            name='minimum_liq_refusal_price'
                            step="0.01"
                            required
                            value={minimum_liq_refusal_price}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="maximum_liq_refusal_price" className={styles.label}>Ціна відмови для найкращої ліквідності за м²</label>
                        <input
                            type="number"
                            onChange={(e) => setMaximumLiqRefusalPrice(Number(e.target.value))}
                            id='maximum_liq_refusal_price'
                            name='maximum_liq_refusal_price'
                            step="0.01"
                            required
                            value={maximum_liq_refusal_price}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="overestimate_correct_factor" className={styles.label}>Коефіціент прискорення корекції розмаху</label>
                        <input
                            type="number"
                            onChange={(e) => setOverestimateCorrectFactor(Number(e.target.value))}
                            id='overestimate_correct_factor'
                            name='overestimate_correct_factor'
                            step="0.01"
                            value={overestimate_correct_factor}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="oversold_method" className={styles.label}>Метод розрахунку розпроданості</label>
                        <select
                            onChange={(e) => setOversoldMethod(e.target.value as 'pieces' | 'area')}
                            id='oversold_method'
                            name='oversold_method'
                            value={oversold_method}
                            className={styles.select}
                        >
                            <option value="pieces">За кількістю</option>
                            <option value="area">За площею</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="sigma" className={styles.label}>Сигма (для подібності)</label>
                        <input
                            type="number"
                            onChange={(e) => setSigma(Number(e.target.value))}
                            id='sigma'
                            name='sigma'
                            step="0.1"
                            min="0.1"
                            value={sigma}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="similarityThreshold" className={styles.label}>Поріг подібності</label>
                        <input
                            type="number"
                            onChange={(e) => setSimilarityThreshold(Number(e.target.value))}
                            id='similarityThreshold'
                            name='similarityThreshold'
                            step="0.01"
                            min="0"
                            max="1"
                            value={similarityThreshold}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="distributionConfig" className={styles.label}>
                            Конфігурація дистрибуції
                        </label>
                        <select
                            id="distributionConfig"
                            name="distributionConfig"
                            value={activeConfigId ?? ""}
                            onChange={(e) => setActiveConfigId(Number(e.target.value) || null)}
                            className={styles.select}
                            required
                        >
                            <option value="" disabled>
                                Виберіть конфігурацію
                            </option>
                            {distribConfigs.map((config) => (
                                <option key={config.id} value={config.id}>
                                    {config.func_name || `Конфігурація ${config.id}`}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default StaticParametersPanel;
