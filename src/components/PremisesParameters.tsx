import type { Premises } from "../interfaces/Premises.ts";
import { useState } from "react";
import styles from './PremisesParameters.module.css';

interface PremisesParametersProps {
    premises: Premises[];
    selectedColumns: Record<string, boolean>;
    priorities: ColumnPriorities;
    setPriorities: (priorities: ColumnPriorities) => void;
}

interface PriorityItem {
    name: string;
    values: string[];
    priority: number;
}

export interface ColumnPriorities {
    [column: string]: PriorityItem[];
}

function PremisesParameters({ premises, selectedColumns, priorities, setPriorities }: PremisesParametersProps) {
    const [uniqueValues, setUniqueValues] = useState<string[]>([]);
    const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
    const [selectedValues, setSelectedValues] = useState<string[]>([]);
    const [newGroupName, setNewGroupName] = useState("");

    // Отримуємо всі ключі з customcontent
    const customContentKeys = new Set<string>();
    premises.forEach(p => {
        if (p.customcontent && typeof p.customcontent === 'object') {
            Object.keys(p.customcontent).forEach(key => {
                customContentKeys.add(key);
            });
        }
    });

    // ФИКС: Правильно фільтруємо колонки - тільки вибрані користувачем
    const columnNames = [
        ...Object.keys(selectedColumns).filter(key => selectedColumns[key]),
        ...Array.from(customContentKeys).filter(key => selectedColumns[key])
    ].filter((value, index, self) => self.indexOf(value) === index); // Убираем дубликаты

    // Получаем уникальные значения для выбранной колонки
    const getUniqueValues = (column: string) => {
        let allUnique: string[] = [];

        if (customContentKeys.has(column)) {
            // Якщо це ключ з customcontent
            const valuesSet = new Set<string>();

            premises.forEach(p => {
                if (p.customcontent && p.customcontent[column] !== undefined) {
                    const value = p.customcontent[column];
                    if (value !== null && value !== undefined) {
                        valuesSet.add(String(value));
                    }
                }
            });

            allUnique = Array.from(valuesSet);
        } else {
            // Обычная обработка для других колонок
            const valuesSet = new Set(
                premises
                    .map(p => p[column as keyof Premises])
                    .filter((val): val is string | number | boolean => val != null)
                    .map(val => String(val))
            );
            allUnique = Array.from(valuesSet);
        }

        setUniqueValues(allUnique.sort());
        setSelectedColumn(column);
        setSelectedValues([]);
        setNewGroupName("");
    };

    const handleValueToggle = (value: string) => {
        if (selectedValues.includes(value)) {
            setSelectedValues(selectedValues.filter(v => v !== value));
        } else if (selectedValues.length < 3) {
            setSelectedValues([...selectedValues, value]);
        }
    };

    const createGroup = () => {
        if (selectedValues.length === 0 || !newGroupName || !selectedColumn) return;

        const newPriority = priorities[selectedColumn]?.length > 0
            ? Math.max(...priorities[selectedColumn].map(p => p.priority)) + 1
            : 1;

        const newGroup: PriorityItem = {
            name: newGroupName,
            values: selectedValues,
            priority: newPriority,
        };

        // Удаляем отдельные элементы, которые теперь в группе
        const updatedColumnPriorities = (priorities[selectedColumn] || [])
            .filter(item => !selectedValues.some(val => item.values.includes(val)))
            .concat(newGroup)
            .sort((a, b) => a.priority - b.priority);

        const updatedPriorities = {
            ...priorities,
            [selectedColumn]: updatedColumnPriorities,
        };

        setPriorities(updatedPriorities);
        setSelectedValues([]);
        setNewGroupName("");
    };

    const updatePriority = (column: string, name: string, newPriority: number) => {
        if (!priorities[column]) return;

        const currentList = [...priorities[column]];
        const max = currentList.length;
        const clamped = Math.max(1, Math.min(max, newPriority));

        const oldIndex = currentList.findIndex(item => item.name === name);
        if (oldIndex === -1) return;

        const [movedItem] = currentList.splice(oldIndex, 1);
        const newIndex = clamped - 1;
        currentList.splice(newIndex, 0, movedItem);

        // Обновляем приоритеты
        const updatedColumnPriorities = currentList.map((item, index) => ({
            ...item,
            priority: index + 1,
        }));

        const updatedPriorities = {
            ...priorities,
            [column]: updatedColumnPriorities,
        };

        setPriorities(updatedPriorities);
    };

    const deletePriorityItem = (column: string, name: string) => {
        if (!priorities[column]) return;

        const deletedItem = priorities[column].find(item => item.name === name);
        if (!deletedItem) return;

        // Если это группа, возвращаем ее элементы обратно как отдельные
        if (deletedItem.values.length > 1) {
            const individualItems: PriorityItem[] = deletedItem.values.map((value, index) => ({
                name: value,
                values: [value],
                priority: (priorities[column]?.length || 0) + index, // временный приоритет
            }));

            const updatedColumnPriorities = priorities[column]
                .filter(item => item.name !== name)
                .concat(individualItems)
                .sort((a, b) => a.priority - b.priority)
                .map((item, index) => ({
                    ...item,
                    priority: index + 1,
                }));

            const updatedPriorities = {
                ...priorities,
                [column]: updatedColumnPriorities,
            };

            setPriorities(updatedPriorities);
        } else {
            // Если это отдельный элемент, просто удаляем
            const updatedColumnPriorities = priorities[column]
                .filter(item => item.name !== name)
                .map((item, index) => ({
                    ...item,
                    priority: index + 1,
                }));

            const updatedPriorities = {
                ...priorities,
                [column]: updatedColumnPriorities,
            };

            setPriorities(updatedPriorities);
        }
    };

    // Функция для инициализации приоритетов только для выбранных колонок
    const initializePrioritiesForColumn = (column: string) => {
        if (priorities[column]) return; // Уже инициализированы

        let allUnique: string[] = [];

        if (customContentKeys.has(column)) {
            const valuesSet = new Set<string>();
            premises.forEach(p => {
                if (p.customcontent && p.customcontent[column] !== undefined) {
                    const value = p.customcontent[column];
                    if (value !== null && value !== undefined) {
                        valuesSet.add(String(value));
                    }
                }
            });
            allUnique = Array.from(valuesSet);
        } else {
            const valuesSet = new Set(
                premises
                    .map(p => p[column as keyof Premises])
                    .filter((val): val is string | number | boolean => val != null)
                    .map(val => String(val))
            );
            allUnique = Array.from(valuesSet);
        }

        const initPriorities = allUnique.map((value, index) => ({
            name: value,
            values: [value],
            priority: index + 1,
        }));

        const newPriorities = {
            ...priorities,
            [column]: initPriorities,
        };
        setPriorities(newPriorities);
    };

    if (columnNames.length === 0) {
        return (
            <div className={styles.emptyState}>
                Спочатку виберіть динамічні параметри для налаштування
            </div>
        );
    }

    return (
        <section className={styles.section}>
            <h2>Налаштування пріоритетів</h2>

            <details className={styles.details}>
                <summary className={styles.summary}>Збережені значення:</summary>
                <pre className={styles.pre}>{JSON.stringify(priorities, null, 2)}</pre>
            </details>

            <div className={styles.columnsGrid}>
                {columnNames.map((name) => (
                    <div
                        key={name}
                        className={`${styles.columnItem} ${selectedColumn === name ? styles.selected : ''}`}
                        onClick={() => {
                            getUniqueValues(name);
                            initializePrioritiesForColumn(name);
                        }}
                    >
                        {name}
                    </div>
                ))}
            </div>

            {selectedColumn && priorities[selectedColumn] && (
                <>
                    <div className={styles.valuesSection}>
                        <h3>Унікальні значення для {selectedColumn}</h3>
                        <p className={styles.instructions}>
                            Оберіть значення для групування (до 3) або налаштуйте пріоритети нижче
                        </p>

                        {selectedValues.length > 0 && (
                            <div className={styles.selectionInfo}>
                                Вибрано для групи: {selectedValues.length} з 3
                            </div>
                        )}

                        <div className={styles.valuesGrid}>
                            {uniqueValues.map((value, index) => (
                                <div
                                    key={index}
                                    className={`${styles.valueItem} ${selectedValues.includes(value) ? styles.selected : ''}`}
                                    onClick={() => handleValueToggle(value)}
                                >
                                    {value}
                                </div>
                            ))}
                        </div>

                        {selectedValues.length > 0 && (
                            <div className={styles.groupForm}>
                                <div className={styles.formGroup}>
                                    <label>Назва групи</label>
                                    <input
                                        type="text"
                                        value={newGroupName}
                                        onChange={(e) => setNewGroupName(e.target.value)}
                                        placeholder="Введіть назву групи"
                                        className={styles.formInput}
                                    />
                                </div>
                                <button
                                    onClick={() => createGroup()}
                                    disabled={!newGroupName}
                                    className={styles.createButton}
                                >
                                    Створити групу
                                </button>
                            </div>
                        )}
                    </div>

                    {priorities[selectedColumn]?.length > 0 && (
                        <div className={styles.prioritiesSection}>
                            <h3>Пріоритети для {selectedColumn}</h3>
                            <p className={styles.instructions}>
                                Встановіть пріоритети (1 - найвищий)
                            </p>
                            <div className={styles.prioritiesList}>
                                {priorities[selectedColumn].map(({ name, values, priority }) => (
                                    <div key={name} className={styles.priorityItem}>
                                        <div className={styles.priorityHeader}>
                                            <div>
                                                <span className={styles.priorityName}>{name}</span>
                                                {values.length > 1 && (
                                                    <span className={styles.priorityValues}>
                                                        Група: {values.join(", ")}
                                                    </span>
                                                )}
                                            </div>
                                            <div className={styles.priorityControls}>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={priorities[selectedColumn].length}
                                                    value={priority}
                                                    onChange={(e) => updatePriority(selectedColumn, name, Number(e.target.value))}
                                                    className={styles.priorityInput}
                                                />
                                                <button
                                                    onClick={() => deletePriorityItem(selectedColumn, name)}
                                                    className={styles.deleteButton}
                                                >
                                                    Видалити
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </section>
    );
}

export default PremisesParameters;