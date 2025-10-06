import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { scoring } from "../core/scoring.ts";
import styles from "./ChessboardTable.module.css";
import { useEffect, useMemo } from "react";
function ChessboardTable({ premises, selectedMetric, staticConfig, dynamicConfig, ranging, setScoringData }) {
    const scoringData = useMemo(() => {
        return premises.reduce((acc, item) => {
            const score = scoring(item, premises.filter(flat => flat.id !== item.id), dynamicConfig, staticConfig, ranging);
            return { ...acc, [item.id]: score };
        }, {});
    }, [premises, dynamicConfig, staticConfig, ranging]);
    // Передаем scoringData в родительский компонент
    useEffect(() => {
        setScoringData(scoringData);
    }, [scoringData, setScoringData]);
    const floors = [...new Set(premises.map((item) => item.floor))].sort((a, b) => a - b);
    const units = [...new Set(premises.map((item) => item.number_of_unit))].sort((a, b) => a - b);
    function getMetricValue(floor, unit) {
        const item = premises.find((flat) => flat.floor === floor && flat.number_of_unit === unit);
        if (!item)
            return "N/A";
        if (selectedMetric === "Unit Number") {
            return item.number;
        }
        else if (selectedMetric === "Scoring") {
            return scoringData[item.id] ?? "N/A";
        }
        else if (selectedMetric === "presetValue") {
            // TODO: Логіка для presetValue на основе scoringData
            return "N/A";
        }
        else if (selectedMetric === "actualPricePerSQM") {
            return item.price_per_meter;
        }
        else if (selectedMetric === "normContributeRT") {
            // TODO: Логіка
            return "N/A";
        }
        else if (selectedMetric === "conditionalValue") {
            // TODO: Логіка
            return "N/A";
        }
        else if (selectedMetric === "conditionalCost") {
            // TODO: Логіка
            return "N/A";
        }
        else if (selectedMetric === "transformRate") {
            // TODO: Логіка
            return "N/A";
        }
        else {
            return "N/A";
        }
    }
    const getCellClassName = (value) => {
        if (typeof value === 'string' && value.includes('₴')) {
            return styles.currencyCell;
        }
        if (typeof value === 'number' || !isNaN(Number(value))) {
            return styles.numberCell;
        }
        return styles.textCell;
    };
    return (_jsxs("section", { className: styles.section, children: [_jsx("h2", { className: styles.sectionTitle, children: "\u0428\u0430\u0445\u0456\u0432\u043D\u0438\u0446\u044F \u0446\u0456\u043D" }), _jsxs("p", { className: styles.metricInfo, children: ["\u041C\u0435\u0442\u0440\u0438\u043A\u0430: ", _jsx("strong", { children: selectedMetric })] }), _jsx("div", { className: styles.tableContainer, children: _jsxs("table", { className: styles.chessboardTable, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { className: styles.cornerHeader, children: "\u041F\u043E\u0432\u0435\u0440\u0445/\u041A\u0432\u0430\u0440\u0442\u0438\u0440\u0430" }), units.map((item) => (_jsxs("th", { className: styles.unitHeader, children: ["\u2116", item] }, item)))] }) }), _jsx("tbody", { children: floors.map((floor) => (_jsxs("tr", { className: styles.floorRow, children: [_jsx("td", { className: styles.floorHeader, children: floor }), units.map((unit) => {
                                        const value = getMetricValue(floor, unit);
                                        return (_jsx("td", { className: `${styles.cell} ${getCellClassName(value)}`, children: value }, `${floor}_${unit}`));
                                    })] }, floor))) })] }) }), _jsxs("div", { className: styles.tableInfo, children: [_jsxs("p", { children: ["\u0412\u0441\u044C\u043E\u0433\u043E \u043F\u043E\u0432\u0435\u0440\u0445\u0456\u0432: ", _jsx("strong", { children: floors.length })] }), _jsxs("p", { children: ["\u0412\u0441\u044C\u043E\u0433\u043E \u043A\u0432\u0430\u0440\u0442\u0438\u0440: ", _jsx("strong", { children: units.length })] }), _jsxs("p", { children: ["\u0412\u0441\u044C\u043E\u0433\u043E \u043E\u0434\u0438\u043D\u0438\u0446\u044C: ", _jsx("strong", { children: premises.length })] })] })] }));
}
export default ChessboardTable;
