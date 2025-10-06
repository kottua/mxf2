import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as XLSX from 'xlsx';
import PreviewSpecificationData from './PreviewSpecificationData';
import styles from './UploadSpecificationFile.module.css';
function UploadSpecificationFile({ isPreview, setIsPreview, previewSpecData, setPreviewSpecData, }) {
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
                // Parse the workbook
                const workbook = XLSX.read(data, { type: 'array' });
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
                        const value = row[index] ?? null; // Handle empty cells as null
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
                    // Consider a row valid if it has a non-null Premises ID or Property type
                    return row['Premises ID'] != null || row['Property type'] != null;
                });
                console.log('Parsed data:', parsed); // For debugging
                setPreviewSpecData(parsed);
                setIsPreview(true);
            }
            catch (error) {
                console.error('Помилка парсингу файлу:', error);
                alert('Не вдалося обробити Excel-файл');
            }
        };
        reader.readAsArrayBuffer(file);
    };
    return (_jsxs("section", { className: styles.section, children: [_jsx("h2", { children: "\u0417\u0430\u0432\u0430\u043D\u0442\u0430\u0436\u0435\u043D\u043D\u044F \u0441\u043F\u0435\u0446\u0438\u0444\u0456\u043A\u0430\u0446\u0456\u0457" }), _jsxs("div", { className: styles.uploadArea, children: [_jsx("input", { type: "file", accept: ".xlsx,.xls", id: "specification_file", onChange: handleFileChange, className: styles.fileInput }), _jsx("label", { htmlFor: "specification_file", className: styles.fileLabel, children: "\u041E\u0431\u0440\u0430\u0442\u0438 \u0444\u0430\u0439\u043B Excel" }), _jsx("p", { className: styles.fileInfo, children: "\u041F\u0456\u0434\u0442\u0440\u0438\u043C\u0443\u044E\u0442\u044C\u0441\u044F \u0444\u0430\u0439\u043B\u0438 \u0444\u043E\u0440\u043C\u0430\u0442\u0443 .xlsx \u0442\u0430 .xls" })] }), _jsx("button", { onClick: () => setIsPreview(!isPreview), className: styles.toggleButton, children: isPreview ? 'Приховати завантажені дані' : 'Показати завантажені дані' }), isPreview && _jsx(PreviewSpecificationData, { data: previewSpecData })] }));
}
export default UploadSpecificationFile;
