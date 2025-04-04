import React, { createContext, useContext } from 'react'
import { ClassEventContextType } from '../interfaces/ClassEventContextType';
import { CalendarEvent } from '../interfaces/CalendraEvent';

export const ClassEventsContext = createContext<ClassEventContextType>({
    classEvents: [],
    setClassEvents: () => { },
});

export const ClassEventsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [classEvents, setClassEvents] = React.useState<CalendarEvent[]>([]); // Replace 'any' with the actual type of your class events


    const contextValue = React.useMemo(() => ({ classEvents, setClassEvents }), [classEvents]);
   
    return (
        <ClassEventsContext.Provider value={contextValue}>
            {children}
        </ClassEventsContext.Provider>
    );
}

export const useClassEvents = () => useContext(ClassEventsContext);