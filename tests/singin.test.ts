import { signIn, configureGooggleSignIn } from '../src/components/signin';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { configureReanimatedLogger } from 'react-native-reanimated';
import { WEBCLIENTID } from '@env';

// Mock the external dependencies
jest.mock('@react-native-google-signin/google-signin', () => {
  return {
    GoogleSignin: {
      configure: jest.fn(),
      getCurrentUser: jest.fn(),
      hasPlayServices: jest.fn(),
      signIn: jest.fn(),
      getTokens: jest.fn(),
    },
    statusCodes: {
      SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
      IN_PROGRESS: 'IN_PROGRESS',
      PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
    },
    isErrorWithCode: jest.fn((error) => error.code !== undefined),
  };
});

jest.mock('react-native-reanimated', () => ({
  configureReanimatedLogger: jest.fn(),
  ReanimatedLogLevel: {
    warn: 'warn',
  },
}));

// Mock @env to match the actual value being used
jest.mock('@env', () => ({
  WEBCLIENTID: '38724570048-54lor6uhetguagq3lp164ccfui1hq5h5.apps.googleusercontent.com',
}));

// Mock console methods
console.log = jest.fn();
console.error = jest.fn();

describe('Google Sign In', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('configureGooggleSignIn', () => {
    it('should configure GoogleSignin correctly', () => {
      configureGooggleSignIn();
      
      expect(GoogleSignin.configure).toHaveBeenCalledWith({
        webClientId: WEBCLIENTID,
        scopes: ['email', 'profile', 'https://www.googleapis.com/auth/calendar'],
        offlineAccess: true,
        forceCodeForRefreshToken: false,
      });
      
      expect(configureReanimatedLogger).toHaveBeenCalledWith({
        level: 'warn',
        strict: true,
      });
    });
  });

  describe('signIn', () => {
    it('should return access token if user is already signed in', async () => {
      const mockUser = { user: { id: '123', name: 'Test User' } };
      const mockTokens = { accessToken: 'mock-access-token', idToken: 'mock-id-token' };
      
      GoogleSignin.getCurrentUser.mockResolvedValueOnce(mockUser);
      GoogleSignin.getTokens.mockResolvedValueOnce(mockTokens);
      
      const result = await signIn();
      
      expect(GoogleSignin.configure).toHaveBeenCalled();
      expect(GoogleSignin.getCurrentUser).toHaveBeenCalled();
      expect(GoogleSignin.getTokens).toHaveBeenCalled();
      expect(GoogleSignin.signIn).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith("Already signed in user:", JSON.stringify(mockUser, null, 2));
      expect(result).toBe(mockTokens.accessToken);
    });

    it('should sign in user if not already signed in', async () => {
      const mockUserInfo = { user: { id: '123', name: 'Test User' } };
      const mockTokens = { accessToken: 'mock-access-token', idToken: 'mock-id-token' };
      
      GoogleSignin.getCurrentUser.mockResolvedValueOnce(null);
      GoogleSignin.hasPlayServices.mockResolvedValueOnce(true);
      GoogleSignin.signIn.mockResolvedValueOnce(mockUserInfo);
      GoogleSignin.getTokens.mockResolvedValueOnce(mockTokens);
      
      const result = await signIn();
      
      expect(GoogleSignin.configure).toHaveBeenCalled();
      expect(GoogleSignin.getCurrentUser).toHaveBeenCalled();
      expect(GoogleSignin.hasPlayServices).toHaveBeenCalledWith({ showPlayServicesUpdateDialog: true });
      expect(GoogleSignin.signIn).toHaveBeenCalled();
      expect(GoogleSignin.getTokens).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith("Sign-in successful. User Info:", JSON.stringify(mockUserInfo, null, 2));
      expect(result).toBe(mockTokens.accessToken);
    });

    it('should handle SIGN_IN_CANCELLED error', async () => {
      const error = { code: statusCodes.SIGN_IN_CANCELLED };
      
      GoogleSignin.getCurrentUser.mockResolvedValueOnce(null);
      GoogleSignin.hasPlayServices.mockResolvedValueOnce(true);
      GoogleSignin.signIn.mockRejectedValueOnce(error);
      
      const result = await signIn();
      
      expect(console.error).toHaveBeenCalledWith("Sign-in error full details:", error);
      expect(console.log).toHaveBeenCalledWith('User cancelled the sign-in flow');
      expect(result).toBeNull();
    });

    it('should handle IN_PROGRESS error', async () => {
      const error = { code: statusCodes.IN_PROGRESS };
      
      GoogleSignin.getCurrentUser.mockResolvedValueOnce(null);
      GoogleSignin.hasPlayServices.mockResolvedValueOnce(true);
      GoogleSignin.signIn.mockRejectedValueOnce(error);
      
      const result = await signIn();
      
      expect(console.error).toHaveBeenCalledWith("Sign-in error full details:", error);
      expect(console.log).toHaveBeenCalledWith('Sign-in operation is in progress already');
      expect(result).toBeNull();
    });

    it('should handle PLAY_SERVICES_NOT_AVAILABLE error', async () => {
      const error = { code: statusCodes.PLAY_SERVICES_NOT_AVAILABLE };
      
      GoogleSignin.getCurrentUser.mockResolvedValueOnce(null);
      GoogleSignin.hasPlayServices.mockRejectedValueOnce(error);
      
      const result = await signIn();
      
      expect(console.error).toHaveBeenCalledWith("Sign-in error full details:", error);
      expect(console.log).toHaveBeenCalledWith('Play services not available or outdated');
      expect(result).toBeNull();
    });

    it('should handle other status code errors', async () => {
      const error = { code: 'UNKNOWN_ERROR', message: 'Some unknown error' };
      
      GoogleSignin.getCurrentUser.mockResolvedValueOnce(null);
      GoogleSignin.hasPlayServices.mockResolvedValueOnce(true);
      GoogleSignin.signIn.mockRejectedValueOnce(error);
      
      const result = await signIn();
      
      expect(console.error).toHaveBeenCalledWith("Sign-in error full details:", error);
      expect(console.log).toHaveBeenCalledWith(`Other error. Code: ${error.code}, Message: ${error.message}`);
      expect(result).toBeNull();
    });

    it('should handle non-status code errors', async () => {
      const error = new Error('Generic error without code');
      
      GoogleSignin.getCurrentUser.mockResolvedValueOnce(null);
      GoogleSignin.hasPlayServices.mockResolvedValueOnce(true);
      GoogleSignin.signIn.mockRejectedValueOnce(error);
      
      const result = await signIn();
      
      expect(console.error).toHaveBeenCalledWith("Sign-in error full details:", error);
      expect(console.log).toHaveBeenCalledWith('Non-status code error:', error);
      expect(result).toBeNull();
    });
  });
});