import { useState } from "react";
import { changeRealEstateObject } from "../api/RealEstateObjectApi.ts";
import { useNotification } from "../hooks/useNotification.ts";
import styles from './BuildingInfo.module.css';

interface BuildingInfoProps {
    id: number;
    name?: string;
    lat?: number;
    lon?: number;
    curr?: string;
    url?: string;
    is_deleted?: boolean;
    custom_fields?: Record<string, any>;
    onUpdate?: () => void;
}

function BuildingInfo({ 
    id, 
    name, 
    lat, 
    lon, 
    curr, 
    url, 
    is_deleted, 
    custom_fields, 
    onUpdate 
}: BuildingInfoProps) {
    const [isEditMode, setIsEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { showError, showSuccess } = useNotification();

    const handleEdit = () => {
        setIsEditMode(true);
    };

    const handleCancel = () => {
        setIsEditMode(false);
    };

    const handleSave = async (formData: any) => {
        setIsLoading(true);
        try {
            await changeRealEstateObject(
                id, 
                formData.name, 
                formData.lat, 
                formData.lon, 
                formData.is_deleted || false, 
                formData.curr, 
                formData.url, 
                formData.custom_fields || {}
            );
            showSuccess('Будинок успішно оновлено');
            setIsEditMode(false);
            onUpdate?.();
        } catch (error: any) {
            console.error("Error updating real estate object:", error);
            
            if (error?.response?.data?.message === "Real Estate with this name already exists") {
                showError('Будинок з такою назвою вже існує. Будь ласка, виберіть іншу назву.');
            } else {
                showError('Не вдалося оновити будинок. Спробуйте ще раз пізніше.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isEditMode) {
        return (
            <EditBuildingForm
                id={id}
                name={name}
                lat={lat}
                lon={lon}
                curr={curr}
                url={url}
                is_deleted={is_deleted}
                custom_fields={custom_fields}
                onSave={handleSave}
                onCancel={handleCancel}
                isLoading={isLoading}
            />
        );
    }

    return (
        <div className={styles.buildingCard}>
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <h2 className={styles.buildingName}>{name || 'Без назви'}</h2>
                    <div className={styles.buildingId}>ID: {id}</div>
                </div>
                <button 
                    onClick={handleEdit}
                    className={styles.editButton}
                >
                    Редагувати
                </button>
            </div>

            <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                    <div className={styles.infoLabel}>Координати</div>
                    <div className={styles.infoValue}>
                        {lat !== undefined && lon !== undefined 
                            ? `${lat.toFixed(6)}, ${lon.toFixed(6)}`
                            : 'Не вказано'
                        }
                    </div>
                </div>

                <div className={styles.infoItem}>
                    <div className={styles.infoLabel}>Валюта</div>
                    <div className={styles.infoValue}>
                        {curr || 'Не вказано'}
                    </div>
                </div>

                <div className={styles.infoItem}>
                    <div className={styles.infoLabel}>URL</div>
                    <div className={styles.infoValue}>
                        {url ? (
                            <a 
                                href={url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={styles.urlLink}
                            >
                                {url.length > 50 ? `${url.substring(0, 50)}...` : url}
                            </a>
                        ) : 'Не вказано'}
                    </div>
                </div>

                <div className={styles.infoItem}>
                    <div className={styles.infoLabel}>Статус</div>
                    <div className={styles.infoValue}>
                        <span className={`${styles.status} ${is_deleted ? styles.deleted : styles.active}`}>
                            {is_deleted ? 'Видалено' : 'Активний'}
                        </span>
                    </div>
                </div>

                {custom_fields && Object.keys(custom_fields).length > 0 && (
                    <div className={styles.infoItem}>
                        <div className={styles.infoLabel}>Додаткові поля</div>
                        <div className={styles.infoValue}>
                            <div className={styles.customFields}>
                                {Object.entries(custom_fields).map(([key, value]) => (
                                    <div key={key} className={styles.customField}>
                                        <span className={styles.customKey}>{key}:</span>
                                        <span className={styles.customValue}>{String(value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

interface EditBuildingFormProps {
    id: number;
    name?: string;
    lat?: number;
    lon?: number;
    curr?: string;
    url?: string;
    is_deleted?: boolean;
    custom_fields?: Record<string, any>;
    onSave: (data: any) => void;
    onCancel: () => void;
    isLoading: boolean;
}

function EditBuildingForm({
    id,
    name,
    lat,
    lon,
    curr,
    url,
    is_deleted,
    custom_fields,
    onSave,
    onCancel,
    isLoading
}: EditBuildingFormProps) {
    const [formData, setFormData] = useState({
        name: name || '',
        lat: lat?.toString() || '',
        lon: lon?.toString() || '',
        curr: curr || '',
        url: url || '',
        is_deleted: is_deleted || false,
        custom_fields: custom_fields || {}
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...formData,
            lat: parseFloat(formData.lat) || 0,
            lon: parseFloat(formData.lon) || 0,
        };
        onSave(payload);
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className={styles.editCard}>
            <div className={styles.editHeader}>
                <h3>Редагування будинку</h3>
                <button 
                    onClick={onCancel}
                    className={styles.cancelButton}
                >
                    Відмінити
                </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.editForm}>
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label htmlFor="name">Назва будинку</label>
                        <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            required
                            placeholder="Введіть назву будинку"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="curr">Валюта</label>
                        <input
                            type="text"
                            id="curr"
                            value={formData.curr}
                            onChange={(e) => handleInputChange('curr', e.target.value)}
                            placeholder="UAH"
                        />
                    </div>
                </div>

                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label htmlFor="lat">Широта</label>
                        <input
                            type="number"
                            id="lat"
                            value={formData.lat}
                            onChange={(e) => handleInputChange('lat', e.target.value)}
                            step="any"
                            placeholder="50.450001"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="lon">Довгота</label>
                        <input
                            type="number"
                            id="lon"
                            value={formData.lon}
                            onChange={(e) => handleInputChange('lon', e.target.value)}
                            step="any"
                            placeholder="30.523333"
                        />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="url">URL</label>
                    <input
                        type="url"
                        id="url"
                        value={formData.url}
                        onChange={(e) => handleInputChange('url', e.target.value)}
                        placeholder="https://example.com"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={formData.is_deleted}
                            onChange={(e) => handleInputChange('is_deleted', e.target.checked)}
                        />
                        <span className={styles.checkboxText}>Позначити як видалений</span>
                    </label>
                </div>

                <div className={styles.formActions}>
                    <button
                        type="submit"
                        className={styles.saveButton}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Збереження...' : 'Зберегти зміни'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default BuildingInfo;
