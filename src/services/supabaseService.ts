import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Guide, Book, User } from '../types';
import { MOCK_GUIDES } from './mockData';
import { getFarcasterUser } from './farcasterService';

// Keep the Supabase client initialized for data operations.
// Try Vercel environment variables first, then Vite variables, then fallback
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || 'https://rygpuqnqaagihwoapdix.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5Z3B1cW5xYWFnaWh3b2FwZGl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMDU5MDAsImV4cCI6MjA3Mjg4MTkwMH0.DxkNHZ7duGlAYR03GEPPsMaHGK9UPdgUT5fo--eZhGQ';

console.log('🔧 Supabase configuration:', {
  url: SUPABASE_URL,
  hasAnonKey: !!SUPABASE_ANON_KEY,
  envVars: {
    SUPABASE_URL: import.meta.env.SUPABASE_URL,
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    SUPABASE_ANON_KEY: import.meta.env.SUPABASE_ANON_KEY ? '***' : undefined,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? '***' : undefined
  }
});
const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export default supabase;


export const getOrCreateUserProfile = async (farcasterUser: { fid: number; username: string; pfp_url: string }): Promise<User> => {
  // Skip Farcaster API call due to CORS issues - use provided data directly
  console.log("Using provided Farcaster data directly:", farcasterUser);
  const userData = farcasterUser;

  // 2. Check if user with this FID exists in our database
  const { data: existingProfile, error: selectError } = await supabase
    .from('profiles')
    .select('*')
    .eq('fid', userData.fid)
    .single();

  if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = "The result contains 0 rows"
    console.error("Error fetching profile by FID:", selectError);
    throw selectError;
  }

  if (existingProfile) {
    console.log("✅ User profile found:", existingProfile);
    return existingProfile;
  }

  // 3. Create a new profile with fresh Farcaster data
  const newUser: Omit<User, 'email'> = {
      id: crypto.randomUUID(), // Generate a UUID for the primary key
      fid: userData.fid,
      username: userData.username,
      pfp_url: userData.pfp_url,
  };

  const { data: newProfile, error: insertError } = await supabase
    .from('profiles')
    .insert(newUser)
    .select()
    .single();

  if (insertError) {
    console.error("Error creating new profile:", insertError);
    throw insertError;
  }

  return newProfile;
};


// =================================================================================
// MOCK DATA STORE
// =================================================================================
// Use a mutable copy for in-session CUD operations
let guidesDB = [...MOCK_GUIDES];
// Simple interaction state tracker
const interactionState = {
    guides: new Map<number, 'like' | 'dislike'>(),
    books: new Map<number, 'like' | 'dislike'>(),
};


// =================================================================================
// GUIDE OPERATIONS (REAL DATABASE)
// =================================================================================

export const getMyGuides = async (authorId: string): Promise<Guide[]> => {
    console.log("REAL: Fetching guides for author:", authorId);
    try {
        // Get user FID from authorId
        const { data: profile } = await supabase
            .from('profiles')
            .select('fid')
            .eq('id', authorId)
            .single();
        
        if (!profile) {
            console.error("Profile not found for authorId:", authorId);
            return [];
        }

        // Use the RPC function to get user guides
        const { data, error } = await supabase.rpc('get_user_guides_with_stats', {
            user_fid: profile.fid,
            limit_count: 50,
            offset_count: 0
        });

        if (error) {
            console.error("Error fetching user guides:", error);
            return [];
        }

        // Transform the data to match Guide interface
        const guides: Guide[] = data.map((guide: any) => ({
            id: guide.id,
            title: guide.title,
            description: guide.description,
            coverImage: guide.cover_image,
            tags: guide.tags || [],
            isPublic: guide.is_public,
            createdAt: guide.created_at,
            authorId: authorId,
            authorFid: profile.fid,
            authorUsername: 'Loading...', // Will be filled by parent component
            authorPfpUrl: 'Loading...', // Will be filled by parent component
            likes: guide.like_count || 0,
            dislikes: 0, // Not implemented yet
            books: [] // Will be loaded separately
        }));

        return guides;
    } catch (error) {
        console.error("Error in getMyGuides:", error);
        return [];
    }
};

