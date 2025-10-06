import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {fetchRealEstateObject} from "../api/RealEstateObjectApi.ts";
import EditRealEstateObject from "../components/EditRealEstateObject.tsx";
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

function OnboardingPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const {activeObject, setActiveObject, isLoading, setIsLoading} = useActiveRealEstateObject();

    const [isEditMode, setIsEditMode] = useState(false);

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
                    alert('Не вдалося завантажити дані об\'єкта.');
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
            if (previewSpecData.length === 0) return;
            const transformedData = transformToPremisesCreateRequest(previewSpecData, Number(id));
            const response = await updatePremisesBulk(transformedData);
            const newActiveObject = {...activeObject, premises: response};
            setActiveObject(newActiveObject);
        } catch (error) {
            console.error('Error saving specification data:', error);
            alert('Не вдалося зберегти дані специфікації.');
        } finally {
            setIsLoading(false);
        }
    }

    // Save uploaded income plan data to the API
    async function saveIncomePlanData(){
        setIsLoading(true);
        try {
            if (previewIncomeData.length === 0) return;
            const transformedData = transformToIncomePlanCreateRequest(previewIncomeData, Number(id));
            const response = await updateIncomePlanBulk(transformedData);
            const newActiveObject = {...activeObject, income_plans: response};
            setActiveObject(newActiveObject);
        } catch (error) {
            console.error('Error saving income plan data:', error);
            alert('Не вдалося зберегти дані плану доходів.');
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
                <h1 className={styles.pageTitle}>Налаштування об'єкта</h1>
                <button onClick={handleBackBtn} className={styles.backButton}>
                    Назад
                </button>
            </header>

            {/* Edit Object Section */}
            <section className={styles.section}>
                {isEditMode ? (
                    <EditRealEstateObject {...activeObject} setIsEditMode={setIsEditMode} />
                ) : (
                    <div className={styles.objectHeader}>
                        <h2 className={styles.objectName}>{activeObject?.name}</h2>
                        <button
                            onClick={() => setIsEditMode(true)}
                            className={styles.editButton}
                        >
                            Редагувати
                        </button>
                    </div>
                )}
            </section>

            {/* Upload Specification Section */}
            <section className={styles.section}>
                <UploadSpecificationFile
                    isPreview={isSpecPreview}
                    setIsPreview={setIsSpecPreview}
                    previewSpecData={previewSpecData}
                    setPreviewSpecData={setPreviewSpecData}
                />
                <button onClick={saveSpecificationData} className={styles.saveButton} disabled={previewSpecData.length === 0}>
                    Зберегти дані специфікації
                </button>
            </section>

            {/* Upload Income Plans Section */}
            <section className={styles.section}>
                <UploadIncomeFile
                    isPreview={isIncomePreview}
                    previewIncomeData={previewIncomeData}
                    setIsPreview={setIsIncomePreview}
                    setPreviewIncomeData={setPreviewIncomeData}
                />
                <button onClick={saveIncomePlanData} className={styles.saveButton}>
                    Зберегти дані плану доходів
                </button>
            </section>

            <button
                onClick={() => navigate("/configure/" + activeObject.id)}
                className={styles.navButton}
            >
                Перейти до конфігурації
            </button>
        </main>
    );
}

export default OnboardingPage;