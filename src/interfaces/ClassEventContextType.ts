import { CalendarEvent } from "./CalendraEvent";

export interface ClassEventContextType {
    classEvents: CalendarEvent[]; // Replace 'any' with the actual type of your class events
    setClassEvents: (calendarEvents: CalendarEvent[]) => void; // Replace 'any' with the actual type of your class events
}