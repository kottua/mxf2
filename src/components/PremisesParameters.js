import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import styles from './PremisesParameters.module.css';
function PremisesParameters({ premises, selectedColumns, priorities, setPriorities }) {
    const [uniqueValues, setUniqueValues] = useState([]);
    const [selectedColumn, setSelectedColumn] = useState(null);
    const [selectedValues, setSelectedValues] = useState([]);
    const [newGroupName, setNewGroupName] = useState("");
    // Отримуємо всі ключі з customcontent
    const customContentKeys = new Set();
    premises.forEach(p => {
        if (p.customcontent && typeof p.customcontent === 'object') {
            Object.keys(p.customcontent).forEach(key => {
                customContentKeys.add(key);
            });
        }
    });
    // Фільтруємо колонки - прибираємо customcontent і додаємо його ключі
    // Але перевіряємо, щоб не було дублікатів
    const columnNames = [
        ...Object.keys(selectedColumns)
            .filter(key => selectedColumns[key] && key !== 'customcontent'),
        ...Array.from(customContentKeys).filter(key => !selectedColumns[key])
    ];
    // Получаем уникальные значения для выбранной колонки
    const getUniqueValues = (column) => {
        let allUnique = [];
        if (customContentKeys.has(column)) {
            // Якщо це ключ з customcontent
            const valuesSet = new Set();
            premises.forEach(p => {
                if (p.customcontent && p.customcontent[column] !== undefined) {
                    const value = p.customcontent[column];
                    if (value !== null && value !== undefined) {
                        valuesSet.add(String(value));
                    }
                }
            });
            allUnique = Array.from(valuesSet);
        }
        else {
            // Обычная обработка для других колонок
            const valuesSet = new Set(premises
                .map(p => p[column])
                .filter((val) => val != null)
                .map(val => String(val)));
            allUnique = Array.from(valuesSet);
        }
        // Если для этой колонки еще нет приоритетов, создаем начальные
        if (!priorities[column]) {
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
        }
        setUniqueValues(allUnique.sort());
        setSelectedColumn(column);
        setSelectedValues([]);
        setNewGroupName("");
    };
    const handleValueToggle = (value) => {
        if (selectedValues.includes(value)) {
            setSelectedValues(selectedValues.filter(v => v !== value));
        }
        else if (selectedValues.length < 3) {
            setSelectedValues([...selectedValues, value]);
        }
    };
    const createGroup = () => {
        if (selectedValues.length === 0 || !newGroupName || !selectedColumn)
            return;
        const newPriority = priorities[selectedColumn]?.length > 0
            ? Math.max(...priorities[selectedColumn].map(p => p.priority)) + 1
            : 1;
        const newGroup = {
            name: newGroupName,
            values: selectedValues,
            priority: newPriority,
        };
        // Удаляем отдельные элементы, которые теперь в группе
        const updatedColumnPriorities = priorities[selectedColumn]
            .filter(item => !selectedValues.includes(item.name))
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
    const updatePriority = (column, name, newPriority) => {
        if (!priorities[column])
            return;
        const currentList = [...priorities[column]];
        const max = currentList.length;
        const clamped = Math.max(1, Math.min(max, newPriority));
        const oldIndex = currentList.findIndex(item => item.name === name);
        if (oldIndex === -1)
            return;
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
    const deletePriorityItem = (column, name) => {
        if (!priorities[column])
            return;
        const deletedItem = priorities[column].find(item => item.name === name);
        if (!deletedItem)
            return;
        // Если это группа, возвращаем ее элементы обратно как отдельные
        if (deletedItem.values.length > 1) {
            const individualItems = deletedItem.values.map((value, index) => ({
                name: value,
                values: [value],
                priority: priorities[column].length + index, // временный приоритет
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
        }
        else {
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
    if (columnNames.length === 0) {
        return (_jsx("div", { className: styles.emptyState, children: "\u0421\u043F\u043E\u0447\u0430\u0442\u043A\u0443 \u0432\u0438\u0431\u0435\u0440\u0456\u0442\u044C \u0434\u0438\u043D\u0430\u043C\u0456\u0447\u043D\u0456 \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u0438 \u0434\u043B\u044F \u043D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F" }));
    }
    return (_jsxs("section", { className: styles.section, children: [_jsx("h2", { children: "\u041D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F \u043F\u0440\u0456\u043E\u0440\u0438\u0442\u0435\u0442\u0456\u0432 \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u0456\u0432" }), _jsxs("details", { className: styles.details, children: [_jsx("summary", { className: styles.summary, children: "\u0417\u0431\u0435\u0440\u0435\u0436\u0435\u043D\u0456 \u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044F:" }), _jsx("pre", { className: styles.pre, children: JSON.stringify(priorities, null, 2) })] }), _jsx("div", { className: styles.columnsGrid, children: columnNames.map((name) => (_jsx("div", { className: `${styles.columnItem} ${selectedColumn === name ? styles.selected : ''}`, onClick: () => getUniqueValues(name), children: name }, name))) }), selectedColumn && (_jsxs(_Fragment, { children: [_jsxs("div", { className: styles.valuesSection, children: [_jsxs("h3", { children: ["\u0423\u043D\u0456\u043A\u0430\u043B\u044C\u043D\u0456 \u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044F \u0434\u043B\u044F ", selectedColumn] }), _jsx("p", { className: styles.instructions, children: "\u041E\u0431\u0435\u0440\u0456\u0442\u044C \u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044F \u0434\u043B\u044F \u0433\u0440\u0443\u043F\u0443\u0432\u0430\u043D\u043D\u044F (\u0434\u043E 3) \u0430\u0431\u043E \u043D\u0430\u043B\u0430\u0448\u0442\u0443\u0439\u0442\u0435 \u043F\u0440\u0456\u043E\u0440\u0438\u0442\u0435\u0442\u0438 \u043D\u0438\u0436\u0447\u0435" }), selectedValues.length > 0 && (_jsxs("div", { className: styles.selectionInfo, children: ["\u0412\u0438\u0431\u0440\u0430\u043D\u043E \u0434\u043B\u044F \u0433\u0440\u0443\u043F\u0438: ", selectedValues.length, " \u0437 3"] })), _jsx("div", { className: styles.valuesGrid, children: uniqueValues.map((value, index) => (_jsx("div", { className: `${styles.valueItem} ${selectedValues.includes(value) ? styles.selected : ''}`, onClick: () => handleValueToggle(value), children: value }, index))) }), selectedValues.length > 0 && (_jsxs("div", { className: styles.groupForm, children: [_jsxs("div", { className: styles.formGroup, children: [_jsx("label", { children: "\u041D\u0430\u0437\u0432\u0430 \u0433\u0440\u0443\u043F\u0438" }), _jsx("input", { type: "text", value: newGroupName, onChange: (e) => setNewGroupName(e.target.value), placeholder: "\u0412\u0432\u0435\u0434\u0456\u0442\u044C \u043D\u0430\u0437\u0432\u0443 \u0433\u0440\u0443\u043F\u0438", className: styles.formInput })] }), _jsx("button", { onClick: createGroup, disabled: !newGroupName, className: styles.createButton, children: "\u0421\u0442\u0432\u043E\u0440\u0438\u0442\u0438 \u0433\u0440\u0443\u043F\u0443" })] }))] }), priorities[selectedColumn]?.length > 0 && (_jsxs("div", { className: styles.prioritiesSection, children: [_jsxs("h3", { children: ["\u041F\u0440\u0456\u043E\u0440\u0438\u0442\u0435\u0442\u0438 \u0434\u043B\u044F ", selectedColumn] }), _jsx("p", { className: styles.instructions, children: "\u0412\u0441\u0442\u0430\u043D\u043E\u0432\u0456\u0442\u044C \u043F\u0440\u0456\u043E\u0440\u0438\u0442\u0435\u0442\u0438 (1 - \u043D\u0430\u0439\u0432\u0438\u0449\u0438\u0439)" }), _jsx("div", { className: styles.prioritiesList, children: priorities[selectedColumn].map(({ name, values, priority }) => (_jsx("div", { className: styles.priorityItem, children: _jsxs("div", { className: styles.priorityHeader, children: [_jsxs("div", { children: [_jsx("span", { className: styles.priorityName, children: name }), values.length > 1 && (_jsxs("span", { className: styles.priorityValues, children: ["\u0413\u0440\u0443\u043F\u0430: ", values.join(", ")] }))] }), _jsxs("div", { className: styles.priorityControls, children: [_jsx("input", { type: "number", min: "1", max: priorities[selectedColumn].length, value: priority, onChange: (e) => updatePriority(selectedColumn, name, Number(e.target.value)), className: styles.priorityInput }), _jsx("button", { onClick: () => deletePriorityItem(selectedColumn, name), className: styles.deleteButton, children: "\u0412\u0438\u0434\u0430\u043B\u0438\u0442\u0438" })] })] }) }, name))) })] }))] }))] }));
}
export default PremisesParameters;
