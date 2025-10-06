import {type FormEvent, useEffect, useState} from "react";
import type {StaticParametersConfig} from "../interfaces/StaticParameters.ts";
import {calculateOnboardingPrice} from "../core/pricingConfiguration.ts";
import type {IncomePlan} from "../interfaces/IncomePlan.ts";
import type {Premises} from "../interfaces/Premises.ts";
import styles from "./StaticParameters.module.css";
import type {DistributionConfig} from "../interfaces/DistributionConfig.ts";

interface StaticParametersProps {
    currentConfig: StaticParametersConfig | null;
    setStaticConfig: (config: StaticParametersConfig) => void;
    incomePlans: IncomePlan[];
    premises: Premises[];
    distribConfigs: DistributionConfig[];
}

function StaticParameters({ currentConfig, setStaticConfig, incomePlans, premises, distribConfigs }: StaticParametersProps) {
    const [bargainGap, setBargainGap] = useState(0);
    const [maxify_factor, setMaxifyFactor] = useState(0);
    const [current_price_per_sqm, setCurrentPricePerSqm] = useState(0);
    const [minimum_liq_refusal_price, setMinimumLiqRefusalPrice] = useState(0);
    const [maximum_liq_refusal_price, setMaximumLiqRefusalPrice] = useState(0);
    const [overestimate_correct_factor, setOverestimateCorrectFactor] = useState(0);
    const [oversold_method, setOversoldMethod] = useState("pieces");
    const [sigma, setSigma] = useState(0);
    const [similarityThreshold, setSimilarityThreshold] = useState(0);
    // const [maxBonus, setMaxBonus] = useState(0);
    // const [bonusFactor, setBonusFactor] = useState(0);
    // const [bonusScale, setBonusScale] = useState(0);
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
            // setMaxBonus(currentConfig.maxBonus);
            // setBonusFactor(currentConfig.bonusFactor);
            // setBonusScale(currentConfig.bonusScale);
            setActiveConfigId(currentConfig.distribConfigId ?? distribConfigs[0]?.id ?? null);
        } else if (distribConfigs.length > 0) {
            // Set default distribConfigId if no currentConfig but distribConfigs are available
            setActiveConfigId(distribConfigs[0].id);
        }
    }, [currentConfig, distribConfigs]);


    // TODO FIX CALCULATIONS
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
            // maxBonus,
            // bonusFactor,
            // bonusScale,
            distribConfigId: activeConfigId
        }
        setStaticConfig(newConfig);
        alert('Статичні параметри локально збережено!');
    }

    return (
        <section className={styles.section}>
            <h2 className={styles.title}>Статичні параметри</h2>
            {currentConfig && (
                <details className={styles.details}>
                    <summary className={styles.summary}>Поточні статичні параметри</summary>
                    <pre className={styles.pre}>{JSON.stringify(currentConfig, null, 2)}</pre>
                </details>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label htmlFor="negotiation_discount" className={styles.label}>Bargain gap</label>
                        <input
                            type="number"
                            onChange={(e) => setBargainGap(Number(e.target.value))}
                            id='negotiation_discount'
                            step="0.01"
                            value={bargainGap}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="maxify_factor" className={styles.label}>Maxify factor</label>
                        <input
                            type="number"
                            onChange={(e) => setMaxifyFactor(Number(e.target.value))}
                            id='maxify_factor'
                            step="0.01"
                            value={maxify_factor}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="current_price_per_sqm" className={styles.label}>Onboarding price per sq.m</label>
                        <input
                            type="number"
                            id='current_price_per_sqm'
                            value={current_price_per_sqm}
                            readOnly
                            className={`${styles.input} ${styles.readonly}`}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="minimum_liq_refusal_price" className={styles.label}>Minimum liquidity refusal price per sq.m</label>
                        <input
                            type="number"
                            onChange={(e) => setMinimumLiqRefusalPrice(Number(e.target.value))}
                            id='minimum_liq_refusal_price'
                            step="0.01"
                            required
                            value={minimum_liq_refusal_price}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="maximum_liq_refusal_price" className={styles.label}>Maximum liquidity refusal price per sq.m</label>
                        <input
                            type="number"
                            onChange={(e) => setMaximumLiqRefusalPrice(Number(e.target.value))}
                            id='maximum_liq_refusal_price'
                            step="0.01"
                            required
                            value={maximum_liq_refusal_price}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="overestimate_correct_factor" className={styles.label}>Overestimate correction factor</label>
                        <input
                            type="number"
                            onChange={(e) => setOverestimateCorrectFactor(Number(e.target.value))}
                            id='overestimate_correct_factor'
                            step="0.01"
                            value={overestimate_correct_factor}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="oversold_method" className={styles.label}>Oversold method</label>
                        <select
                            onChange={(e) => setOversoldMethod(e.target.value as 'pieces' | 'area')}
                            id='oversold_method'
                            value={oversold_method}
                            className={styles.select}
                        >
                            <option value="pieces">pieces</option>
                            <option value="area">area</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="sigma" className={styles.label}>Sigma (for similarity)</label>
                        <input
                            type="number"
                            onChange={(e) => setSigma(Number(e.target.value))}
                            id='sigma'
                            step="0.1"
                            min="0.1"
                            value={sigma}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="similarityThreshold" className={styles.label}>Similarity Threshold</label>
                        <input
                            type="number"
                            onChange={(e) => setSimilarityThreshold(Number(e.target.value))}
                            id='similarityThreshold'
                            step="0.01"
                            min="0"
                            max="1"
                            value={similarityThreshold}
                            className={styles.input}
                        />
                    </div>

                    {/*<div className={styles.formGroup}>*/}
                    {/*    <label htmlFor="maxBonus" className={styles.label}>Max Bonus</label>*/}
                    {/*    <input*/}
                    {/*        type="number"*/}
                    {/*        onChange={(e) => setMaxBonus(Number(e.target.value))}*/}
                    {/*        id='maxBonus'*/}
                    {/*        step="0.1"*/}
                    {/*        min="0"*/}
                    {/*        value={maxBonus}*/}
                    {/*        className={styles.input}*/}
                    {/*    />*/}
                    {/*</div>*/}

                    {/*<div className={styles.formGroup}>*/}
                    {/*    <label htmlFor="bonusFactor" className={styles.label}>Bonus Factor</label>*/}
                    {/*    <input*/}
                    {/*        type="number"*/}
                    {/*        onChange={(e) => setBonusFactor(Number(e.target.value))}*/}
                    {/*        id='bonusFactor'*/}
                    {/*        step="0.01"*/}
                    {/*        min="0"*/}
                    {/*        max="1"*/}
                    {/*        value={bonusFactor}*/}
                    {/*        className={styles.input}*/}
                    {/*    />*/}
                    {/*</div>*/}

                    {/*<div className={styles.formGroup}>*/}
                    {/*    <label htmlFor="bonusScale" className={styles.label}>Bonus Scale</label>*/}
                    {/*    <input*/}
                    {/*        type="number"*/}
                    {/*        onChange={(e) => setBonusScale(Number(e.target.value))}*/}
                    {/*        id='bonusScale'*/}
                    {/*        step="0.1"*/}
                    {/*        min="0"*/}
                    {/*        max="1"*/}
                    {/*        value={bonusScale}*/}
                    {/*        className={styles.input}*/}
                    {/*    />*/}
                    {/*</div>*/}
                    <div className={styles.formGroup}>
                        <label htmlFor="distributionConfig" className={styles.label}>
                            Distribution Config
                        </label>
                        <select
                            id="distributionConfig"
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
                                    {config.func_name || `Config ${config.id}`}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <strong style={{textAlign: 'center', color: 'red'}}>Спочатку "зберегти статичні параметри", після - "зберегти конфігурацію"</strong>
                <button type='submit' className={styles.submitButton}>Зберегти статичні параметри</button>
            </form>
        </section>
    );
}

export default StaticParameters;