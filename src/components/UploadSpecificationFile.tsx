import * as XLSX from 'xlsx';
import PreviewSpecificationData from './PreviewSpecificationData';
import type {RealEstateObjectData} from "../interfaces/RealEstateObjectData.ts";
import type {ChangeEvent} from "react";
import styles from './UploadSpecificationFile.module.css';

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
    const predefinedColumns = [
        'Property type',
        'Premises ID',
        'Number of unit',
        'Number',
        'Entrance',
        'Floor',
        'Layout type',
        'Full price',
        'Total area, m2',
        'Estimated area, m2',
        'Price per meter',
        'Number of rooms',
        'Living area, m2',
        'Kitchen area, m2',
        'View from window',
        'Number of levels',
        'Number of loggias',
        'Number of balconies',
        'Number of bathrooms with toilets',
        'Number of separate bathrooms',
        'Number of terraces',
        'Studio',
        'Status',
        'Sales amount',
    ];

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !file.name.match(/\.(xlsx|xls)$/)) {
            alert('Будь ласка, виберіть файл формату .xlsx або .xls');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = event.target?.result;
                if (!data) throw new Error('Не вдалося прочитати файл');

                // Parse the workbook
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

                // Convert to array of arrays
                const rawData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as unknown[][];

                // Extract headers (first row) and trim whitespace
                const headers = (rawData[0] as string[]).map((header) => header.trim());
                if (!headers || headers.length === 0) throw new Error('У файлі відсутні заголовки');

                // Map data rows to objects and filter out empty rows
                const parsed: RealEstateObjectData[] = rawData
                    .slice(1)
                    .map((row) => {
                        const rowData: RealEstateObjectData = {};
                        const customFields: Record<string, unknown> = {};

                        headers.forEach((header, index) => {
                            const value = row[index] ?? null; // Handle empty cells as null
                            if (predefinedColumns.includes(header)) {
                                rowData[header] = value;
                            } else {
                                customFields[header] = value;
                            }
                        });

                        if (Object.keys(customFields).length > 0) {
                            rowData.custom_fields = customFields;
                        }

                        return rowData;
                    })
                    .filter((row) => {
                        // Consider a row valid if it has a non-null Premises ID or Property type
                        return row['Premises ID'] != null || row['Property type'] != null;
                    });

                setPreviewSpecData(parsed);
                setIsPreview(true);
            } catch (error) {
                console.error('Помилка парсингу файлу:', error);
                alert('Не вдалося обробити Excel-файл');
            }
        };
        reader.readAsArrayBuffer(file);
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
                />
                <label htmlFor="specification_file" className={styles.fileLabel}>
                    Обрати файл Excel
                </label>
                <p className={styles.fileInfo}>
                    Підтримуються файли формату .xlsx та .xls
                </p>
            </div>

            <button
                onClick={() => setIsPreview(!isPreview)}
                className={styles.toggleButton}
            >
                {isPreview ? 'Приховати завантажені дані' : 'Показати завантажені дані'}
            </button>

            {isPreview && <PreviewSpecificationData data={previewSpecData} />}
        </section>
    );
}

export default UploadSpecificationFile;