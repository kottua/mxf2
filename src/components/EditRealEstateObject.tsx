import {type FormEvent, useState} from "react";
import {changeRealEstateObject} from "../api/RealEstateObjectApi.ts";
import styles from './EditRealEstateObject.module.css';

interface EditRealEstateObjectProps {
    id: number;
    name?: string;
    lat?: number;
    lon?: number;
    curr?: string;
    url?: string;
    setIsEditMode: (value: boolean) => void;
}


function EditRealEstateObject({ id, name, lat, lon, curr, url, setIsEditMode }: EditRealEstateObjectProps) {
    const [formName, setFormName] = useState(name || '');
    const [formLat, setFormLat] = useState(lat ?? '');
    const [formLon, setFormLon] = useState(lon ?? '');
    const [formCurr, setFormCurr] = useState(curr || '');
    const [formUrl, setFormUrl] = useState(url || '');
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        const payload = {
            name: formName,
            lat: parseFloat(formLat as string),
            lon: parseFloat(formLon as string),
            curr: formCurr,
            url: formUrl,
        };
        try {
            await changeRealEstateObject(id, payload.name, payload.lat, payload.lon, false, payload.curr, payload.url, {});
            alert('Об\'єкт успішно оновлено');
            setIsEditMode(false);
        } catch (error) {
            console.error("Error updating real estate object:", error);
        } finally {
            setIsLoading(false);
        }
    }

    if (isLoading) {
        return <p>Обновляю...</p>;
    }

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <h2>Редагування об'єкта</h2>
                <p className={styles.instruction}>Для редагування внесіть необхідні значення і натисніть "зберегти"</p>
            </div>

            <button
                onClick={() => setIsEditMode(false)}
                className={styles.cancelButton}
            >
                Відмінити
            </button>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="name">Назва об'єкта</label>
                    <input
                        type="text"
                        value={formName}
                        id="name"
                        onChange={(e) => setFormName(e.target.value)}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="lat">Широта</label>
                    <input
                        type="number"
                        value={formLat}
                        id="lat"
                        step="any"
                        onChange={(e) => setFormLat(e.target.value)}
                        placeholder="50.450001"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="lon">Довгота</label>
                    <input
                        type="number"
                        value={formLon}
                        id="lon"
                        step="any"
                        onChange={(e) => setFormLon(e.target.value)}
                        placeholder="30.523333"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="curr">Валюта</label>
                    <input
                        type="text"
                        value={formCurr}
                        id="curr"
                        onChange={(e) => setFormCurr(e.target.value)}
                        placeholder="UAH"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="url">URL</label>
                    <input
                        type="url"
                        value={formUrl}
                        id="url"
                        onChange={(e) => setFormUrl(e.target.value)}
                        placeholder="https://example.com"
                    />
                </div>

                <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isLoading}
                >
                    {isLoading ? 'Збереження...' : 'Зберегти зміни'}
                </button>
            </form>
        </section>
    );
}

export default EditRealEstateObject;