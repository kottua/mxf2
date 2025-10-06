import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState } from "react";
const ActiveRealEstateContext = createContext(undefined);
export const ActiveRealEstateObjectProvider = ({ children }) => {
    const [activeObject, setActiveObject] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    return (_jsx(ActiveRealEstateContext.Provider, { value: {
            activeObject,
            setActiveObject,
            isLoading,
            setIsLoading
        }, children: children }));
};
export const useActiveRealEstateObject = () => {
    const context = useContext(ActiveRealEstateContext);
    if (context === undefined) {
        throw new Error('useActiveRealEstateObject must be used within an ActiveRealEstateObjectProvider');
    }
    return context;
};
