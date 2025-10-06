import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import styles from './PreviewSpecificationData.module.css';
function PreviewSpecificationData({ data }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    if (!data || data.length === 0) {
        return (_jsx("section", { className: styles.section, children: _jsx("p", { className: styles.emptyState, children: "\u041D\u0435\u043C\u0430\u0454 \u0434\u0430\u043D\u0438\u0445 \u0434\u043B\u044F \u0432\u0456\u0434\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u043D\u044F" }) }));
    }
    // Get headers from the first row
    const headers = Object.keys(data[0]).filter((key) => key !== 'custom_fields' || (data[0].custom_fields && Object.keys(data[0].custom_fields).length > 0));
    // Calculate pagination
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = data.slice(startIndex, startIndex + itemsPerPage);
    const formatValue = (value, header) => {
        if (value === null || value === undefined || value === '') {
            return '-';
        }
        if (header === 'custom_fields') {
            return JSON.stringify(value, null, 2);
        }
        return String(value);
    };
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };
    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };
    return (_jsxs("section", { className: styles.section, children: [_jsxs("h3", { children: ["\u041F\u043E\u043F\u0435\u0440\u0435\u0434\u043D\u0456\u0439 \u043F\u0435\u0440\u0435\u0433\u043B\u044F\u0434 \u0434\u0430\u043D\u0438\u0445 (", data.length, " \u0437\u0430\u043F\u0438\u0441\u0456\u0432)"] }), _jsx("div", { className: styles.tableContainer, children: _jsxs("table", { className: styles.table, children: [_jsx("thead", { children: _jsx("tr", { children: headers.map((header) => (_jsx("th", { children: header === 'custom_fields' ? 'Додаткові поля' : header }, header))) }) }), _jsx("tbody", { children: currentItems.map((row, index) => (_jsx("tr", { children: headers.map((header) => (_jsx("td", { children: header === 'custom_fields' && row.custom_fields ? (_jsx("pre", { className: styles.customField, children: formatValue(row.custom_fields, header) })) : (formatValue(row[header], header)) }, header))) }, startIndex + index))) })] }) }), _jsx("div", { className: styles.cardsContainer, children: currentItems.map((row, index) => (_jsx("div", { className: styles.card, children: headers.map((header) => (_jsxs("div", { className: styles.cardRow, children: [_jsx("span", { className: styles.cardLabel, children: header === 'custom_fields' ? 'Додаткові поля' : header }), _jsx("span", { className: styles.cardValue, children: formatValue(header === 'custom_fields' ? row.custom_fields : row[header], header) })] }, header))) }, startIndex + index))) }), _jsxs("div", { className: styles.pagination, children: [_jsxs("div", { className: styles.paginationInfo, children: ["\u041F\u043E\u043A\u0430\u0437\u0430\u043D\u043E ", startIndex + 1, "-", Math.min(startIndex + itemsPerPage, data.length), " \u0437 ", data.length, " \u0437\u0430\u043F\u0438\u0441\u0456\u0432"] }), _jsxs("div", { className: styles.paginationButtons, children: [_jsx("button", { className: styles.paginationButton, onClick: () => handlePageChange(1), disabled: currentPage === 1, children: "\u041D\u0430 \u043F\u043E\u0447\u0430\u0442\u043E\u043A" }), _jsx("button", { className: styles.paginationButton, onClick: () => handlePageChange(currentPage - 1), disabled: currentPage === 1, children: "\u041D\u0430\u0437\u0430\u0434" }), _jsxs("span", { style: { padding: '0.5rem', color: '#64748b' }, children: ["\u0421\u0442\u043E\u0440. ", currentPage, " \u0437 ", totalPages] }), _jsx("button", { className: styles.paginationButton, onClick: () => handlePageChange(currentPage + 1), disabled: currentPage === totalPages, children: "\u0412\u043F\u0435\u0440\u0435\u0434" }), _jsx("button", { className: styles.paginationButton, onClick: () => handlePageChange(totalPages), disabled: currentPage === totalPages, children: "\u0412 \u043A\u0456\u043D\u0435\u0446\u044C" })] }), _jsxs("select", { value: itemsPerPage, onChange: handleItemsPerPageChange, className: styles.pageSizeSelect, children: [_jsx("option", { value: 5, children: "5 \u0437\u0430\u043F\u0438\u0441\u0456\u0432" }), _jsx("option", { value: 10, children: "10 \u0437\u0430\u043F\u0438\u0441\u0456\u0432" }), _jsx("option", { value: 20, children: "20 \u0437\u0430\u043F\u0438\u0441\u0456\u0432" }), _jsx("option", { value: 50, children: "50 \u0437\u0430\u043F\u0438\u0441\u0456\u0432" }), _jsx("option", { value: 100, children: "100 \u0437\u0430\u043F\u0438\u0441\u0456\u0432" })] })] })] }));
}
export default PreviewSpecificationData;
