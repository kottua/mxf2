import { useState } from "react";
import PreviewSpecificationData from './PreviewSpecificationData';
import type {RealEstateObjectData} from "../interfaces/RealEstateObjectData.ts";
import type {ChangeEvent} from "react";
import {uploadSpecificationFile} from "../api/PremisesApi.ts";
import styles from './UploadSpecificationFile.module.css';
import {useNotification} from "../hooks/useNotification.ts";

interface UploadSpecificationFileProps {
    isPreview: boolean;
    setIsPreview: (value: boolean) => void;
    previewSpecData: RealEstateObjectData[];
    setPreviewSpecData: (data: RealEstateObjectData[]) => void;
}

function UploadSpecificationFile({
                                     isPreview,
                                     setIsPreview,
                                     previewSpecData,
                                     setPreviewSpecData,
                                 }: UploadSpecificationFileProps) {
    const { showError, showSuccess } = useNotification();
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !file.name.match(/\.(xlsx|xls)$/)) {
            showError('Будь ласка, виберіть файл формату .xlsx або .xls');
            return;
        }

        setIsLoading(true);
        try {
            const data = await uploadSpecificationFile(file);

            if (!data || !Array.isArray(data)) {
                throw new Error('Invalid response format from API');
            }
            
            setPreviewSpecData(data);
            setIsPreview(true);
        } catch (error) {
            console.error('Помилка завантаження файлу:', error);
            showError(`Не вдалося завантажити та обробити Excel-файл: ${error.message || 'Невідома помилка'}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className={styles.section}>
            <h2>Завантаження специфікації</h2>

            <div className={styles.uploadArea}>
                <input
                    type="file"
                    accept=".xlsx,.xls"
                    id="specification_file"
                    onChange={handleFileChange}
                    className={styles.fileInput}
                    disabled={isLoading}
                />
                <label htmlFor="specification_file" className={styles.fileLabel}>
                    {isLoading ? 'Завантаження...' : 'Обрати файл Excel'}
                </label>
                <p className={styles.fileInfo}>
                    Підтримуються файли формату .xlsx та .xls
                </p>
            </div>

            <button
                onClick={() => setIsPreview(!isPreview)}
                className={styles.toggleButton}
                disabled={!previewSpecData || previewSpecData.length === 0}
            >
                {isPreview ? 'Приховати завантажені дані' : 'Показати завантажені дані'}
            </button>

            {isPreview && previewSpecData && previewSpecData.length > 0 && <PreviewSpecificationData data={previewSpecData} />}
        </section>
    );
}

export default UploadSpecificationFile;