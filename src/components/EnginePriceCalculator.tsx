import {useState} from "react";
import type {RealEstateObject} from "../interfaces/RealEstateObject.ts";
import styles from "./EnginePriceCalculator.module.css";
import type {CalculationProcessData} from "../pages/EnginePage.tsx";

interface EnginePriceCalculatorProps {
    realObject: RealEstateObject | null;
    selectedEngine: string;
    setCalculationProcessData: (data: CalculationProcessData) => void;
}

function EnginePriceCalculator({ realObject, selectedEngine, setCalculationProcessData }: EnginePriceCalculatorProps) {
    const [calculatedPrice, setCalculatedPrice] = useState<number | string>(0);

    function onCalculatePrice(){
        // actualPricePerSQM(realObject, selectedEngine, normContributeRT, setCalculationProcessData, setCalculatedPrice);
        alert('Тут поки ніфіга нема')
    }

    return (
        <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Результат розрахованої ціни на {selectedEngine} engine</h2>

            <div className={styles.priceContainer}>
                <span className={styles.priceLabel}>Ціна за м²:</span>
                <span className={styles.priceValue}>{calculatedPrice} ₴</span>
            </div>

            <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Базовий двигун:</span>
                    <span className={styles.infoValue}>{selectedEngine}</span>
                </div>
                {realObject && (
                    <>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Базова ціна:</span>
                            <span className={styles.infoValue}>
                                {realObject.income_plans[0]?.price_per_sqm?.toFixed(2) || '0.00'} ₴
                            </span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Мін. ліквідність:</span>
                            <span className={styles.infoValue}>
                                {realObject.pricing_configs[0]?.content.staticConfig.minimum_liq_refusal_price?.toFixed(2) || '0.00'}
                            </span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Макс. ліквідність:</span>
                            <span className={styles.infoValue}>
                                {realObject.pricing_configs[0]?.content.staticConfig.maximum_liq_refusal_price?.toFixed(2) || '0.00'}
                            </span>
                        </div>
                    </>
                )}
            </div>

            <button onClick={() => onCalculatePrice()} className={styles.calculateButton}>
                Розрахувати ціну
            </button>
        </section>
    );
}

export default EnginePriceCalculator;