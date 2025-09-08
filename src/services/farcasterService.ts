// Farcaster API Service
// Using the official Farcaster API with your API key

const FARCASTER_API_KEY = 'wc_secret_a42c4d96bfd9e08dfdf803e8d9e0907073dd8e01390bf3f22ea8bb43_83f487fb';
const FARCASTER_API_BASE = 'https://api.warpcast.com/v2';

export interface FarcasterUser {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  bio: string;
  follower_count: number;
  following_count: number;
  verified_addresses: string[];
}

export interface FarcasterCast {
  hash: string;
  text: string;
  author: FarcasterUser;
  timestamp: string;
  replies: { count: number };
  reactions: { count: number };
  recasts: { count: number };
  embeds?: Array<{
    url?: string;
    cast_id?: {
      hash: string;
      fid: number;
    };
  }>;
}

export interface FarcasterApiResponse<T> {
  result: T;
  next?: {
    cursor: string;
  };
}

// Get user by FID
export const getFarcasterUser = async (fid: number): Promise<FarcasterUser | null> => {
  try {
    const response = await fetch(`${FARCASTER_API_BASE}/user?fid=${fid}`, {
      headers: {
        'Authorization': `Bearer ${FARCASTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: FarcasterApiResponse<{ user: FarcasterUser }> = await response.json();
    return data.result.user;
  } catch (error) {
    console.error('Error fetching Farcaster user:', error);
    return null;
  }
};

// Get user's casts
export const getUserCasts = async (fid: number, limit: number = 25): Promise<FarcasterCast[]> => {
  try {
    const response = await fetch(`${FARCASTER_API_BASE}/casts?fid=${fid}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${FARCASTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: FarcasterApiResponse<{ casts: FarcasterCast[] }> = await response.json();
    return data.result.casts;
  } catch (error) {
    console.error('Error fetching user casts:', error);
    return [];
  }
};

// Search users by username (using known FIDs as fallback)
export const searchFarcasterUsers = async (query: string, limit: number = 10): Promise<FarcasterUser[]> => {
  try {
    // Since the API doesn't have a search endpoint, we'll use a predefined list of popular users
    // and filter by username match
    const popularFIDs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]; // Popular FIDs
    
    const searchPromises = popularFIDs.slice(0, limit * 2).map(fid => getFarcasterUser(fid));
    const users = await Promise.all(searchPromises);
    
    // Filter users that match the query
    const filteredUsers = users
      .filter((user): user is FarcasterUser => user !== null && (
        user.username.toLowerCase().includes(query.toLowerCase()) ||
        user.display_name.toLowerCase().includes(query.toLowerCase())
      ))
      .slice(0, limit);
    
    return filteredUsers;
  } catch (error) {
    console.error('Error searching Farcaster users:', error);
    return [];
  }
};

// Get trending casts (using popular users' casts as fallback)
export const getTrendingCasts = async (limit: number = 25): Promise<FarcasterCast[]> => {
  try {
    // Since the API doesn't have a trending endpoint, we'll get casts from popular users
    const popularFIDs = [1, 2, 3, 4, 5]; // Add more FIDs as needed
    
    const castPromises = popularFIDs.map(fid => getUserCasts(fid, Math.ceil(limit / popularFIDs.length)));
    const castArrays = await Promise.all(castPromises);
    
    // Flatten and sort by reactions count
    const allCasts = castArrays.flat();
    const sortedCasts = allCasts
      .sort((a, b) => b.reactions.count - a.reactions.count)
      .slice(0, limit);
    
    return sortedCasts;
  } catch (error) {
    console.error('Error fetching trending casts:', error);
    return [];
  }
};

// Create a cast (requires additional setup for authentication)
export const createCast = async (text: string, parentHash?: string): Promise<FarcasterCast | null> => {
  try {
    const response = await fetch(`${FARCASTER_API_BASE}/casts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FARCASTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        parent: parentHash ? { hash: parentHash } : undefined,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: FarcasterApiResponse<{ cast: FarcasterCast }> = await response.json();
    return data.result.cast;
  } catch (error) {
    console.error('Error creating cast:', error);
    return null;
  }
};

// Get cast by hash
export const getCast = async (hash: string): Promise<FarcasterCast | null> => {
  try {
    const response = await fetch(`${FARCASTER_API_BASE}/cast?hash=${hash}`, {
      headers: {
        'Authorization': `Bearer ${FARCASTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: FarcasterApiResponse<{ cast: FarcasterCast }> = await response.json();
    return data.result.cast;
  } catch (error) {
    console.error('Error fetching cast:', error);
    return null;
  }
};

// Utility function to format cast for sharing
export const formatGuideAsCast = (guide: any): string => {
  const emoji = '📚';
  const hashtags = guide.tags?.map((tag: string) => `#${tag}`).join(' ') || '';
  
  return `${emoji} ${guide.title}

${guide.description}

${hashtags}

#Castlist #ReadingList`;
};

// Utility function to create a cast with guide data
export const shareGuideAsCast = async (guide: any): Promise<FarcasterCast | null> => {
  const castText = formatGuideAsCast(guide);
  return await createCast(castText);
};
