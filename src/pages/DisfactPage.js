import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState } from 'react';
import CreateDistributionPresetForm from "../components/CreateDistributionPresetForm.tsx";
import { fetchDistributionConfigs } from "../api/DistributionConfigApi.ts";
function DisfactPage() {
    const [distributeConfig, setDistributeConfig] = useState([]);
    useEffect(() => {
        async function getDistribConfig() {
            const config = await fetchDistributionConfigs();
            setDistributeConfig(config);
        }
        getDistribConfig();
    }, []);
    return (_jsxs("main", { children: [_jsx("h1", { children: "\u0421\u0442\u043E\u0440\u0456\u043D\u043A\u0430 Disfact: \u041D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F \u0434\u0438\u0441\u0442\u0440\u0438\u0431\u0443\u0446\u0456\u0457" }), _jsx(CreateDistributionPresetForm, { setDistributeConfig: setDistributeConfig }), _jsxs("section", { children: [_jsx("h2", { children: "\u0417\u0431\u0435\u0440\u0435\u0436\u043D\u0456 \u0434\u0438\u0441\u0442\u0440\u0438\u0431\u0443\u0446\u0456\u0457" }), distributeConfig.length === 0 ? (_jsx("p", { children: "\u041D\u0435\u043C\u0430\u0454 \u0437\u0431\u0435\u0440\u0435\u0436\u0435\u043D\u0438\u0445 \u0434\u0438\u0441\u0442\u0440\u0438\u0431\u0443\u0446\u0456\u0439." })) : (_jsx("ul", { children: distributeConfig.map((config) => (_jsxs("li", { children: [_jsx("strong", { children: config.func_name }), " - ID: ", config.id, " - Content: ", JSON.stringify(config.content)] }, config.id))) }))] })] }));
}
export default DisfactPage;
