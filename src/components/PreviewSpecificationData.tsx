import { useState } from "react";
import type {RealEstateObjectData} from "../interfaces/RealEstateObjectData.ts";
import styles from './PreviewSpecificationData.module.css';

interface PreviewSpecificationDataProps {
    data: RealEstateObjectData[];
}

function PreviewSpecificationData({ data }: PreviewSpecificationDataProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    if (!data || data.length === 0) {
        return (
            <section className={styles.section}>
                <p className={styles.emptyState}>Немає даних для відображення</p>
            </section>
        );
    }

    // Get headers from the first row
    const headers = Object.keys(data[0]).filter(
        (key) => key !== 'custom_fields' || (data[0].custom_fields && Object.keys(data[0].custom_fields).length > 0)
    );

    // Calculate pagination
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = data.slice(startIndex, startIndex + itemsPerPage);

    const formatValue = (value: string | unknown, header: string) => {
        if (value === null || value === undefined || value === '') {
            return '-';
        }

        if (header === 'custom_fields') {
            return JSON.stringify(value, null, 2);
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
            <h3>Попередній перегляд даних ({data.length} записів)</h3>

            {/* Desktop table */}
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                    <tr>
                        {headers.map((header) => (
                            <th key={header}>
                                {header === 'custom_fields' ? 'Додаткові поля' : header}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {currentItems.map((row, index) => (
                        <tr key={startIndex + index}>
                            {headers.map((header) => (
                                <td key={header}>
                                    {header === 'custom_fields' && row.custom_fields ? (
                                        <pre className={styles.customField}>
                                            {formatValue(row.custom_fields, header)}
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
                    <div key={startIndex + index} className={styles.card}>
                        {headers.map((header) => (
                            <div key={header} className={styles.cardRow}>
                                <span className={styles.cardLabel}>
                                    {header === 'custom_fields' ? 'Додаткові поля' : header}
                                </span>
                                <span className={styles.cardValue}>
                                    {formatValue(header === 'custom_fields' ? row.custom_fields : row[header], header)}
                                </span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className={styles.pagination}>
                <div className={styles.paginationInfo}>
                    Показано {startIndex + 1}-{Math.min(startIndex + itemsPerPage, data.length)} з {data.length} записів
                </div>

                <div className={styles.paginationButtons}>
                    <button
                        className={styles.paginationButton}
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                    >
                        На початок
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

export default PreviewSpecificationData;