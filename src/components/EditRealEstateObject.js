import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { changeRealEstateObject } from "../api/RealEstateObjectApi.ts";
import styles from './EditRealEstateObject.module.css';
function EditRealEstateObject({ id, name, lat, lon, curr, url, setIsEditMode }) {
    const [formName, setFormName] = useState(name || '');
    const [formLat, setFormLat] = useState(lat ?? '');
    const [formLon, setFormLon] = useState(lon ?? '');
    const [formCurr, setFormCurr] = useState(curr || '');
    const [formUrl, setFormUrl] = useState(url || '');
    const [isLoading, setIsLoading] = useState(false);
    async function handleSubmit(e) {
        e.preventDefault();
        setIsLoading(true);
        const payload = {
            name: formName,
            lat: parseFloat(formLat),
            lon: parseFloat(formLon),
            curr: formCurr,
            url: formUrl,
        };
        try {
            await changeRealEstateObject(id, payload.name, payload.lat, payload.lon, false, payload.curr, payload.url, {});
            alert('Об\'єкт успішно оновлено');
            setIsEditMode(false);
        }
        catch (error) {
            console.error("Error updating real estate object:", error);
        }
        finally {
            setIsLoading(false);
        }
    }
    if (isLoading) {
        return _jsx("p", { children: "\u041E\u0431\u043D\u043E\u0432\u043B\u044F\u044E..." });
    }
    return (_jsxs("section", { className: styles.section, children: [_jsxs("div", { className: styles.header, children: [_jsx("h2", { children: "\u0420\u0435\u0434\u0430\u0433\u0443\u0432\u0430\u043D\u043D\u044F \u043E\u0431'\u0454\u043A\u0442\u0430" }), _jsx("p", { className: styles.instruction, children: "\u0414\u043B\u044F \u0440\u0435\u0434\u0430\u0433\u0443\u0432\u0430\u043D\u043D\u044F \u0432\u043D\u0435\u0441\u0456\u0442\u044C \u043D\u0435\u043E\u0431\u0445\u0456\u0434\u043D\u0456 \u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044F \u0456 \u043D\u0430\u0442\u0438\u0441\u043D\u0456\u0442\u044C \"\u0437\u0431\u0435\u0440\u0435\u0433\u0442\u0438\"" })] }), _jsx("button", { onClick: () => setIsEditMode(false), className: styles.cancelButton, children: "\u0412\u0456\u0434\u043C\u0456\u043D\u0438\u0442\u0438" }), _jsxs("form", { onSubmit: handleSubmit, className: styles.form, children: [_jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "name", children: "\u041D\u0430\u0437\u0432\u0430 \u043E\u0431'\u0454\u043A\u0442\u0430" }), _jsx("input", { type: "text", value: formName, id: "name", onChange: (e) => setFormName(e.target.value), required: true })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "lat", children: "\u0428\u0438\u0440\u043E\u0442\u0430" }), _jsx("input", { type: "number", value: formLat, id: "lat", step: "any", onChange: (e) => setFormLat(e.target.value), placeholder: "50.450001" })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "lon", children: "\u0414\u043E\u0432\u0433\u043E\u0442\u0430" }), _jsx("input", { type: "number", value: formLon, id: "lon", step: "any", onChange: (e) => setFormLon(e.target.value), placeholder: "30.523333" })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "curr", children: "\u0412\u0430\u043B\u044E\u0442\u0430" }), _jsx("input", { type: "text", value: formCurr, id: "curr", onChange: (e) => setFormCurr(e.target.value), placeholder: "UAH" })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "url", children: "URL" }), _jsx("input", { type: "url", value: formUrl, id: "url", onChange: (e) => setFormUrl(e.target.value), placeholder: "https://example.com" })] }), _jsx("button", { type: "submit", className: styles.submitButton, disabled: isLoading, children: isLoading ? 'Збереження...' : 'Зберегти зміни' })] })] }));
}
export default EditRealEstateObject;
