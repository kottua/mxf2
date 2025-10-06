import * as XLSX from 'xlsx';
import PreviewIncomeData from './PreviewIncomeData';
import type {IncomePlanData} from '../interfaces/IncomePlanData';
import type {ChangeEvent} from 'react';
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
    const predefinedColumns = [
        'Property type',
        'period_begin',
        'period_end',
        'area',
        'planned_sales_revenue',
        'price_per_sqm',
        'price_per_sqm_end',
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

                // Parse the workbook with date parsing enabled
                const workbook = XLSX.read(data, {
                    type: 'array',
                    cellDates: true, // Enable date parsing
                    dateNF: 'dd/mm/yyyy' // Specify the date format to match Excel input
                });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

                // Convert to array of arrays
                const rawData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as unknown[][];

                // Extract headers (first row) and trim whitespace
                const headers = (rawData[0] as string[]).map((header) => header.trim());
                if (!headers || headers.length === 0) throw new Error('У файлі відсутні заголовки');

                // Map data rows to objects and filter out empty rows
                const parsed: IncomePlanData[] = rawData
                    .slice(1)
                    .map((row) => {
                        const rowData: IncomePlanData = {};
                        const customFields: Record<string, unknown> = {};

                        headers.forEach((header, index) => {
                            let value = row[index] ?? null; // Handle empty cells as null

                            // Convert Date objects to string format for period_begin and period_end
                            if ((header === 'period_begin' || header === 'period_end') && value instanceof Date) {
                                value = XLSX.SSF.format('dd/mm/yyyy', value);
                            }

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
                        // Consider a row valid if it has a non-null Property type or period_begin
                        return row['Property type'] != null || row['period_begin'] != null;
                    });

                setPreviewIncomeData(parsed);
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
            <h2>Завантаження плану доходів</h2>

            <div className={styles.uploadArea}>
                <input
                    type="file"
                    accept=".xlsx,.xls"
                    id="income_file"
                    onChange={handleFileChange}
                    className={styles.fileInput}
                />
                <label htmlFor="income_file" className={styles.fileLabel}>
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

            {isPreview && <PreviewIncomeData data={previewIncomeData} />}
        </section>
    );
}

export default UploadIncomeFile;