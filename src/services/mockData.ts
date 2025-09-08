import { Guide, User, Activity } from '../types';

// Based on docs/db/scripts/seed.md

export const MOCK_USERS: Record<string, Omit<User, 'email'>> = {
    '4cd58ff3-fa6a-4ab0-80bc-e0cc22730778': { id: '4cd58ff3-fa6a-4ab0-80bc-e0cc22730778', username: 'farcaster.eth', pfp_url: 'https://i.imgur.com/34Iodlt.jpg', fid: 1 },
    '8126631d-d609-4b10-8406-1ad28db214e8': { id: '8126631d-d609-4b10-8406-1ad28db214e8', username: 'Sci-Fi Reader', pfp_url: 'https://i.imgur.com/PC3e8NJ.jpg', fid: 2 },
    'a7b8e966-a865-4567-9bdf-2639417da534': { id: 'a7b8e966-a865-4567-9bdf-2639417da534', username: 'Literary Bookworm', pfp_url: 'https://i.imgur.com/J3G59bK.jpg', fid: 3 },
    '56e9561b-f708-43d1-ac23-9ee1b3be095c': { id: '56e9561b-f708-43d1-ac23-9ee1b3be095c', username: 'philosopher_king', pfp_url: 'https://i.imgur.com/mQkmy0N.jpg', fid: 4 },
    '15fef28f-4627-4db5-821f-697692f18f7c': { id: '15fef28f-4627-4db5-821f-697692f18f7c', username: 'startup_guru', pfp_url: 'https://i.imgur.com/T0a0bA0.jpg', fid: 5 },
    '1c10d98f-df53-4ec2-9765-c3967c4451d6': { id: '1c10d98f-df53-4ec2-9765-c3967c4451d6', username: 'comic_nerd', pfp_url: 'https://i.imgur.com/vH5y5Z5.jpg', fid: 6 },
    'ef4ef7fd-ade7-43d7-85d2-04c3f55ed27c': { id: 'ef4ef7fd-ade7-43d7-85d2-04c3f55ed27c', username: 'Tche Foundation', pfp_url: 'https://i.imgur.com/d28d83A.png', fid: 7 }
};

export const LOGGED_IN_USER_ID = '4cd58ff3-fa6a-4ab0-80bc-e0cc22730778'; // farcaster.eth

const getAuthorDetails = (authorId: string) => {
    const author = MOCK_USERS[authorId] || { id: 'unknown', username: 'Unknown', pfp_url: 'https://i.imgur.com/PC3e8NJ.jpg', fid: 0 };
    return {
        authorId,
        authorFid: author.fid,
        authorUsername: author.username,
        authorPfpUrl: author.pfp_url
    };
};

