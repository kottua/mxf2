import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {fetchRealEstateObject} from "../api/RealEstateObjectApi.ts";
import BuildingInfo from "../components/BuildingInfo.tsx";
import UploadSpecificationFile from "../components/UploadSpecificationFile.tsx";
import type {RealEstateObjectData} from "../interfaces/RealEstateObjectData.ts";
import { updatePremisesBulk } from "../api/PremisesApi.ts";
import {
    mapIncomePlanToIncomePlanData,
    mapPremisesToRealEstateObjectData,
    transformToIncomePlanCreateRequest,
    transformToPremisesCreateRequest
} from "../core/Mappers.ts";
import UploadIncomeFile from "../components/UploadIncomeFile.tsx";
import type {IncomePlanData} from "../interfaces/IncomePlanData.ts";
import { updateIncomePlanBulk } from "../api/IncomePlanApi.ts";
import {useActiveRealEstateObject} from "../contexts/ActiveRealEstateObjectContext.tsx";
import styles from './OnBoardingPage.module.css';
import {useNotification} from "../hooks/useNotification.ts";

function OnboardingPage() {
    const { showError } = useNotification();
    const { id } = useParams();
    const navigate = useNavigate();
    const {activeObject, setActiveObject, isLoading, setIsLoading} = useActiveRealEstateObject();

    const [isSpecPreview, setIsSpecPreview] = useState(false);
    const [previewSpecData, setPreviewSpecData] = useState<RealEstateObjectData[]>([]);

    const [isIncomePreview, setIsIncomePreview] = useState(false);
    const [previewIncomeData, setPreviewIncomeData] = useState<IncomePlanData[]>([]);

    // Fetch real estate object data
    useEffect(() => {
        // The function to fetch and set the active real estate object.
        // It checks if there are premises and income plans and maps them to the preview data format.
        async function getObjectData(objId: number){
            if (!activeObject || activeObject.id !== Number(id)){
                setIsLoading(true);
                try {
                    const response = await fetchRealEstateObject(objId);
                    setActiveObject(response);
                } catch (error) {
                    console.error("Error fetching real estate object:", error);
                    showError('Не вдалося завантажити дані будинку.');
                }
            }
            if (activeObject && activeObject.premises.length > 0){
                const formattedPremises = mapPremisesToRealEstateObjectData(activeObject.premises);
                setPreviewSpecData(formattedPremises);
                const formattedIncomePlans = mapIncomePlanToIncomePlanData(activeObject.income_plans);
                setPreviewIncomeData(formattedIncomePlans);
            }
            setIsLoading(false);
        }
        getObjectData(Number(id));
    }, [id, activeObject, setActiveObject, setIsLoading]);

    // Save uploaded specification data to the API
    async function saveSpecificationData(){
        setIsLoading(true);
        try {
            if (!previewSpecData || previewSpecData.length === 0) return;
            
            // Filter out invalid data before saving
            const validData = previewSpecData.filter(item => 
                item && typeof item === 'object' && Object.keys(item).length > 0
            );
            
            if (validData.length === 0) {
                showError('Немає валідних даних для збереження.');
                return;
            }
            
            const transformedData = transformToPremisesCreateRequest(validData, Number(id));
            const response = await updatePremisesBulk(transformedData);
            const newActiveObject = {...activeObject, premises: response};
            setActiveObject(newActiveObject);
        } catch (error) {
            console.error('Error saving specification data:', error);
            showError('Не вдалося зберегти дані специфікації будинку.');
        } finally {
            setIsLoading(false);
        }
    }

    // Save uploaded income plan data to the API
    async function saveIncomePlanData(){
        setIsLoading(true);
        try {
            if (previewIncomeData.length === 0) return;
            
            console.log('Original income plan data:', previewIncomeData);
            console.log('First item structure:', previewIncomeData[0]);
            console.log('Available keys:', Object.keys(previewIncomeData[0] || {}));
            
            const transformedData = transformToIncomePlanCreateRequest(previewIncomeData, Number(id));
            console.log('Transformed data for API:', transformedData);
            console.log('First transformed item:', transformedData[0]);
            
            const response = await updateIncomePlanBulk(transformedData);
            const newActiveObject = {...activeObject, income_plans: response};
            setActiveObject(newActiveObject);
        } catch (error) {
            console.error('Error saving income plan data:', error);
            showError('Не вдалося зберегти дані плану доходів.');
        } finally {
            setIsLoading(false);
        }
    }

    function handleBackBtn(){
        navigate(-1);
    }

    if (!id || !activeObject || !activeObject.id || isLoading) {
        return (
            <main className={styles.main}>
                <p className={styles.loading}>Завантаження...</p>
            </main>
        );
    }

    return (
        <main className={styles.main}>
            <header className={styles.header}>
                <h1 className={styles.pageTitle}>Налаштування будинку</h1>
                <div className={styles.headerButtons}>
                    <button
                        onClick={saveSpecificationData} 
                        className={styles.saveButton}
                        disabled={!previewSpecData || previewSpecData.length === 0 || !previewSpecData.some(item => item && typeof item === 'object' && Object.keys(item).length > 0)}
                    >
                        Зберегти специфікацію
                    </button>
                    <button
                        onClick={saveIncomePlanData} 
                        className={styles.saveButton}
                        disabled={!previewIncomeData || previewIncomeData.length === 0}
                    >
                        Зберегти план доходів
                    </button>
                    <button
                        onClick={() => navigate("/configure/" + activeObject.id)}
                        className={styles.navButton}
                    >
                        Перейти до конфігурації
                    </button>
                    <button onClick={handleBackBtn} className={styles.backButton}>
                        Назад
                    </button>
                </div>
            </header>

            {/* Building Information Section */}
            <section className={styles.section}>
                <BuildingInfo
                    id={activeObject.id}
                    name={activeObject.name}
                    lat={activeObject.lat}
                    lon={activeObject.lon}
                    curr={activeObject.curr}
                    url={activeObject.url}
                    is_deleted={activeObject.is_deleted}
                    custom_fields={activeObject.custom_fields}
                    onUpdate={() => {
                        // Refresh the active object data
                        fetchRealEstateObject(activeObject.id).then(setActiveObject);
                    }}
                />
            </section>

            {/* Upload Sections - Horizontal Layout */}
            <div className={styles.uploadSections}>
                {/* Upload Specification Section */}
                <section className={styles.uploadSection}>
                    <UploadSpecificationFile
                        isPreview={isSpecPreview}
                        setIsPreview={setIsSpecPreview}
                        previewSpecData={previewSpecData}
                        setPreviewSpecData={setPreviewSpecData}
                        reoId={activeObject.id}
                    />
                </section>

                {/* Upload Income Plans Section */}
                <section className={styles.uploadSection}>
                    <UploadIncomeFile
                        isPreview={isIncomePreview}
                        previewIncomeData={previewIncomeData}
                        setIsPreview={setIsIncomePreview}
                        setPreviewIncomeData={setPreviewIncomeData}
                    />
                </section>
            </div>
        </main>
    );
}

export default OnboardingPage;
