import React, {useEffect, useState} from 'react';
import CreateDistributionPresetForm from "../components/CreateDistributionPresetForm.tsx";
import type {DistributionConfig} from "../interfaces/DistributionConfig.ts";
import {fetchDistributionConfigs} from "../api/DistributionConfigApi.ts";

function DisfactPage() {
    const [distributeConfig, setDistributeConfig] = useState<DistributionConfig[]>([]);

    useEffect(() => {
        async function getDistribConfig(){
            const config = await fetchDistributionConfigs();
            setDistributeConfig(config);
        }
        getDistribConfig();
    }, []);

    return (
        <main>
            <h1>Сторінка Disfact: Налаштування дистрибуції</h1>

            <CreateDistributionPresetForm setDistributeConfig={setDistributeConfig}/>

            <section>
                <h2>Збережні дистрибуції</h2>
                {distributeConfig.length === 0 ? (
                    <p>Немає збережених дистрибуцій.</p>
                ) : (
                    <ul>
                        {distributeConfig.map((config) => (
                            <li key={config.id}>
                                <strong>{config.func_name}</strong> - ID: {config.id} - Content: {JSON.stringify(config.content)}
                            </li>
                        ))}
                    </ul>
                )}
            </section>

        </main>
    );
}

export default DisfactPage;