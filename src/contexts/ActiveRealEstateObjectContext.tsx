import type {RealEstateObject} from "../interfaces/RealEstateObject.ts";
import {createContext, type FC, type ReactNode, useContext, useState} from "react";

interface ActiveRealEstateObjectType {
    activeObject: RealEstateObject | null;
    setActiveObject: (obj: RealEstateObject | null) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}

interface ActiveRealEstateProviderType {
    children: ReactNode;
}

const ActiveRealEstateContext = createContext<ActiveRealEstateObjectType | undefined>(undefined);

export const ActiveRealEstateObjectProvider: FC<ActiveRealEstateProviderType> = ({ children }) => {
    const [activeObject, setActiveObject] = useState<RealEstateObject | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    return (
        <ActiveRealEstateContext.Provider
            value={{
                activeObject,
                setActiveObject,
                isLoading,
                setIsLoading
            }}
        >
            {children}
        </ActiveRealEstateContext.Provider>
    );
};

export const useActiveRealEstateObject = () => {
    const context = useContext(ActiveRealEstateContext);
    if (context === undefined) {
        throw new Error('useActiveRealEstateObject must be used within an ActiveRealEstateObjectProvider');
    }
    return context;
};