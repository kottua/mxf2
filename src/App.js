import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainPage from "./pages/MainPage.tsx";
import OnboardingPage from "./pages/OnboardingPage.tsx";
import ConfigurePage from "./pages/ConfigurePage.tsx";
import EnginePage from "./pages/EnginePage.tsx";
import { ActiveRealEstateObjectProvider } from "./contexts/ActiveRealEstateObjectContext.tsx";
import styles from './App.module.css';
import DisfactPage from "./pages/DisfactPage.tsx";
function App() {
    return (_jsx("div", { className: styles.globalContainer, children: _jsx(BrowserRouter, { children: _jsx(ActiveRealEstateObjectProvider, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(MainPage, {}) }), _jsx(Route, { path: "/onboarding/:id", element: _jsx(OnboardingPage, {}) }), _jsx(Route, { path: "/configure/:id", element: _jsx(ConfigurePage, {}) }), _jsx(Route, { path: "/engine/:id", element: _jsx(EnginePage, {}) }), _jsx(Route, { path: '/disfact/', element: _jsx(DisfactPage, {}) })] }) }) }) }));
}
export default App;
