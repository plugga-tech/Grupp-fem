import React, { createContext, ReactNode, useContext, useState } from 'react';

interface ActiveHouseholdContextType {
    activeHouseholdId: string | null;
    setActiveHouseholdId: (id: string | null) => void;
}

const ActiveHouseholdContext = createContext<ActiveHouseholdContextType | undefined>(undefined);

interface ActiveHouseholdProviderProps {
    children: ReactNode;
}

export function ActiveHouseholdProvider({ children }: ActiveHouseholdProviderProps) {
    const [activeHouseholdId, setActiveHouseholdId] = useState<string | null>(null);

    return (
        <ActiveHouseholdContext.Provider
            value={{
                activeHouseholdId,
                setActiveHouseholdId
            }}
        >
            {children}
        </ActiveHouseholdContext.Provider>
    );
}

export function useActiveHousehold() {
    const context = useContext(ActiveHouseholdContext);
    if (context === undefined) {
        throw new Error('useActiveHousehold must be used within an ActiveHouseholdProvider');
    }
    return context;
}