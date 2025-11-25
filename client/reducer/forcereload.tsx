import React, { createContext, useContext, useReducer } from 'react';

type FeedSyncContextType = {
    counter: number;
    forceUpdate: () => void;
};

const FeedSyncContext = createContext<FeedSyncContextType | undefined>(undefined);

function forceReducer(state: number) {
    return state + 1;
}

export const FeedSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [counter, dispatch] = useReducer(forceReducer, 0);

    const forceUpdate = () => dispatch();

    return (
        <FeedSyncContext.Provider value={{ counter, forceUpdate }}>
            {children}
        </FeedSyncContext.Provider>
    );
};

export const useFeedSync = () => {
    const context = useContext(FeedSyncContext);
    if (!context) throw new Error('useFeedSync must be used within FeedSyncProvider');
    return context;
};
