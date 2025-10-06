import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from './ShowObjectItem.module.css';
function ShowObjectItem({ id, name, created, onClick, onDelete }) {
    const formattedDate = new Date(created).toLocaleString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
    function handleClick() {
        onClick(id);
    }
    function handleDelete(e) {
        e.stopPropagation();
        onDelete(id);
    }
    return (_jsxs("section", { className: styles.objectCard, onClick: handleClick, children: [_jsxs("dl", { className: styles.dl, children: [_jsx("dt", { className: styles.dt, children: "\u041D\u0430\u0437\u0432\u0430" }), _jsx("dd", { className: `${styles.dd} ${styles.name}`, children: name }), _jsx("dt", { className: styles.dt, children: "\u0421\u0442\u0432\u043E\u0440\u0435\u043D\u043E" }), _jsx("dd", { className: `${styles.dd} ${styles.date}`, children: formattedDate })] }), _jsx("button", { className: styles.deleteButton, onClick: handleDelete, children: "\u0412\u0438\u0434\u0430\u043B\u0438\u0442\u0438" })] }));
}
export default ShowObjectItem;
