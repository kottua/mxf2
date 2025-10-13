import { useState } from "react";
import type {IncomePlanData} from "../interfaces/IncomePlanData.ts";
import styles from './PreviewIncomeData.module.css';

interface PreviewIncomeDataProps {
    data: IncomePlanData[];
}

function PreviewIncomeData({ data }: PreviewIncomeDataProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    if (!data || data.length === 0) {
        return (
            <section className={styles.section}>
                <p className={styles.emptyState}>Немає даних для відображення</p>
            </section>
        );
    }

    // Additional check for empty objects in the array
    const validData = data.filter(item => item && typeof item === 'object' && Object.keys(item).length > 0);
    if (validData.length === 0) {
        return (
            <section className={styles.section}>
                <p className={styles.emptyState}>Немає валідних даних для відображення</p>
            </section>
        );
    }

    // Get headers from the first valid row
    const firstItem = validData[0];

    const headers = Object.keys(firstItem).filter(
        (key) => key !== 'customcontent' || (firstItem.customcontent && Object.keys(firstItem.customcontent).length > 0)
    );
    

    // Calculate pagination for local data
    const totalItems = validData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = validData.slice(startIndex, startIndex + itemsPerPage);

    const formatValue = (value: any, header: string) => {
        if (value === null || value === undefined || value === '') {
            return '-';
        }

        if (header === 'customcontent') {
            return JSON.stringify(value, null, 2);
        }

        // Special formatting for date fields
        if (header === 'period_begin' || header === 'period_end') {
            return (
                <span className={styles.dateCell}>
                    {String(value)}
                </span>
            );
        }

        // Format numeric values
        if (typeof value === 'number') {
            return new Intl.NumberFormat('uk-UA').format(value);
        }

        return String(value);
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    return (
        <section className={styles.section}>
            <h3>Попередній перегляд даних доходів ({totalItems} записів)</h3>

            {/* Desktop table */}
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                    <tr>
                        {headers.map((header) => (
                            <th key={header}>
                                {header === 'customcontent' ? 'Додаткові поля' : header}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {currentItems.map((row, index) => (
                        <tr key={`row-${index}`}>
                            {headers.map((header) => (
                                <td key={`${index}-${header}`}>
                                    {header === 'customcontent' && row.customcontent ? (
                                        <pre className={styles.customField}>
                                            {formatValue(row.customcontent, header)}
                                        </pre>
                                    ) : (
                                        formatValue(row[header], header)
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile cards */}
            <div className={styles.cardsContainer}>
                {currentItems.map((row, index) => (
                    <div key={`card-${index}`} className={styles.card}>
                        {headers.map((header) => (
                            <div key={`${index}-${header}`} className={styles.cardRow}>
                                <span className={styles.cardLabel}>
                                    {header === 'customcontent' ? 'Додаткові поля' : header}
                                </span>
                                <span className={styles.cardValue}>
                                    {header === 'customcontent' && row.customcontent ?
                                        `${Object.keys(row.customcontent).length} полів` :
                                        formatValue(row[header], header)}
                                </span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className={styles.pagination}>
                <div className={styles.paginationInfo}>
                    Показано {startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalItems)} з {totalItems} записів
                </div>

                <div className={styles.paginationButtons}>
                    <button
                        className={styles.paginationButton}
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                    >
                        Початок
                    </button>
                    <button
                        className={styles.paginationButton}
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Назад
                    </button>

                    <span style={{ padding: '0.5rem', color: '#64748b' }}>
                        Стор. {currentPage} з {totalPages}
                    </span>

                    <button
                        className={styles.paginationButton}
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Вперед
                    </button>
                    <button
                        className={styles.paginationButton}
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                    >
                        В кінець
                    </button>
                </div>

                <select
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className={styles.pageSizeSelect}
                >
                    <option value={5}>5 записів</option>
                    <option value={10}>10 записів</option>
                    <option value={20}>20 записів</option>
                    <option value={50}>50 записів</option>
                    <option value={100}>100 записів</option>
                </select>
            </div>
        </section>
    );
}

export default PreviewIncomeData;