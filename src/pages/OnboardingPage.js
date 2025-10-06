import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchRealEstateObject } from "../api/RealEstateObjectApi.ts";
import EditRealEstateObject from "../components/EditRealEstateObject.tsx";
import UploadSpecificationFile from "../components/UploadSpecificationFile.tsx";
import { updatePremisesBulk } from "../api/PremisesApi.ts";
import { mapIncomePlanToIncomePlanData, mapPremisesToRealEstateObjectData, transformToIncomePlanCreateRequest, transformToPremisesCreateRequest } from "../core/Mappers.ts";
import UploadIncomeFile from "../components/UploadIncomeFile.tsx";
import { updateIncomePlanBulk } from "../api/IncomePlanApi.ts";
import { useActiveRealEstateObject } from "../contexts/ActiveRealEstateObjectContext.tsx";
import styles from './OnBoardingPage.module.css';
function OnboardingPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { activeObject, setActiveObject, isLoading, setIsLoading } = useActiveRealEstateObject();
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSpecPreview, setIsSpecPreview] = useState(false);
    const [previewSpecData, setPreviewSpecData] = useState([]);
    const [isIncomePreview, setIsIncomePreview] = useState(false);
    const [previewIncomeData, setPreviewIncomeData] = useState([]);
    // Fetch real estate object data
    useEffect(() => {
        // The function to fetch and set the active real estate object.
        // It checks if there are premises and income plans and maps them to the preview data format.
        async function getObjectData(objId) {
            if (!activeObject || activeObject.id !== Number(id)) {
                setIsLoading(true);
                try {
                    const response = await fetchRealEstateObject(objId);
                    setActiveObject(response);
                }
                catch (error) {
                    console.error("Error fetching real estate object:", error);
                    alert('Не вдалося завантажити дані об\'єкта.');
                }
            }
            if (activeObject && activeObject.premises.length > 0) {
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
    async function saveSpecificationData() {
        setIsLoading(true);
        try {
            if (previewSpecData.length === 0)
                return;
            const transformedData = transformToPremisesCreateRequest(previewSpecData, Number(id));
            const response = await updatePremisesBulk(transformedData);
            const newActiveObject = { ...activeObject, premises: response };
            setActiveObject(newActiveObject);
            console.log('Successfully saved specification data:', response);
        }
        catch (error) {
            console.error('Error saving specification data:', error);
            alert('Не вдалося зберегти дані специфікації.');
        }
        finally {
            setIsLoading(false);
        }
    }
    // Save uploaded income plan data to the API
    async function saveIncomePlanData() {
        setIsLoading(true);
        try {
            if (previewIncomeData.length === 0)
                return;
            const transformedData = transformToIncomePlanCreateRequest(previewIncomeData, Number(id));
            const response = await updateIncomePlanBulk(transformedData);
            const newActiveObject = { ...activeObject, income_plans: response };
            setActiveObject(newActiveObject);
            console.log('Saving income plan data:', response);
        }
        catch (error) {
            console.error('Error saving income plan data:', error);
            alert('Не вдалося зберегти дані плану доходів.');
        }
        finally {
            setIsLoading(false);
        }
    }
    function handleBackBtn() {
        navigate(-1);
    }
    if (!id || !activeObject || !activeObject.id || isLoading) {
        return (_jsx("main", { className: styles.main, children: _jsx("p", { className: styles.loading, children: "\u0417\u0430\u0432\u0430\u043D\u0442\u0430\u0436\u0435\u043D\u043D\u044F..." }) }));
    }
    return (_jsxs("main", { className: styles.main, children: [_jsxs("header", { className: styles.header, children: [_jsx("h1", { className: styles.pageTitle, children: "\u041D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F \u043E\u0431'\u0454\u043A\u0442\u0430" }), _jsx("button", { onClick: handleBackBtn, className: styles.backButton, children: "\u041D\u0430\u0437\u0430\u0434" })] }), _jsx("section", { className: styles.section, children: isEditMode ? (_jsx(EditRealEstateObject, { ...activeObject, setIsEditMode: setIsEditMode })) : (_jsxs("div", { className: styles.objectHeader, children: [_jsx("h2", { className: styles.objectName, children: activeObject?.name }), _jsx("button", { onClick: () => setIsEditMode(true), className: styles.editButton, children: "\u0420\u0435\u0434\u0430\u0433\u0443\u0432\u0430\u0442\u0438" })] })) }), _jsxs("section", { className: styles.section, children: [_jsx(UploadSpecificationFile, { isPreview: isSpecPreview, setIsPreview: setIsSpecPreview, previewSpecData: previewSpecData, setPreviewSpecData: setPreviewSpecData }), _jsx("button", { onClick: saveSpecificationData, className: styles.saveButton, disabled: previewSpecData.length === 0, children: "\u0417\u0431\u0435\u0440\u0435\u0433\u0442\u0438 \u0434\u0430\u043D\u0456 \u0441\u043F\u0435\u0446\u0438\u0444\u0456\u043A\u0430\u0446\u0456\u0457" })] }), _jsxs("section", { className: styles.section, children: [_jsx(UploadIncomeFile, { isPreview: isIncomePreview, previewIncomeData: previewIncomeData, setIsPreview: setIsIncomePreview, setPreviewIncomeData: setPreviewIncomeData }), _jsx("button", { onClick: saveIncomePlanData, className: styles.saveButton, children: "\u0417\u0431\u0435\u0440\u0435\u0433\u0442\u0438 \u0434\u0430\u043D\u0456 \u043F\u043B\u0430\u043D\u0443 \u0434\u043E\u0445\u043E\u0434\u0456\u0432" })] }), _jsx("button", { onClick: () => navigate("/configure/" + activeObject.id), className: styles.navButton, children: "\u041F\u0435\u0440\u0435\u0439\u0442\u0438 \u0434\u043E \u043A\u043E\u043D\u0444\u0456\u0433\u0443\u0440\u0430\u0446\u0456\u0457" })] }));
}
export default OnboardingPage;
