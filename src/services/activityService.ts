import { Activity } from '../types';
import { MOCK_ACTIVITIES } from './mockData';

// MOCK DATA STORE
let activitiesDB = [...MOCK_ACTIVITIES];

/**
 * Logs a new user activity to the in-memory mock store.
 * @param action - The action performed (e.g., 'Liked', 'Shared').
 * @param itemTitle - The title of the item related to the action (e.g., guide title).
 */
export const logActivity = async (action: string, itemTitle: string): Promise<void> => {
  try {
    // With Farcaster auth, we assume if this function is called, the user is authenticated.
    // The explicit check for a supabase user is no longer needed here.
    const newActivity: Activity = {
      action,
      itemTitle,
      timestamp: new Date().toISOString(),
    };
    
    // Add to the beginning of the array
    activitiesDB.unshift(newActivity);

    // Optional: Keep the log from growing indefinitely in a long session
    if (activitiesDB.length > 50) {
        activitiesDB.pop();
    }
    
    console.log("MOCK: Logged activity:", newActivity);
    return Promise.resolve();

  } catch (error) {
    console.error("Could not log mock activity:", error);
  }
};

/**
 * Retrieves the user's activity log from the in-memory mock store.
 * @returns An array of activity objects.
 */
export const getActivityLog = async (userId: string): Promise<Activity[]> => {
    if (!userId) return Promise.resolve([]);
    // In this mock implementation, we return the same log for any authenticated user.
    console.log("MOCK: Retrieving activity log.");
    return Promise.resolve(activitiesDB);
};