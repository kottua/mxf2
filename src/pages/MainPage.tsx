import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import type {RealEstateObject} from "../interfaces/RealEstateObject.ts";
import {createRealEstateObject, deleteRealEstateObject, fetchRealEstateObjects} from "../api/RealEstateObjectApi.ts";
import ShowObjectItem from "../components/ShowObjectItem.tsx";
import CreateEmptyObject from "../components/CreateEmptyObject.tsx";
import Notification from "../components/Notification.tsx";
import {useNotification} from "../hooks/useNotification.ts";
import styles from './MainPage.module.css';

function MainPage() {
    const [objects, setObjects] = useState<RealEstateObject[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { notifications, removeNotification, showError, showSuccess } = useNotification();

    const navigate = useNavigate();

    // Fetch real estate objects
    useEffect(() => {
        async function loadObjects() {
            try {
                const data = await fetchRealEstateObjects();
                setObjects(data);
            } catch (error) {
                console.error("Error fetching real estate objects:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadObjects();
    }, []);

    // create a new empty object
    async function handleCreateObject(name: string) {
        setIsLoading(true);
        try {
            const newObject = await createRealEstateObject(name || "Новий об'єкт");
            setObjects(prevObjects => [...prevObjects, newObject]);
            navigate('/onboarding/' + newObject.id);
        } catch (error: any) {
            console.error("Error creating real estate object:", error);
            
            // Check if the error is about duplicate name
            if (error?.response?.data?.message === "Real Estate with this name already exists") {
                showError('Об\'єкт з таким ім\'ям вже існує. Будь ласка, виберіть інше ім\'я.');
            } else {
                showError('Не вдалося створити об\'єкт. Спробуйте ще раз пізніше.');
            }
        } finally {
            setIsLoading(false);
        }
    }

    // Delete an object by ID
    async function handleDeleteObject(objId: number) {
        setIsLoading(true);
        try {
            await deleteRealEstateObject(objId);
            setObjects(prevObjects => prevObjects.filter(obj => obj.id !== objId));
        } catch (error) {
            console.error("Error deleting real estate object:", error);
            showError('Не вдалося видалити об\'єкт. Спробуйте ще раз пізніше.');
        } finally {
            setIsLoading(false);
        }
    }

    // Navigate to onboarding page for the object by ID
    function handleObjectClick(objId: number){
        navigate('/onboarding/' + objId);
    }

    if (isLoading) {
        return (
            <div className={styles.globalContainer}>
                <div className={styles.mainContainer}>
                    <p className={styles.loadingText}>Завантаження...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.globalContainer}>
            {/*<button onClick={() => navigate('/disfact')}>*/}
            {/*    Перейти на DisfactPage*/}
            {/*</button>*/}
            <main className={styles.mainContainer}>
                <h1 className={styles.pageTitle}>Мої об'єкти</h1>

                <section className={styles.section}>
                    <h2>Додати новий об'єкт</h2>
                    <CreateEmptyObject
                        onCreate={handleCreateObject}
                    />
                </section>

                <section className={styles.section}>
                    <h2>Список об'єктів</h2>

                    {objects.length === 0 ? (
                        <p className={styles.emptyState}>Об'єкти відсутні. Додайте новий.</p>
                    ) : (
                        <div className={styles.objectsGrid}>
                            {objects.map(item => (
                                <ShowObjectItem
                                    key={item.id}
                                    {...item}
                                    onClick={handleObjectClick}
                                    onDelete={handleDeleteObject}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </main>
            
            {/* Notifications */}
            {notifications.map(notification => (
                <Notification
                    key={notification.id}
                    message={notification.message}
                    type={notification.type}
                    onClose={() => removeNotification(notification.id)}
                />
            ))}
        </div>
    );
}

export default MainPage;