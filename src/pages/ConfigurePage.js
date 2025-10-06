import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { fetchRealEstateObject } from "../api/RealEstateObjectApi.ts";
import { useNavigate, useParams } from "react-router-dom";
import { createPricingConfig, fetchPricingConfig } from "../api/PricingConfigApi.ts";
import DynamicParameters from "../components/DynamicParameters.tsx";
import StaticParameters from "../components/StaticParameters.tsx";
import { getDynamicFromPricingConfig, getStaticFromPricingConfig } from "../core/Parsers.ts";
import PremisesParameters, {} from "../components/PremisesParameters.tsx";
import { useActiveRealEstateObject } from "../contexts/ActiveRealEstateObjectContext.tsx";
import styles from "./ConfigurePage.module.css";
function ConfigurePage() {
    const { id } = useParams();
    const { activeObject, setActiveObject, isLoading, setIsLoading } = useActiveRealEstateObject();
    const [dynamicConfig, setDynamicConfig] = useState(null);
    const [staticConfig, setStaticConfig] = useState(null);
    const [pricingConfig, setPricingConfig] = useState(null);
    const [priorities, setPriorities] = useState({});
    const navigate = useNavigate();
    // Fetch estate object and pricing config (static and dynamic) data
    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetchRealEstateObject(Number(id));
                setActiveObject(response);
            }
            catch (error) {
                console.error("Error fetching real estate object:", error);
                alert('Не вдалося завантажити дані об\'єкта.');
            }
        }
        async function getPricingConfig() {
            try {
                const response = await fetchPricingConfig(Number(id));
                setStaticConfig(getStaticFromPricingConfig(response));
                setDynamicConfig(getDynamicFromPricingConfig(response));
                setPriorities(response.content?.ranging || {});
                setPricingConfig(response);
            }
            catch (error) {
                console.error("Error fetching pricing config:", error);
                // alert('Не вдалося завантажити конфігурацію ціноутворення.');
            }
            finally {
                setIsLoading(false);
            }
        }
        if (activeObject && activeObject.id === Number(id)) {
            if (activeObject.pricing_configs.length === 0) {
                setIsLoading(false);
                return;
            }
            console.log('Using existing activeObject pricing config');
            setStaticConfig(activeObject.pricing_configs[activeObject.pricing_configs.length - 1].content.staticConfig);
            setDynamicConfig(activeObject.pricing_configs[activeObject.pricing_configs.length - 1].content.dynamicConfig);
            setPriorities(activeObject.pricing_configs[activeObject.pricing_configs.length - 1].content.ranging || {});
            setIsLoading(false);
            return;
        }
        fetchData();
        getPricingConfig();
    }, [activeObject, id, setActiveObject, setIsLoading]);
    function handleBackBtn() {
        navigate(-1);
    }
    function checkIsEngineReady() {
        if (!dynamicConfig || !staticConfig)
            return false;
        return true;
    }
    function handleGoToEngine() {
        if (!checkIsEngineReady()) {
            alert('Будь ласка, заповніть всі параметри перед переходом до Engine');
            return;
        }
        navigate(`/engine/${id}`);
    }
    async function handleSaveConfig() {
        if (!dynamicConfig || !staticConfig) {
            alert('Будь ласка, заповніть всі параметри');
            return;
        }
        setIsLoading(true);
        try {
            const configToSave = {
                id: pricingConfig?.id || 0,
                is_active: true,
                reo_id: Number(id),
                content: {
                    "staticConfig": staticConfig,
                    "dynamicConfig": dynamicConfig,
                    "ranging": priorities || {}
                },
                created_at: pricingConfig?.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString(),
                real_estate_object: activeObject,
                committed_prices: pricingConfig?.committed_prices || []
            };
            const response = await createPricingConfig(Number(id), configToSave);
            setPricingConfig(response[response.length - 1]);
            console.log('Saved pricing config:', response);
            alert('Конфігурацію успішно збережено!');
        }
        catch (error) {
            console.error("Error saving pricing config:", error);
            alert('Не вдалося зберегти конфігурацію.');
        }
        finally {
            setIsLoading(false);
        }
    }
    if (!activeObject || !activeObject.id || isLoading) {
        return (_jsx("div", { className: styles.loadingContainer, children: _jsx("p", { className: styles.loading, children: "\u0417\u0430\u0432\u0430\u043D\u0442\u0430\u0436\u0435\u043D\u043D\u044F..." }) }));
    }
    return (_jsxs("main", { className: styles.main, children: [_jsxs("header", { className: styles.header, children: [_jsx("h1", { className: styles.pageTitle, children: "\u041A\u043E\u043D\u0444\u0456\u0433\u0443\u0440\u0430\u0446\u0456\u044F" }), _jsx("button", { onClick: handleBackBtn, className: styles.backButton, children: "\u041D\u0430\u0437\u0430\u0434" })] }), _jsxs("p", { className: styles.objectInfo, children: ["\u041A\u043E\u043D\u0444\u0456\u0433\u0443\u0440\u0430\u0446\u0456\u044F \u0434\u043B\u044F \u043E\u0431'\u0454\u043A\u0442\u0430: ", _jsx("strong", { children: activeObject?.name })] }), _jsxs("section", { className: styles.section, children: [_jsx("h2", { children: "\u0414\u0438\u043D\u0430\u043C\u0456\u0447\u043D\u0456 \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u0438" }), _jsx(DynamicParameters, { premises: activeObject.premises, currentConfig: dynamicConfig, onConfigChange: setDynamicConfig })] }), dynamicConfig?.importantFields && (_jsxs("section", { className: styles.section, children: [_jsx("h2", { children: "\u041F\u0440\u0456\u043E\u0440\u0438\u0442\u0435\u0442\u0438 \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u0456\u0432" }), _jsx(PremisesParameters, { premises: activeObject.premises, selectedColumns: dynamicConfig?.importantFields, setPriorities: setPriorities, priorities: priorities })] })), _jsxs("section", { className: styles.section, children: [_jsx("h2", { children: "\u0421\u0442\u0430\u0442\u0438\u0447\u043D\u0456 \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u0438" }), _jsx(StaticParameters, { currentConfig: staticConfig, setStaticConfig: setStaticConfig, incomePlans: activeObject.income_plans || [], premises: activeObject.premises || [] })] }), _jsxs("div", { className: styles.actions, children: [_jsx("button", { onClick: handleSaveConfig, className: styles.saveButton, children: "\u0417\u0431\u0435\u0440\u0435\u0433\u0442\u0438 \u043A\u043E\u043D\u0444\u0456\u0433\u0443\u0440\u0430\u0446\u0456\u044E" }), _jsx("button", { onClick: handleGoToEngine, className: styles.navButton, children: "\u041F\u0435\u0440\u0435\u0439\u0442\u0438 \u0434\u043E Engine" })] })] }));
}
export default ConfigurePage;
