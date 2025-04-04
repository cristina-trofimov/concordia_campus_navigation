import { MAPBOX_TOKEN } from "@env";


export const TokenManager = {
  // Define a way to get the token from different sources
  getMapboxToken: () => {
    // In real environment, get from @env
    try {
      const envToken = MAPBOX_TOKEN;
      return envToken
    } catch (e) {
      // Fallback for any import issues
      return 'mock-token-for-tests';
    }
  }
};