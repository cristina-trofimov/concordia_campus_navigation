import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { signOut } from '../src/components/signout';

// Mock the GoogleSignin module
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    signOut: jest.fn(),
  },
}));

// Mock console methods
console.log = jest.fn();
console.error = jest.fn();

describe('signOut function', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should sign out successfully', async () => {
    // Setup the mock to resolve successfully
    (GoogleSignin.signOut as jest.Mock).mockResolvedValueOnce(undefined);

    // Call the function
    await signOut();

    // Verify GoogleSignin.signOut was called
    expect(GoogleSignin.signOut).toHaveBeenCalledTimes(1);
    
    // Verify success message was logged
    expect(console.log).toHaveBeenCalledWith('User signed out successfully');
    
    // Verify error was not logged
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should handle sign out error', async () => {
    // Setup the mock to reject with an error
    const mockError = new Error('Sign out failed');
    (GoogleSignin.signOut as jest.Mock).mockRejectedValueOnce(mockError);

    // Call the function
    await signOut();

    // Verify GoogleSignin.signOut was called
    expect(GoogleSignin.signOut).toHaveBeenCalledTimes(1);
    
    // Verify error was logged with the correct message
    expect(console.error).toHaveBeenCalledWith('Error signing out:', mockError);
    
    // Verify success message was not logged
    expect(console.log).not.toHaveBeenCalled();
  });
});