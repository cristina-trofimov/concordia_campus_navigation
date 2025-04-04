import axios from 'axios';
import {
  fetchCalendarEvents,
  fetchUserCalendars,
  getCalendarEvent,
  fetchCalendarEventsByCalendarId
} from '../src/components/googleCalendarFetching';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Google Calendar API Functions', () => {
  const mockAccessToken = 'mock-access-token';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchCalendarEvents', () => {
    it('should fetch events from primary calendar', async () => {
      // Mock data
      const mockEvents = [
        { id: '1', summary: 'Test Event 1' },
        { id: '2', summary: 'Test Event 2' }
      ];

      // Setup axios mock
      mockedAxios.get.mockResolvedValueOnce({ data: { items: mockEvents } });

      // Call the function
      const result = await fetchCalendarEvents(mockAccessToken);

      // Assertions
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        expect.objectContaining({
          headers: {
            Authorization: `Bearer ${mockAccessToken}`,
            'Content-Type': 'application/json',
          },
          params: expect.objectContaining({
            singleEvents: true,
            orderBy: 'startTime',
            maxResults: 100
          })
        })
      );
      expect(result).toEqual(mockEvents);
    });

    it('should handle errors when fetching calendar events', async () => {
      // Setup error mock
      const mockError = new Error('API Error');
      mockedAxios.get.mockRejectedValueOnce(mockError);

      // Call and expect rejection
      await expect(fetchCalendarEvents(mockAccessToken)).rejects.toThrow('API Error');
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('fetchUserCalendars', () => {
    it('should fetch and format user calendars', async () => {
      // Mock data
      const mockCalendarsResponse = {
        items: [
          {
            id: 'calendar1',
            summary: 'Main Calendar',
            description: 'My main calendar',
            backgroundColor: '#4285F4', 
            foregroundColor: '#FFFFFF',
            selected: true,
            primary: true,
            accessRole: 'owner',
            timeZone: 'America/New_York'
          },
          {
            id: 'calendar2',
            summary: 'Work Calendar',
            description: '',
            selected: false
          }
        ]
      };

      // Expected formatted data
      const expectedCalendars = [
        {
          id: 'calendar1',
          title: 'Main Calendar',
          description: 'My main calendar',
          backgroundColor: '#4285F4',
          foregroundColor: '#FFFFFF',
          selected: true,
          primary: true,
          accessRole: 'owner',
          timeZone: 'America/New_York'
        },
        {
          id: 'calendar2',
          title: 'Work Calendar',
          description: '',
          backgroundColor: '#4285F4',
          foregroundColor: '#FFFFFF',
          selected: false,
          primary: false,
          accessRole: 'reader',
          timeZone: 'UTC'
        }
      ];

      // Setup axios mock
      mockedAxios.get.mockResolvedValueOnce({ data: mockCalendarsResponse });

      // Call the function
      const result = await fetchUserCalendars(mockAccessToken);

      // Assertions
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://www.googleapis.com/calendar/v3/users/me/calendarList',
        {
          headers: {
            Authorization: `Bearer ${mockAccessToken}`,
            'Content-Type': 'application/json',
          }
        }
      );
      
      expect(result).toEqual({
        type: 'success',
        data: {
          calendars: expectedCalendars,
          count: 2
        }
      });
    });

    it('should handle errors when fetching user calendars', async () => {
      // Setup error mock
      const mockError = {
        response: {
          data: {
            error: {
              message: 'Invalid credentials'
            }
          }
        },
        message: 'Request failed with status code 401'
      };
      
      mockedAxios.get.mockRejectedValueOnce(mockError);

      // Call the function
      const result = await fetchUserCalendars(mockAccessToken);

      // Assertions
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        type: 'error',
        error: mockError.response.data
      });
    });
  });

  describe('getCalendarEvent', () => {
    it('should fetch a specific calendar event', async () => {
      // Mock data
      const mockEventId = 123;
      const mockEvent = {
        id: '123',
        summary: 'Test Event',
        description: 'Event description'
      };

      // Setup axios mock
      mockedAxios.get.mockResolvedValueOnce({ data: mockEvent });

      // Call the function
      const result = await getCalendarEvent(mockAccessToken, mockEventId);

      // Assertions
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${mockEventId}`,
        {
          headers: {
            Authorization: `Bearer ${mockAccessToken}`,
            'Content-Type': 'application/json',
          }
        }
      );
      expect(result).toEqual(mockEvent);
    });

    it('should handle errors when fetching an event', async () => {
      // Setup error mock
      const mockEventId = 999;
      const mockError = new Error('Event not found');
      mockedAxios.get.mockRejectedValueOnce(mockError);

      // Call and expect rejection
      await expect(getCalendarEvent(mockAccessToken, mockEventId)).rejects.toThrow('Event not found');
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('fetchCalendarEventsByCalendarId', () => {
    it('should fetch and format events for a specific calendar', async () => {
      // Mock data
      const mockCalendarId = 'calendar1@group.calendar.google.com';
      const mockEventsResponse = {
        items: [
          {
            id: 'event1',
            summary: 'Team Meeting',
            description: 'Weekly team sync',
            location: 'Conference Room A',
            start: { dateTime: '2025-04-05T10:00:00Z' },
            end: { dateTime: '2025-04-05T11:00:00Z' },
            organizer: { email: 'manager@example.com' },
            attendees: [
              { email: 'employee1@example.com', displayName: 'Employee One', responseStatus: 'accepted' },
              { email: 'employee2@example.com', displayName: 'Employee Two', responseStatus: 'tentative' }
            ],
            status: 'confirmed'
          },
          {
            id: 'event2',
            summary: 'All-day Event',
            start: { date: '2025-04-06' },
            end: { date: '2025-04-07' },
            status: 'confirmed'
          }
        ]
      };

      // Expected formatted events
      const expectedEvents = [
        {
          id: 'event1',
          title: 'Team Meeting',
          description: 'Weekly team sync',
          location: 'Conference Room A',
          startTime: '2025-04-05T10:00:00Z',
          endTime: '2025-04-05T11:00:00Z',
          isAllDay: false,
          organizer: 'manager@example.com',
          attendees: [
            { email: 'employee1@example.com', name: 'Employee One', responseStatus: 'accepted' },
            { email: 'employee2@example.com', name: 'Employee Two', responseStatus: 'tentative' }
          ],
          status: 'confirmed',
          calendarId: mockCalendarId
        },
        {
          id: 'event2',
          title: 'All-day Event',
          description: '',
          location: '',
          startTime: '2025-04-06',
          endTime: '2025-04-07',
          isAllDay: true,
          organizer: '',
          attendees: [],
          status: 'confirmed',
          calendarId: mockCalendarId
        }
      ];

      // Setup axios mock
      mockedAxios.get.mockResolvedValueOnce({ data: mockEventsResponse });

      // Call the function
      const result = await fetchCalendarEventsByCalendarId(mockAccessToken, mockCalendarId);

      // Assertions
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(mockCalendarId)}/events`,
        expect.objectContaining({
          headers: {
            Authorization: `Bearer ${mockAccessToken}`,
            'Content-Type': 'application/json',
          },
          params: expect.objectContaining({
            singleEvents: true,
            orderBy: 'startTime',
            maxResults: 100
          })
        })
      );
      
      expect(result).toEqual({
        type: 'success',
        data: {
          events: expectedEvents,
          count: 2,
          calendarId: mockCalendarId
        }
      });
    });

    it('should handle errors when fetching events by calendar ID', async () => {
      // Setup data
      const mockCalendarId = 'nonexistent@group.calendar.google.com';
      
      // Setup error mock
      const mockError = {
        response: {
          data: {
            error: {
              message: 'Calendar not found'
            }
          }
        },
        message: 'Request failed with status code 404'
      };
      
      mockedAxios.get.mockRejectedValueOnce(mockError);

      // Call the function
      const result = await fetchCalendarEventsByCalendarId(mockAccessToken, mockCalendarId);

      // Assertions
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        type: 'error',
        error: mockError.response.data,
        calendarId: mockCalendarId
      });
    });
  });
});