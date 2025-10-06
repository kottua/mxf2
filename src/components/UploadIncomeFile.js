import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as XLSX from 'xlsx';
import PreviewIncomeData from './PreviewIncomeData';
import styles from './UploadIncomeFile.module.css';
function UploadIncomeFile({ isPreview, setIsPreview, previewIncomeData, setPreviewIncomeData, }) {
    const predefinedColumns = [
        'Property type',
        'period_begin',
        'period_end',
        'area',
        'planned_sales_revenue',
        'price_per_sqm',
        'price_per_sqm_end',
    ];
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file || !file.name.match(/\.(xlsx|xls)$/)) {
            alert('Будь ласка, виберіть файл формату .xlsx або .xls');
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = event.target?.result;
                if (!data)
                    throw new Error('Не вдалося прочитати файл');
                // Parse the workbook with date parsing enabled
                const workbook = XLSX.read(data, {
                    type: 'array',
                    cellDates: true, // Enable date parsing
                    dateNF: 'dd/mm/yyyy' // Specify the date format to match Excel input
                });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                // Convert to array of arrays
                const rawData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
                // Extract headers (first row) and trim whitespace
                const headers = rawData[0].map((header) => header.trim());
                if (!headers || headers.length === 0)
                    throw new Error('У файлі відсутні заголовки');
                // Map data rows to objects and filter out empty rows
                const parsed = rawData
                    .slice(1)
                    .map((row) => {
                    const rowData = {};
                    const customFields = {};
                    headers.forEach((header, index) => {
                        let value = row[index] ?? null; // Handle empty cells as null
                        // Convert Date objects to string format for period_begin and period_end
                        if ((header === 'period_begin' || header === 'period_end') && value instanceof Date) {
                            value = XLSX.SSF.format('dd/mm/yyyy', value);
                        }
                        if (predefinedColumns.includes(header)) {
                            rowData[header] = value;
                        }
                        else {
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
                console.log('Parsed data:', parsed); // For debugging
                setPreviewIncomeData(parsed);
                setIsPreview(true);
            }
            catch (error) {
                console.error('Помилка парсингу файлу:', error);
                alert('Не вдалося обробити Excel-файл');
            }
        };
        reader.readAsArrayBuffer(file);
    };
    return (_jsxs("section", { className: styles.section, children: [_jsx("h2", { children: "\u0417\u0430\u0432\u0430\u043D\u0442\u0430\u0436\u0435\u043D\u043D\u044F \u043F\u043B\u0430\u043D\u0443 \u0434\u043E\u0445\u043E\u0434\u0456\u0432" }), _jsxs("div", { className: styles.uploadArea, children: [_jsx("input", { type: "file", accept: ".xlsx,.xls", id: "income_file", onChange: handleFileChange, className: styles.fileInput }), _jsx("label", { htmlFor: "income_file", className: styles.fileLabel, children: "\u041E\u0431\u0440\u0430\u0442\u0438 \u0444\u0430\u0439\u043B Excel" }), _jsx("p", { className: styles.fileInfo, children: "\u041F\u0456\u0434\u0442\u0440\u0438\u043C\u0443\u044E\u0442\u044C\u0441\u044F \u0444\u0430\u0439\u043B\u0438 \u0444\u043E\u0440\u043C\u0430\u0442\u0443 .xlsx \u0442\u0430 .xls" })] }), _jsx("button", { onClick: () => setIsPreview(!isPreview), className: styles.toggleButton, children: isPreview ? 'Приховати завантажені дані' : 'Показати завантажені дані' }), isPreview && _jsx(PreviewIncomeData, { data: previewIncomeData })] }));
}
export default UploadIncomeFile;
