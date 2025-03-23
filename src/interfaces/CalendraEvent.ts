export interface CalendarEvent {
    id: string;
    title: string;
    description: string;
    location: string;
    startTime: string;
    endTime: string;
    isAllDay: boolean;
    organizer: string;
    attendees: Array<{
        email: string;
        name: string;
        responseStatus: string;
    }>;
    status: string;
    calendarId: string;
}