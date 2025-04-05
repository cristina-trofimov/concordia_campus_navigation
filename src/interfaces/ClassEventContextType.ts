import { CalendarEvent } from "./CalendraEvent";

export interface ClassEventContextType {
    classEvents: CalendarEvent[];
    setClassEvents: (calendarEvents: CalendarEvent[]) => void;
}