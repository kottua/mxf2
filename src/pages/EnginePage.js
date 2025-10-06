import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchRealEstateObject } from "../api/RealEstateObjectApi.ts";
import EngineHeader from "../components/EngineHeader.tsx";
import EnginePriceCalculator from "../components/EnginePriceCalculator.tsx";
import ChessboardTable from "../components/ChessboardTable.tsx";
import ShowCalculationProcessTable from "../components/ShowCalculationProcessTable.tsx";
import { useActiveRealEstateObject } from "../contexts/ActiveRealEstateObjectContext.tsx";
import styles from "./EnginePage.module.css";
import { fetchDistributionConfigs } from "../api/DistributionConfigApi.ts";
function EnginePage() {
    const { id } = useParams();
    const { activeObject, setActiveObject, isLoading, setIsLoading } = useActiveRealEstateObject();
    const [selectedEngine, setSelectedEngine] = useState("Regular");
    const [selectedMetric, setSelectedMetric] = useState("Unit Number");
    //const [selectedView, setSelectedView] = useState("basic-metrics");
    const [scoringData, setScoringData] = useState({});
    const [calculationProcessData, setCalculationProcessData] = useState(null);
    const [distribConfig, setDistribConfig] = useState([]);
    const [activeConfig, setActiveConfig] = useState(null);
    const navigate = useNavigate();
    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetchRealEstateObject(Number(id));
                console.log(response);
                setActiveObject(response);
            }
            catch (error) {
                console.error("Error fetching real estate object:", error);
                alert('Не вдалося завантажити дані об\'єкта.');
            }
            finally {
                setIsLoading(false);
            }
        }
        async function getDistribConfig() {
            try {
                const response = await fetchDistributionConfigs();
                setDistribConfig(response);
            }
            catch (error) {
                console.error("Error fetching distribution configs:", error);
                alert('Не вдалося завантажити конфігурації розподілу.');
            }
            finally {
                setIsLoading(false);
            }
        }
        if (activeObject && activeObject.id === Number(id)) {
            setIsLoading(false);
            return;
        }
        fetchData();
        getDistribConfig();
    }, [activeObject, id, setActiveObject, setIsLoading]);
    function handleBackBtn() {
        navigate(-1);
    }
    if (!activeObject || isLoading) {
        return _jsx("div", { className: styles.loading, children: "\u0417\u0430\u0432\u0430\u043D\u0442\u0430\u0436\u0435\u043D\u043D\u044F..." });
    }
    return (_jsxs("main", { className: styles.main, children: [_jsxs("header", { className: styles.header, children: [_jsx("h1", { className: styles.pageTitle, children: "Engine" }), _jsx("button", { onClick: handleBackBtn, className: styles.backButton, children: "\u041D\u0430\u0437\u0430\u0434" })] }), _jsxs("p", { className: styles.objectInfo, children: ["Engine \u0434\u043B\u044F \u043E\u0431'\u0454\u043A\u0442\u0430: ", _jsx("strong", { children: activeObject?.name })] }), _jsx(EngineHeader, { objectName: activeObject.name, selectedEngine: selectedEngine, setSelectedEngine: setSelectedEngine, selectedMetric: selectedMetric, setSelectedMetric: setSelectedMetric, configs: distribConfig, setActiveConfig: setActiveConfig }), _jsx(EnginePriceCalculator, { selectedEngine: selectedEngine, realObject: activeObject, setCalculationProcessData: setCalculationProcessData }), _jsxs("section", { className: styles.section, children: [_jsx("h2", { children: "\u0428\u0430\u0445\u0456\u0432\u043D\u0438\u0446\u044F \u0446\u0456\u043D" }), _jsx(ChessboardTable, { selectedMetric: selectedMetric, premises: activeObject.premises, dynamicConfig: activeObject.pricing_configs[activeObject.pricing_configs.length - 1].content.dynamicConfig, staticConfig: activeObject.pricing_configs[activeObject.pricing_configs.length - 1].content.staticConfig, ranging: activeObject.pricing_configs[activeObject.pricing_configs.length - 1].content.ranging, setScoringData: setScoringData })] }), _jsx("section", { className: styles.section, children: _jsx(ShowCalculationProcessTable, { premises: activeObject.premises, scoringData: scoringData, calculationProcessData: calculationProcessData, distribConfigs: distribConfig, activeConfigId: activeConfig, activeObject: activeObject }) })] }));
}
export default EnginePage;
