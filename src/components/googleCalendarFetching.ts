import axios from 'axios';

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

        console.log(`Retrieved ${response.data.items.length} calendar events`);
        const events = response.data.items;
        for (let i = 0; i < events.length; i++) {
            console.log(JSON.stringify(events[i]));
        }
        return events;

    } catch (error) {
        console.error('Error fetching calendar events:', error);
        throw error;
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

// Function to create a new calendar event
// export const createCalendarEvent = async (accessToken, eventDetails) => {
//     try {
//         const response = await axios.post(
//             'https://www.googleapis.com/calendar/v3/calendars/primary/events',
//             eventDetails,
//             {
//                 headers: {
//                     Authorization: `Bearer ${accessToken}`,
//                     'Content-Type': 'application/json',
//                 },
//             }
//         );

//         console.log('Event created successfully:', response.data.id);
//         return response.data;
//     } catch (error) {
//         console.error('Error creating calendar event:', error.response?.data || error.message);
//         throw error;
//     }
// };