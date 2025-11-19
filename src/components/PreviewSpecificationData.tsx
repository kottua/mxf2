import { useState, useEffect } from "react";
import type {RealEstateObjectData} from "../interfaces/RealEstateObjectData.ts";
import styles from './PreviewSpecificationData.module.css';

interface PreviewSpecificationDataProps {
    data: RealEstateObjectData[];
    onDataChange?: (updatedData: RealEstateObjectData[]) => void;
}

function PreviewSpecificationData({ data, onDataChange }: PreviewSpecificationDataProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [localData, setLocalData] = useState<RealEstateObjectData[]>(data);

    // Update local data when prop data changes
    useEffect(() => {
        setLocalData(data);
    }, [data]);

    if (!localData || localData.length === 0) {
        return (
            <section className={styles.section}>
                <p className={styles.emptyState}>Немає даних для відображення</p>
            </section>
        );
    }

    // Additional check for empty objects in the array
    const validData = localData.filter(item => item && typeof item === 'object' && Object.keys(item).length > 0);
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

    // Collect all unique status values from data to display in dropdown
    const getAllStatusOptions = (): string[] => {
        const statusSet = new Set<string>();
        // Always include default options
        statusSet.add('available');
        statusSet.add('sold');
        // Add all statuses from data (normalized)
        validData.forEach(item => {
            if (item.Status && typeof item.Status === 'string' && item.Status.trim() !== '') {
                statusSet.add(item.Status.trim());
            }
        });
        return Array.from(statusSet).sort();
    };
    const statusOptions = getAllStatusOptions();

    // Helper function to normalize status value for comparison
    const normalizeStatus = (status: string | undefined | null): string => {
        if (!status || typeof status !== 'string') return '';
        return status.trim();
    };

    // Get status options for a specific row (includes the row's current status if not in main list)
    const getStatusOptionsForRow = (rowStatus: string | undefined | null): string[] => {
        const normalized = normalizeStatus(rowStatus);
        if (normalized && !statusOptions.includes(normalized)) {
            // If the row's status is not in the main list, add it
            return [...statusOptions, normalized].sort();
        }
        return statusOptions;
    };

    const formatValue = (value: string | unknown, header: string) => {
        if (value === null || value === undefined || value === '') {
            return '-';
        }

        if (header === 'customcontent') {
            return JSON.stringify(value, null, 2);
        }

        return String(value);
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newPerPage = Number(e.target.value);
        setItemsPerPage(newPerPage);
        setCurrentPage(1);
    };

    const handleStatusChange = (rowIndex: number, newStatus: string) => {
        const validData = localData.filter(item => item && typeof item === 'object' && Object.keys(item).length > 0);
        const currentStartIndex = (currentPage - 1) * itemsPerPage;
        const actualIndex = currentStartIndex + rowIndex;
        
        if (actualIndex >= 0 && actualIndex < validData.length) {
            const itemToUpdate = validData[actualIndex];
            const originalIndex = localData.findIndex(item => item === itemToUpdate);
            
            if (originalIndex >= 0) {
                const updatedData = [...localData];
                updatedData[originalIndex] = {
                    ...updatedData[originalIndex],
                    Status: newStatus === '' ? undefined : newStatus
                };
                setLocalData(updatedData);
                if (onDataChange) {
                    onDataChange(updatedData);
                }
            }
        }
    };

    const handleSalesAmountChange = (rowIndex: number, newValue: string) => {
        const validData = localData.filter(item => item && typeof item === 'object' && Object.keys(item).length > 0);
        const currentStartIndex = (currentPage - 1) * itemsPerPage;
        const actualIndex = currentStartIndex + rowIndex;
        
        if (actualIndex < 0 || actualIndex >= validData.length) {
            return;
        }
        
        const itemToUpdate = validData[actualIndex];
        const originalIndex = localData.findIndex(item => item === itemToUpdate);
        
        if (originalIndex < 0) {
            return;
        }
        
        // Allow empty string for clearing the field
        if (newValue === '' || newValue === '-') {
            const updatedData = [...localData];
            updatedData[originalIndex] = {
                ...updatedData[originalIndex],
                'Sales amount': undefined
            };
            setLocalData(updatedData);
            if (onDataChange) {
                onDataChange(updatedData);
            }
            return;
        }
        
        const numValue = parseFloat(newValue);
        // Validate: must be a valid number and >= 0
        if (isNaN(numValue) || numValue < 0) {
            return; // Don't update if invalid
        }
        
        const updatedData = [...localData];
        updatedData[originalIndex] = {
            ...updatedData[originalIndex],
            'Sales amount': numValue
        };
        setLocalData(updatedData);
        if (onDataChange) {
            onDataChange(updatedData);
        }
    };

    return (
        <section className={styles.section}>
            <h3>Попередній перегляд даних ({totalItems} записів)</h3>

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
                                    {header === 'Status' ? (
                                        <select
                                            value={normalizeStatus(row.Status)}
                                            onChange={(e) => handleStatusChange(index, e.target.value)}
                                            className={styles.editableSelect}
                                        >
                                            <option value="">--</option>
                                            {getStatusOptionsForRow(row.Status).map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    ) : header === 'Sales amount' ? (
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={row['Sales amount'] ?? ''}
                                            onChange={(e) => handleSalesAmountChange(index, e.target.value)}
                                            className={styles.editableInput}
                                            placeholder="0.00"
                                        />
                                    ) : header === 'customcontent' && row.customcontent ? (
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
                                    {header === 'Status' ? (
                                        <select
                                            value={normalizeStatus(row.Status)}
                                            onChange={(e) => handleStatusChange(index, e.target.value)}
                                            className={styles.editableSelect}
                                        >
                                            <option value="">--</option>
                                            {getStatusOptionsForRow(row.Status).map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    ) : header === 'Sales amount' ? (
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={row['Sales amount'] ?? ''}
                                            onChange={(e) => handleSalesAmountChange(index, e.target.value)}
                                            className={styles.editableInput}
                                            placeholder="0.00"
                                        />
                                    ) : (
                                        formatValue(header === 'customcontent' ? row.customcontent : row[header], header)
                                    )}
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