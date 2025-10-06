import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import styles from './CreateEmptyObject.module.css';
function CreateEmptyObject({ onCreate }) {
    const [name, setName] = useState("Новий об'єкт");
    function handleSubmit(e) {
        e.preventDefault();
        onCreate(name);
    }
    return (_jsxs("form", { onSubmit: handleSubmit, className: styles.form, children: [_jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "name", className: styles.label, children: "\u0412\u0432\u0435\u0434\u0456\u0442\u044C \u0456\u043C'\u044F" }), _jsx("input", { type: "text", id: "name", name: "name", placeholder: "\u041D\u043E\u0432\u0438\u0439 \u043E\u0431'\u0454\u043A\u0442", onChange: (e) => setName(e.target.value), className: styles.input })] }), _jsx("button", { type: "submit", className: styles.button, children: "\u0421\u0442\u0432\u043E\u0440\u0438\u0442\u0438" })] }));
}
export default CreateEmptyObject;