export let MOCK_GUIDES: Guide[] = [
    {
        id: 1,
        title: 'Essential Sci-Fi Classics',
        description: 'A journey through the golden age of science fiction, featuring timeless works that shaped the genre.',
        createdAt: '2024-01-15T00:00:00Z',
        isPublic: true,
        tags: ['sci-fi', 'classic', 'world-building'],
        ...getAuthorDetails('8126631d-d609-4b10-8406-1ad28db214e8'),
        likes: 3,
        dislikes: 0,
        books: [
            { id: 1, title: 'Dune', author: 'Frank Herbert', notes: 'Focus on world-building and politics.', coverUrl: 'https://i.imgur.com/sBwQ4yL.jpg', purchaseLink: '#', likes: 1, dislikes: 1 },
            { id: 2, title: 'Foundation', author: 'Isaac Asimov', notes: 'A story spanning centuries.', coverUrl: 'https://i.imgur.com/s4n7vVv.jpg', purchaseLink: undefined, likes: 1, dislikes: 0 },
        ]
    },
    {
        id: 2,
        title: 'Modern Literary Fiction',
        description: 'Contemporary novels that have redefined storytelling in the 21st century.',
        createdAt: '2024-01-14T00:00:00Z',
        isPublic: true,
        tags: ['fiction', 'modern', 'fantasy'],
        ...getAuthorDetails('a7b8e966-a865-4567-9bdf-2639417da534'),
        likes: 1,
        dislikes: 1,
        books: [
            { id: 3, title: 'The Name of the Wind', author: 'Patrick Rothfuss', likes: 0, dislikes: 0 },
            { id: 4, title: 'Mistborn: The Final Empire', author: 'Brandon Sanderson', likes: 0, dislikes: 0 },
        ]
    },
    {
        id: 3,
        title: 'My Private Reading List',
        description: 'A few books I plan to read this quarter. Not for public viewing yet.',
        createdAt: new Date().toISOString(),
        isPublic: false,
        tags: ['personal', 'to-read'],
        ...getAuthorDetails('4cd58ff3-fa6a-4ab0-80bc-e0cc22730778'),
        likes: 0,
        dislikes: 0,
        books: [
            { id: 6, title: 'Project Hail Mary', author: 'Andy Weir', likes: 0, dislikes: 0 },
        ]
    },
    {
        id: 4,
        title: 'Philosophy 101: The Stoics',
        description: 'An introductory guide to the teachings of Seneca, Epictetus, and Marcus Aurelius.',
        createdAt: '2024-03-10T00:00:00Z',
        isPublic: true,
        tags: ['philosophy', 'stoicism', 'self-improvement'],
        ...getAuthorDetails('56e9561b-f708-43d1-ac23-9ee1b3be095c'),
        likes: 4,
        dislikes: 0,
        books: [
            { id: 7, title: 'Meditations', author: 'Marcus Aurelius', coverUrl: 'https://i.imgur.com/e8p2t5L.jpg', likes: 2, dislikes: 0 },
            { id: 8, title: 'Letters from a Stoic', author: 'Seneca', purchaseLink: '#', likes: 0, dislikes: 0 },
        ]
    },
    {
        id: 5,
        title: 'Startup Playbook: From Idea to Exit',
        description: 'Key readings for aspiring founders, covering product management, fundraising, and scaling a business.',
        createdAt: '2024-04-20T00:00:00Z',
        isPublic: true,
        tags: ['business', 'startup', 'entrepreneurship'],
        ...getAuthorDetails('15fef28f-4627-4db5-821f-697692f18f7c'),
        likes: 1,
        dislikes: 0,
        books: [
            { id: 9, title: 'The Lean Startup', author: 'Eric Ries', coverUrl: 'https://i.imgur.com/L4u2X7L.jpg', likes: 0, dislikes: 0 },
            { id: 10, title: 'Zero to One', author: 'Peter Thiel', coverUrl: 'https://i.imgur.com/7vY5rWb.jpg', likes: 2, dislikes: 0 },
        ]
    },
    {
        id: 6,
        title: 'Beyond Superheroes: A Graphic Novel Tour',
        description: 'Explore the depth and diversity of graphic novels with these critically acclaimed stories.',
        createdAt: '2024-05-01T00:00:00Z',
        isPublic: true,
        tags: ['graphic novel', 'comics', 'storytelling'],
        ...getAuthorDetails('1c10d98f-df53-4ec2-9765-c3967c4451d6'),
        likes: 1,
        dislikes: 1,
        books: [
            { id: 11, title: 'Maus', author: 'Art Spiegelman', coverUrl: 'https://i.imgur.com/G4Y2H8d.jpg', likes: 0, dislikes: 0 },
            { id: 12, title: 'Persepolis', author: 'Marjane Satrapi', coverUrl: 'https://i.imgur.com/w9vA9oK.jpg', likes: 0, dislikes: 0 },
            { id: 13, title: 'Watchmen', author: 'Alan Moore', coverUrl: 'https://i.imgur.com/h9yV3T5.jpg', likes: 2, dislikes: 1 },
        ]
    },
];

export let MOCK_ACTIVITIES: Activity[] = [
    { action: 'Liked', itemTitle: 'Essential Sci-Fi Classics', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { action: 'Shared', itemTitle: 'Startup Playbook: From Idea to Exit', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
    { action: 'Liked', itemTitle: 'Philosophy 101: The Stoics', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { action: 'Disliked', itemTitle: 'Modern Literary Fiction', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
];