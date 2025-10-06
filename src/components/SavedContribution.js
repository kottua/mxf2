import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
function SavedContribution({ contributions }) {
    if (contributions.length === 0) {
        return _jsx("p", { children: "\u041D\u0435\u043C\u0430\u0454 \u0437\u0431\u0435\u0440\u0435\u0436\u0435\u043D\u0438\u0445 \u043A\u043E\u043D\u0444\u0456\u0433\u0443\u0440\u0430\u0446\u0456\u0439." });
    }
    return (_jsx("section", { children: _jsx("h2", { children: "\u0417\u0431\u0435\u0440\u0435\u0436\u0435\u043D\u0456 \u043A\u043E\u043D\u0444\u0456\u0433\u0443\u0440\u0430\u0446\u0456\u0457" }) }));
}
export default SavedContribution;
