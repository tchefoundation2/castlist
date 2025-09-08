
export interface User {
  id: string; // UUID from auth.users
  email?: string;
  fid: number | null;
  username: string;
  pfp_url: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  notes?: string;
  coverUrl?: string;
  purchaseLink?: string;
  likes: number;
  dislikes: number;
}

export interface Guide {
  id: number;
  // FIX: Added authorId to the Guide interface to align the type with its usage throughout the application.
  authorId: string;
  title: string;
  description: string;
  books: Book[];
  authorFid: number | null;
  authorUsername: string;
  authorPfpUrl: string;
  createdAt: string;
  isPublic: boolean;
  likes: number;
  dislikes: number;
  tags: string[];
}

export interface Activity {
  action: string;
  itemTitle: string;
  timestamp: string;
}

export enum Page {
  Home = 'HOME', // Discover page
  MyGuides = 'MY_GUIDES',
  Create = 'CREATE',
  Profile = 'PROFILE',
  Ranking = 'RANKING',
  GuideDetail = 'GUIDE_DETAIL',
  EditGuide = 'EDIT_GUIDE',
  ShareOptions = 'SHARE_OPTIONS',
  ShareRanking = 'SHARE_RANKING',
  FarcasterTest = 'FARCASTER_TEST',
}
