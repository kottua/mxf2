import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from "./EngineHeader.module.css";
function EngineHeader({ objectName, selectedEngine, setSelectedEngine, selectedMetric, setSelectedMetric, configs, setActiveConfig, }) {
    const handleEngineChange = (e) => {
        setSelectedEngine(e.target.value);
    };
    const handleMetricChange = (e) => {
        setSelectedMetric(e.target.value);
    };
    return (_jsxs("section", { className: styles.section, children: [_jsx("h2", { className: styles.sectionTitle, children: objectName || "Без назви" }), _jsxs("div", { className: styles.selectorsContainer, children: [_jsxs("label", { className: styles.label, children: ["\u0414\u0432\u0438\u0436\u043E\u043A:", _jsxs("select", { className: styles.select, value: selectedEngine, onChange: handleEngineChange, children: [_jsx("option", { value: "Regular", children: "Regular" }), _jsx("option", { value: "Oh, Elon", children: "Oh, Elon" })] })] }), _jsxs("label", { className: styles.label, children: ["Config", configs.map(item => (_jsxs("div", { className: styles.radioGroup, children: [_jsx("input", { type: "radio", id: `config-${item.id}`, name: "distributionConfig", value: item.id, onChange: () => setActiveConfig(item.id) }), _jsx("label", { htmlFor: `config-${item.id}`, className: styles.radioLabel, children: item.func_name })] }, item.id)))] }), _jsxs("label", { className: styles.label, children: ["\u041C\u0435\u0442\u0440\u0438\u043A\u0430:", _jsxs("select", { className: styles.select, value: selectedMetric, onChange: handleMetricChange, children: [_jsx("option", { value: "Unit Number", children: "\u041D\u043E\u043C\u0435\u0440 \u043A\u0432\u0430\u0440\u0442\u0438\u0440\u0438" }), _jsx("option", { value: "Current price per sqm", children: "\u041F\u043E\u0442\u043E\u0447\u043D\u0430 \u0446\u0456\u043D\u0430 \u0437\u0430 \u043C\u00B2" }), _jsx("option", { value: "Scoring", children: "Scoring" }), _jsx("option", { value: "Score Mixed", children: "Score Mixed" }), _jsx("option", { value: "presetValue", children: "Preset Value" }), _jsx("option", { value: "actualPricePerSQM", children: "Actual Price per sqm" })] })] })] })] }));
}
export default EngineHeader;
