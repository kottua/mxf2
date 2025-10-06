import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { createRealEstateObject, deleteRealEstateObject, fetchRealEstateObjects } from "../api/RealEstateObjectApi.ts";
import ShowObjectItem from "../components/ShowObjectItem.tsx";
import CreateEmptyObject from "../components/CreateEmptyObject.tsx";
import styles from './MainPage.module.css';
function MainPage() {
    const [objects, setObjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    // Fetch real estate objects
    useEffect(() => {
        async function loadObjects() {
            try {
                const data = await fetchRealEstateObjects();
                setObjects(data);
            }
            catch (error) {
                console.error("Error fetching real estate objects:", error);
            }
            finally {
                setIsLoading(false);
            }
        }
        loadObjects();
    }, []);
    // create a new empty object
    async function handleCreateObject(name) {
        setIsLoading(true);
        try {
            const newObject = await createRealEstateObject(name || "Новий об'єкт");
            setObjects(prevObjects => [...prevObjects, newObject]);
            navigate('/onboarding/' + newObject.id);
        }
        catch (error) {
            console.error("Error creating real estate object:", error);
        }
        finally {
            setIsLoading(false);
        }
    }
    // Delete an object by ID
    async function handleDeleteObject(objId) {
        setIsLoading(true);
        try {
            await deleteRealEstateObject(objId);
            setObjects(prevObjects => prevObjects.filter(obj => obj.id !== objId));
        }
        catch (error) {
            console.error("Error deleting real estate object:", error);
            alert('Не вдалося видалити об\'єкт. Спробуйте ще раз пізніше.');
        }
        finally {
            setIsLoading(false);
        }
    }
    // Navigate to onboarding page for the object by ID
    function handleObjectClick(objId) {
        navigate('/onboarding/' + objId);
    }
    if (isLoading) {
        return (_jsx("div", { className: styles.globalContainer, children: _jsx("div", { className: styles.mainContainer, children: _jsx("p", { className: styles.loadingText, children: "\u0417\u0430\u0432\u0430\u043D\u0442\u0430\u0436\u0435\u043D\u043D\u044F..." }) }) }));
    }
    return (_jsxs("div", { className: styles.globalContainer, children: [_jsx("button", { onClick: () => navigate('/disfact'), children: "\u041F\u0435\u0440\u0435\u0439\u0442\u0438 \u043D\u0430 DisfactPage" }), _jsxs("main", { className: styles.mainContainer, children: [_jsx("h1", { className: styles.pageTitle, children: "\u041C\u043E\u0457 \u043E\u0431'\u0454\u043A\u0442\u0438" }), _jsxs("section", { className: styles.section, children: [_jsx("h2", { children: "\u0414\u043E\u0434\u0430\u0442\u0438 \u043D\u043E\u0432\u0438\u0439 \u043E\u0431'\u0454\u043A\u0442" }), _jsx(CreateEmptyObject, { onCreate: handleCreateObject })] }), _jsxs("section", { className: styles.section, children: [_jsx("h2", { children: "\u0421\u043F\u0438\u0441\u043E\u043A \u043E\u0431'\u0454\u043A\u0442\u0456\u0432" }), objects.length === 0 ? (_jsx("p", { className: styles.emptyState, children: "\u041E\u0431'\u0454\u043A\u0442\u0438 \u0432\u0456\u0434\u0441\u0443\u0442\u043D\u0456. \u0414\u043E\u0434\u0430\u0439\u0442\u0435 \u043D\u043E\u0432\u0438\u0439." })) : (_jsx("div", { className: styles.objectsGrid, children: objects.map(item => (_jsx(ShowObjectItem, { ...item, onClick: handleObjectClick, onDelete: handleDeleteObject }, item.id))) }))] })] })] }));
}
export default MainPage;
