import { useState } from "react";
import PreviewIncomeData from './PreviewIncomeData';
import type {IncomePlanData} from '../interfaces/IncomePlanData';
import type {ChangeEvent} from 'react';
import {uploadIncomePlansFile} from '../api/IncomePlanApi';
import styles from './UploadIncomeFile.module.css';

interface UploadIncomeFileProps {
    isPreview: boolean;
    setIsPreview: (value: boolean) => void;
    previewIncomeData: IncomePlanData[];
    setPreviewIncomeData: (data: IncomePlanData[]) => void;
}

function UploadIncomeFile({
                              isPreview,
                              setIsPreview,
                              previewIncomeData,
                              setPreviewIncomeData,
                          }: UploadIncomeFileProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !file.name.match(/\.(xlsx|xls)$/)) {
            alert('Будь ласка, виберіть файл формату .xlsx або .xls');
            return;
        }

        setIsLoading(true);
        try {
            const data = await uploadIncomePlansFile(file);

            if (!data || !Array.isArray(data)) {
                throw new Error('Invalid response format from API');
            }
            
            setPreviewIncomeData(data);
            setIsPreview(true);
        } catch (error) {
            console.error('Помилка завантаження файлу плану доходів:', error);
            console.error('Error details:', error);
            alert(`Не вдалося завантажити та обробити Excel-файл плану доходів: ${error.message || 'Невідома помилка'}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className={styles.section}>
            <h2>Завантаження плану доходів</h2>

            <div className={styles.uploadArea}>
                <input
                    type="file"
                    accept=".xlsx,.xls"
                    id="income_file"
                    onChange={handleFileChange}
                    className={styles.fileInput}
                    disabled={isLoading}
                />
                <label htmlFor="income_file" className={styles.fileLabel}>
                    {isLoading ? 'Завантаження...' : 'Обрати файл Excel'}
                </label>
                <p className={styles.fileInfo}>
                    Підтримуються файли формату .xlsx та .xls
                </p>
            </div>

            <button
                onClick={() => setIsPreview(!isPreview)}
                className={styles.toggleButton}
                disabled={!previewIncomeData || previewIncomeData.length === 0}
            >
                {isPreview ? 'Приховати завантажені дані' : 'Показати завантажені дані'}
            </button>

            {isPreview && previewIncomeData && previewIncomeData.length > 0 && <PreviewIncomeData data={previewIncomeData} />}
        </section>
    );
}

export default UploadIncomeFile;