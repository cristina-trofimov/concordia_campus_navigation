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
    it('should fetch events from primary calendar successfully', async () => {
      // Mock data
      const mockEvents = [
        { id: '1', summary: 'Meeting 1' },
        { id: '2', summary: 'Meeting 2' }
      ];

      // Setup axios mock
      mockedAxios.get.mockResolvedValueOnce({
        data: { items: mockEvents }
      });

      // Execute function
      const result = await fetchCalendarEvents(mockAccessToken);

      // Assertions
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

    it('should throw an error when the API request fails', async () => {
      // Setup axios mock to reject
      const mockError = new Error('API error');
      mockedAxios.get.mockRejectedValueOnce(mockError);

      // Execute and assert
      await expect(fetchCalendarEvents(mockAccessToken)).rejects.toThrow('API error');
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('fetchUserCalendars', () => {
    it('should fetch user calendars successfully', async () => {
      // Mock data
      const mockCalendars = [
        {
          id: 'cal1',
          summary: 'Calendar 1',
          backgroundColor: '#4285F4',
          foregroundColor: '#FFFFFF',
          selected: true,
          primary: true,
          accessRole: 'owner',
          timeZone: 'America/New_York'
        },
        {
          id: 'cal2',
          summary: 'Calendar 2'
        }
      ];

      // Setup axios mock
      mockedAxios.get.mockResolvedValueOnce({
        data: { items: mockCalendars }
      });

      // Execute function
      const result = await fetchUserCalendars(mockAccessToken);

      // Assertions
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://www.googleapis.com/calendar/v3/users/me/calendarList',
        expect.objectContaining({
          headers: {
            Authorization: `Bearer ${mockAccessToken}`,
            'Content-Type': 'application/json',
          }
        })
      );

      expect(result.type).toBe('success');
      expect(result.data?.calendars).toHaveLength(2);
      expect(result.data?.calendars[0]).toEqual({
        id: 'cal1',
        title: 'Calendar 1',
        description: '',
        backgroundColor: '#4285F4',
        foregroundColor: '#FFFFFF',
        selected: true,
        primary: true,
        accessRole: 'owner',
        timeZone: 'America/New_York'
      });
      expect(result.data?.calendars[1].title).toBe('Calendar 2');
      expect(result.data?.calendars[1].backgroundColor).toBe('#4285F4'); // Default value
    });

    it('should return error response when API request fails', async () => {
      // Setup axios mock to reject with response data
      const errorResponse = {
        response: {
          data: { error: 'Invalid credentials' }
        },
        message: 'Request failed with status code 401'
      };
      mockedAxios.get.mockRejectedValueOnce(errorResponse);

      // Execute function
      const result = await fetchUserCalendars(mockAccessToken);

      // Assertions
      expect(result.type).toBe('error');
      expect(result.error).toEqual({ error: 'Invalid credentials' });
    });

    it('should handle error without response data', async () => {
      // Setup axios mock to reject without response data
      const errorMessage = 'Network Error';
      mockedAxios.get.mockRejectedValueOnce(new Error(errorMessage));

      // Execute function
      const result = await fetchUserCalendars(mockAccessToken);

      // Assertions
      expect(result.type).toBe('error');
      expect(result.error).toBe(errorMessage);
    });
  });

  describe('getCalendarEvent', () => {
    it('should fetch a specific calendar event successfully', async () => {
      // Mock data
      const eventId = 123;
      const mockEvent = {
        id: eventId,
        summary: 'Important Meeting',
        description: 'Discuss project status'
      };

      // Setup axios mock
      mockedAxios.get.mockResolvedValueOnce({
        data: mockEvent
      });

      // Execute function
      const result = await getCalendarEvent(mockAccessToken, eventId);

      // Assertions
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
        expect.objectContaining({
          headers: {
            Authorization: `Bearer ${mockAccessToken}`,
            'Content-Type': 'application/json',
          }
        })
      );
      expect(result).toEqual(mockEvent);
    });

    it('should throw an error when the API request fails', async () => {
      // Setup axios mock to reject
      const eventId = 456;
      const mockError = new Error('Event not found');
      mockedAxios.get.mockRejectedValueOnce(mockError);

      // Execute and assert
      await expect(getCalendarEvent(mockAccessToken, eventId)).rejects.toThrow('Event not found');
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('fetchCalendarEventsByCalendarId', () => {
    const calendarId = 'test-calendar-id';

    it('should fetch events from a specific calendar successfully', async () => {
      // Mock data with different event formats (dateTime and all-day events)
      const mockEvents = [
        {
          id: 'event1',
          summary: 'Meeting',
          description: 'Team sync',
          location: 'Room 101',
          start: { dateTime: '2025-03-24T10:00:00Z' },
          end: { dateTime: '2025-03-24T11:00:00Z' },
          organizer: { email: 'organizer@example.com' },
          attendees: [
            { email: 'person1@example.com', displayName: 'Person 1', responseStatus: 'accepted' },
            { email: 'person2@example.com', displayName: 'Person 2', responseStatus: 'tentative' }
          ],
          status: 'confirmed'
        },
        {
          id: 'event2',
          start: { date: '2025-03-25' },
          end: { date: '2025-03-26' }
        }
      ];

      // Setup axios mock
      mockedAxios.get.mockResolvedValueOnce({
        data: { items: mockEvents }
      });

      // Execute function
      const result = await fetchCalendarEventsByCalendarId(mockAccessToken, calendarId);

      // Assertions
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
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

      expect(result.type).toBe('success');
      expect(result.data?.events).toHaveLength(2);
      expect(result.data?.calendarId).toBe(calendarId);

      // Check first event (with dateTime)
      expect(result.data?.events[0]).toEqual({
        id: 'event1',
        title: 'Meeting',
        description: 'Team sync',
        location: 'Room 101',
        startTime: '2025-03-24T10:00:00Z',
        endTime: '2025-03-24T11:00:00Z',
        isAllDay: false,
        organizer: 'organizer@example.com',
        attendees: [
          { email: 'person1@example.com', name: 'Person 1', responseStatus: 'accepted' },
          { email: 'person2@example.com', name: 'Person 2', responseStatus: 'tentative' }
        ],
        status: 'confirmed',
        calendarId: calendarId
      });

      // Check second event (all-day event)
      expect(result.data?.events[1].isAllDay).toBe(true);
      expect(result.data?.events[1].title).toBe('Untitled Event'); // Default title
      expect(result.data?.events[1].startTime).toBe('2025-03-25');
    });

    it('should return error response when API request fails for specific calendar', async () => {
      // Setup axios mock to reject with response data
      const errorResponse = {
        response: {
          data: { error: 'Calendar not found' }
        },
        message: 'Request failed with status code 404'
      };
      mockedAxios.get.mockRejectedValueOnce(errorResponse);

      // Execute function
      const result = await fetchCalendarEventsByCalendarId(mockAccessToken, calendarId);

      // Assertions
      expect(result.type).toBe('error');
      expect(result.error).toEqual({ error: 'Calendar not found' });
      expect(result.calendarId).toBe(calendarId);
    });
  });

  // // Test time-related parameters
  // describe('Time parameters', () => {
  //   beforeEach(() => {
  //     // Mock the Date object
  //     const mockDate = new Date('2025-03-24T12:00:00Z');
  //     jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

  //     // Mock the setMonth method to properly advance the date
  //     const mockSetMonth = jest.fn(function(this: Date, month: number) {
  //       // Create a new date with the month advanced
  //       const newDate = new Date(this);
  //       newDate.setMonth(month);
  //       return newDate;
  //     });

  //     // Apply the mock to the Date prototype
  //     Date.prototype.setMonth = mockSetMonth as any;
  //   });


    // afterEach(() => {
    //   jest.restoreAllMocks();
    // });

    // it('should use correct time range parameters for fetchCalendarEvents', async () => {
    //   // Setup axios mock
    //   mockedAxios.get.mockResolvedValueOnce({ data: { items: [] } });

    //   // Execute function
    //   await fetchCalendarEvents(mockAccessToken);

    //   // Get the params from the axios call
    //   const callParams = mockedAxios.get.mock.calls[0][1].params;

    //   // Check the structure matches what we expect from the implementation
    //   expect(callParams).toHaveProperty('timeMin');
    //   expect(callParams).toHaveProperty('timeMax');
    //   expect(typeof callParams.timeMin).toBe('string');
    //   expect(typeof callParams.timeMax).toBe('string');

    //   // Verify timeMin is current date in ISO format
    //   const expectedDate = new Date('2025-04-24T12:00:00Z'); // Match the mock date
    //   expect(callParams.timeMin).toBe(expectedDate.toISOString());

    //   console.log('Actual timeMin:', callParams.timeMin);
    //   console.log('Expected timeMin:', new Date('2025-03-24T12:00:00Z').toISOString());



    //   // Verify timeMax is approximately one month later
    //   // Instead of testing exact equality, check it's a valid date string 
    //   // and is later than timeMin
    //   expect(new Date(callParams.timeMax).getTime()).toBeGreaterThan(
    //     new Date(callParams.timeMin).getTime()
    //   );
    // });

    // it('should use correct time range parameters for fetchCalendarEventsByCalendarId', async () => {
    //   // Setup axios mock
    //   mockedAxios.get.mockResolvedValueOnce({ data: { items: [] } });

    //   // Execute function
    //   await fetchCalendarEventsByCalendarId(mockAccessToken, 'test-calendar');

    //   // Get the params from the axios call
    //   const callParams = mockedAxios.get.mock.calls[0][1].params;

    //   // Check the structure matches what we expect from the implementation
    //   expect(callParams).toHaveProperty('timeMin');
    //   expect(callParams).toHaveProperty('timeMax');
    //   expect(typeof callParams.timeMin).toBe('string');
    //   expect(typeof callParams.timeMax).toBe('string');

    //   // Verify timeMin is current date in ISO format
    //   const expectedDate = new Date('2025-03-24T12:00:00Z'); // Match the mock date
    //   expect(callParams.timeMin).toBe(expectedDate.toISOString());

    //   // Verify timeMax is approximately one month later
    //   // Instead of testing exact equality, check it's a valid date string 
    //   // and is later than timeMin
    //   expect(new Date(callParams.timeMax).getTime()).toBeGreaterThan(
    //     new Date(callParams.timeMin).getTime()
    //   );
    // });
  // });
});