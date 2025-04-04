import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureReanimatedLogger } from 'react-native-reanimated';

// Mock statusCodes before importing or mocking modules that use it
const mockStatusCodes = {
  SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
  IN_PROGRESS: 'IN_PROGRESS',
  PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
};

// Mock modules before importing anything from them
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(),
    signIn: jest.fn(),
    getTokens: jest.fn(),
    signOut: jest.fn(),
  },
  statusCodes: mockStatusCodes,
  isErrorWithCode: (error: any) => error && typeof error.code !== 'undefined',
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('react-native-reanimated', () => ({
  configureReanimatedLogger: jest.fn(),
  ReanimatedLogLevel: {
    warn: 'warn'
  }
}));

// Mock WEBCLIENTID directly
jest.mock('@env', () => ({
  WEBCLIENTID: 'mock-web-client-id'
}), { virtual: true });

// Now import the component to test and the mocked modules
import {
  configureGooggleSignIn,
  signIn,
  signOut
} from '../src/components/HandleGoogle';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

// Override the mocked statusCodes to ensure it's available
(global as any).statusCodes = mockStatusCodes;

// Spy on console methods
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

describe('HandleGoogle', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Reset the environment variable mock for each test
    jest.resetModules();
    // Ensure our mock is properly set up before each test
    jest.doMock('@env', () => ({
      WEBCLIENTID: 'mock-web-client-id'
    }));
  });


  describe('signIn', () => {
    it('should return existing token if already stored', async () => {
      AsyncStorage.getItem.mockResolvedValue('existing-token');

      const result = await signIn();
      
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('accessToken');
      expect(result).toBe('existing-token');
      expect(consoleLogSpy).toHaveBeenCalledWith('User already signed in');
      expect(GoogleSignin.hasPlayServices).not.toHaveBeenCalled();
    });

    it('should sign in and store new token if no token exists', async () => {
      // Mock token not found in storage
      AsyncStorage.getItem.mockResolvedValue(null);
      
      // Mock successful Google sign-in
      GoogleSignin.hasPlayServices.mockResolvedValue(true);
      GoogleSignin.signIn.mockResolvedValue({ user: { email: 'test@example.com' } });
      GoogleSignin.getTokens.mockResolvedValue({ accessToken: 'new-token' });

      const result = await signIn();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('accessToken');
      expect(GoogleSignin.hasPlayServices).toHaveBeenCalledWith({ showPlayServicesUpdateDialog: true });
      expect(GoogleSignin.signIn).toHaveBeenCalled();
      expect(GoogleSignin.getTokens).toHaveBeenCalled();
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('accessToken', 'new-token');
      expect(result).toBe('new-token');
    });
    
    it('should handle non-status code error', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);
      
      // Mock generic error without code
      const mockError = new Error('Generic error');
      GoogleSignin.hasPlayServices.mockResolvedValue(true);
      GoogleSignin.signIn.mockRejectedValue(mockError);

      const result = await signIn();

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith('Non-status code error:', mockError);
      expect(result).toBeNull();
    });
  });

  describe('signOut', () => {
    it('should sign out and remove stored tokens', async () => {
      await signOut();

      expect(GoogleSignin.signOut).toHaveBeenCalled();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('chosenCalendar');
      expect(consoleLogSpy).toHaveBeenCalledWith('User signed out successfully');
    });

    it('should handle sign out errors', async () => {
      const mockError = new Error('Sign out failed');
      GoogleSignin.signOut.mockRejectedValue(mockError);

      await signOut();

      expect(GoogleSignin.signOut).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error signing out:', mockError);
    });
  });
});