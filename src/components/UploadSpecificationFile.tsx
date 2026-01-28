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
    reoId: number;
    onError?: (message: string) => void;
}

function UploadSpecificationFile({
                                     isPreview,
                                     setIsPreview,
                                     previewSpecData,
                                     setPreviewSpecData,
                                     reoId,
                                     onError,
                                 }: UploadSpecificationFileProps) {
    const { showError: localShowError, showSuccess } = useNotification();
    const showError = onError || localShowError;
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !file.name.match(/\.(xlsx|xls)$/)) {
            showError('Будь ласка, виберіть файл формату .xlsx або .xls');
            return;
        }

        setIsLoading(true);
        try {
            const data = await uploadSpecificationFile(file, reoId);

            if (!data || !Array.isArray(data)) {
                throw new Error('Invalid response format from API');
            }
            
            setPreviewSpecData(data);
            setIsPreview(true);
        } catch (error: any) {
            // Проверяем, является ли это ошибкой IncomePlanRequiredException (422)
            if (error?.response?.status === 422) {
                const errorMessage = error?.response?.data?.message || '';
                
                // Проверяем, содержит ли сообщение текст об отсутствии активных планов доходов
                if (errorMessage.includes('No active income plans found') || 
                    errorMessage.includes('income plans') ||
                    errorMessage.toLowerCase().includes('income plan')) {
                    showError('Не знайдено активних планів доходів для вказаного об\'єкта нерухомості. Будь ласка, спочатку завантажте плани доходів.');
                } else {
                    showError(errorMessage || 'Помилка валідації даних');
                }
            } else {
                const errorMsg = error?.response?.data?.message || error?.message || 'Невідома помилка';
                showError(`Не вдалося завантажити та обробити Excel-файл: ${errorMsg}`);
            }
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

            {isPreview && previewSpecData && previewSpecData.length > 0 && (
                <PreviewSpecificationData 
                    data={previewSpecData} 
                    onDataChange={setPreviewSpecData}
                />
            )}
        </section>
    );
}

export default UploadSpecificationFile;