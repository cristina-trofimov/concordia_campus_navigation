import axios from 'axios';
import { Calendar } from '../interfaces/calendar';
import { CalendarEvent } from '../interfaces/CalendraEvent';



interface CalendarApiResponse {
    type: 'success' | 'error';
    data?: {
        calendars: Calendar[];
        count: number;
    };
    error?: any;
}



interface EventsApiResponse {
    type: 'success' | 'error';
    data?: {
        events: CalendarEvent[];
        count: number;
        calendarId: string;
    };
    error?: any;
    calendarId?: string;
}

export const fetchCalendarEvents = async (accessToken: string) => {
    try {
        // Format dates if provided, otherwise use defaults
        const formattedTimeMin = new Date().toISOString();

        const defaultTimeMax = new Date();
        defaultTimeMax.setMonth(defaultTimeMax.getMonth() + 1);

        const formattedTimeMax = defaultTimeMax.toISOString();

        // Make request to Google Calendar API
        const response = await axios.get(
            'https://www.googleapis.com/calendar/v3/calendars/primary/events',
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                params: {
                    timeMin: formattedTimeMin,
                    timeMax: formattedTimeMax,
                    singleEvents: true,
                    orderBy: 'startTime',
                    maxResults: 100
                },
            }
        );

        const events = response.data.items;
        return events;

    } catch (error) {
        console.error('Error fetching calendar events:', error);
        throw error;
    }
};



export const fetchUserCalendars = async (accessToken: string): Promise<CalendarApiResponse> => {
    try {
        const response = await axios.get(
            'https://www.googleapis.com/calendar/v3/users/me/calendarList',
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                }
            }
        );

        // Format the calendars into a clean structure
        const calendars: Calendar[] = response.data.items.map((calendar: any) => ({
            id: calendar.id,
            title: calendar.summary || 'Untitled Calendar',
            description: calendar.description || '',
            backgroundColor: calendar.backgroundColor || '#4285F4',
            foregroundColor: calendar.foregroundColor || '#FFFFFF',
            selected: calendar.selected || false,
            primary: calendar.primary || false,
            accessRole: calendar.accessRole || 'reader',
            timeZone: calendar.timeZone || 'UTC'
        }));

        return {
            type: 'success',
            data: {
                calendars,
                count: calendars.length
            }
        };

    } catch (error: any) {
        console.error('Error fetching user calendars:', error.response?.data || error.message);
        return {
            type: 'error',
            error: error.response?.data || error.message
        };
    }
};


// Function to get details of a specific calendar event
export const getCalendarEvent = async (accessToken: string, eventId: number) => {
    try {
        const response = await axios.get(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error('Error fetching calendar event details:', error);
        throw error;
    }
};


export const fetchCalendarEventsByCalendarId = async (
    accessToken: string,
    calendarId: string,
): Promise<EventsApiResponse> => {
    try {
        // Format dates if provided, otherwise use defaults
        const formattedTimeMin =  new Date().toISOString();

        const defaultTimeMax = new Date();
        defaultTimeMax.setMonth(defaultTimeMax.getMonth() + 1);

        const formattedTimeMax =  defaultTimeMax.toISOString();

        // Make request to Google Calendar API for the specific calendar
        const response = await axios.get(
            `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                params: {
                    timeMin: formattedTimeMin,
                    timeMax: formattedTimeMax,
                    singleEvents: true,
                    orderBy: 'startTime',
                    maxResults: 100
                },
            }
        );

        // Format the events into a cleaner structure
        const events: CalendarEvent[] = response.data.items.map((event: any) => ({
            id: event.id,
            title: event.summary || "Untitled Event",
            description: event.description || "",
            location: event.location || "",
            startTime: event.start?.dateTime || event.start?.date || "",
            endTime: event.end?.dateTime || event.end?.date || "",
            isAllDay: !event.start?.dateTime,
            organizer: event.organizer?.email || "",
            attendees: event.attendees?.map((attendee: any) => ({
                email: attendee.email || "",
                name: attendee.displayName || "",
                responseStatus: attendee.responseStatus || "needsAction"
            })) || [],
            status: event.status || "confirmed",
            calendarId: calendarId
        }));

        return {
            type: 'success',
            data: {
                events,
                count: events.length,
                calendarId
            }
        };

    } catch (error: any) {
        console.error(`Error fetching events from calendar "${calendarId}":`, error.response?.data || error.message);
        return {
            type: 'error',
            error: error.response?.data || error.message,
            calendarId
        };
    }
};