export const getPublicGuides = async (): Promise<Guide[]> => {
    console.log("REAL: Fetching all public guides.");
    try {
        const { data, error } = await supabase.rpc('get_public_guides_feed', {
            limit_count: 50,
            offset_count: 0
        });

        if (error) {
            console.error("Error fetching public guides:", error);
            return [];
        }

        // Transform the data to match Guide interface
        const guides: Guide[] = data.map((guide: any) => ({
            id: guide.id,
            title: guide.title,
            description: guide.description,
            coverImage: guide.cover_image,
            tags: guide.tags || [],
            isPublic: true,
            createdAt: guide.created_at,
            authorId: 'unknown', // Will be filled by parent component
            authorFid: guide.creator_fid,
            authorUsername: guide.creator_username,
            authorPfpUrl: guide.creator_pfp_url,
            likes: guide.like_count || 0,
            dislikes: 0, // Not implemented yet
            books: [] // Will be loaded separately
        }));

        return guides;
    } catch (error) {
        console.error("Error in getPublicGuides:", error);
        return [];
    }
};

export const getRecommendedGuides = async (): Promise<Guide[]> => {
    console.log("REAL: Fetching recommended guides.");
    try {
        const { data, error } = await supabase.rpc('get_public_guides_feed', {
            limit_count: 5,
            offset_count: 0
        });

        if (error) {
            console.error("Error fetching recommended guides:", error);
            return [];
        }

        // Transform the data to match Guide interface
        const guides: Guide[] = data.map((guide: any) => ({
            id: guide.id,
            title: guide.title,
            description: guide.description,
            coverImage: guide.cover_image,
            tags: guide.tags || [],
            isPublic: true,
            createdAt: guide.created_at,
            authorId: 'unknown', // Will be filled by parent component
            authorFid: guide.creator_fid,
            authorUsername: guide.creator_username,
            authorPfpUrl: guide.creator_pfp_url,
            likes: guide.like_count || 0,
            dislikes: 0, // Not implemented yet
            books: [] // Will be loaded separately
        }));

        return guides;
    } catch (error) {
        console.error("Error in getRecommendedGuides:", error);
        return [];
    }
}

export const getGuideById = async (id: number): Promise<Guide | undefined> => {
    console.log("MOCK: Fetching guide by ID:", id);
    const guide = guidesDB.find(g => g.id === id);
    return Promise.resolve(guide ? JSON.parse(JSON.stringify(guide)) : undefined);
}

// FIX: Added 'authorId' to Omit to keep the function signature consistent with the Guide type update.
export const createGuide = async (guideData: Omit<Guide, 'id' | 'createdAt' | 'authorId' | 'authorFid' | 'authorUsername' | 'authorPfpUrl' | 'likes' | 'dislikes'>, author: User): Promise<Guide> => {
    console.log("MOCK: Creating new guide titled:", guideData.title);
    const newGuide: Guide = {
        id: Math.max(...guidesDB.map(g => g.id)) + 1,
        ...guideData,
        createdAt: new Date().toISOString(),
        authorId: author.id,
        authorFid: author.fid,
        authorUsername: author.username,
        authorPfpUrl: author.pfp_url,
        likes: 0,
        dislikes: 0,
        books: guideData.books.map((b, i) => ({ ...b, id: Date.now() + i, likes: 0, dislikes: 0 })),
    };
    guidesDB.push(newGuide);
    return Promise.resolve(JSON.parse(JSON.stringify(newGuide)));
};

export const updateGuide = async (id: number, guideData: Partial<Guide>): Promise<Guide> => {
    console.log("MOCK: Updating guide ID:", id);
    let updatedGuide: Guide | undefined;
    guidesDB = guidesDB.map(guide => {
        if (guide.id === id) {
            updatedGuide = { 
                ...guide, 
                ...guideData,
                // Ensure books have IDs if they are new
                books: (guideData.books || guide.books).map((b, i) => ({...b, id: b.id || Date.now() + i}))
            };
            return updatedGuide;
        }
        return guide;
    });

    if (!updatedGuide) {
        throw new Error("MOCK: Guide not found for update.");
    }
    return Promise.resolve(JSON.parse(JSON.stringify(updatedGuide)));
};


export const deleteGuide = async (id: number): Promise<{ success: boolean }> => {
    console.log("MOCK: Deleting guide ID:", id);
    const initialLength = guidesDB.length;
    guidesDB = guidesDB.filter(guide => guide.id !== id);
    const success = guidesDB.length < initialLength;
    return Promise.resolve({ success });
};


// =================================================================================
// INTERACTION OPERATIONS (MOCKED)
// =================================================================================

const toggleInteraction = async (entity: 'guide' | 'book', entityId: number, type: 'like' | 'dislike'): Promise<void> => {
    const stateMap = entity === 'guide' ? interactionState.guides : interactionState.books;
    const currentState = stateMap.get(entityId);
    
    guidesDB = guidesDB.map(guide => {
        const updateBookOrGuide = (item: Guide | Book) => {
            if (currentState === type) { // Undoing action
                if (type === 'like') item.likes--;
                else item.dislikes--;
                stateMap.delete(entityId);
            } else { // New action
                if (currentState === 'like') item.likes--;
                if (currentState === 'dislike') item.dislikes--;
                if (type === 'like') item.likes++;
                else item.dislikes++;
                stateMap.set(entityId, type);
            }
        };

        if (entity === 'guide' && guide.id === entityId) {
            updateBookOrGuide(guide);
        } else if (entity === 'book') {
            guide.books = guide.books.map(book => {
                if (book.id === entityId) {
                    updateBookOrGuide(book);
                }
                return book;
            });
        }
        return guide;
    });

    return Promise.resolve();
};

export const likeGuide = async (id: number): Promise<void> => toggleInteraction('guide', id, 'like');
export const unlikeGuide = async (id: number): Promise<void> => toggleInteraction('guide', id, 'like');
export const dislikeGuide = async (id: number): Promise<void> => toggleInteraction('guide', id, 'dislike');
export const undislikeGuide = async (id: number): Promise<void> => toggleInteraction('guide', id, 'dislike');

export const likeBook = async (bookId: number): Promise<void> => toggleInteraction('book', bookId, 'like');
export const unlikeBook = async (bookId: number): Promise<void> => toggleInteraction('book', bookId, 'like');
export const dislikeBook = async (bookId: number): Promise<void> => toggleInteraction('book', bookId, 'dislike');
export const undislikeBook = async (bookId: number): Promise<void> => toggleInteraction('book', bookId, 'dislike');


// =================================================================================
// STATUS CHECK OPERATIONS (MOCKED)
// =================================================================================
export const isGuideLiked = async (id: number): Promise<boolean> => Promise.resolve(interactionState.guides.get(id) === 'like');
export const isGuideDisliked = async (id: number): Promise<boolean> => Promise.resolve(interactionState.guides.get(id) === 'dislike');

export const getBookLikeStatusForGuide = async (guide: Guide): Promise<Record<number, boolean>> => {
    const status: Record<number, boolean> = {};
    guide.books.forEach(book => {
        status[book.id] = interactionState.books.get(book.id) === 'like';
    });
    return Promise.resolve(status);
};

export const getBookDislikeStatusForGuide = async (guide: Guide): Promise<Record<number, boolean>> => {
    const status: Record<number, boolean> = {};
    guide.books.forEach(book => {
        status[book.id] = interactionState.books.get(book.id) === 'dislike';
    });
    return Promise.resolve(status);
};