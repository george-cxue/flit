import { League, User } from '@/src/types/fantasy';

export const MOCK_USER: User = {
    id: 'user_1',
    username: '@alex',
    name: 'Alex',
    avatar: '😊',
    completedLessons: ['lesson_basics'], // Only basics completed
};

export const MOCK_MEMBERS: User[] = [
    MOCK_USER,
    { id: 'user_2', username: '@sarahc', name: 'Sarah Chen', avatar: '👩‍💼', completedLessons: [] },
    { id: 'user_3', username: '@marcusj', name: 'Marcus Johnson', avatar: '👨‍💻', completedLessons: [] },
    { id: 'user_4', username: '@emmar', name: 'Emma Rodriguez', avatar: '👩‍🎓', completedLessons: [] },
];

export const MOCK_LEAGUES: League[] = [
    {
        id: 'league_1',
        name: 'Diamond League',
        adminUserId: 'user_2',
        members: MOCK_MEMBERS,
        status: 'active',
        currentWeek: 3,
        settings: {
            seasonLength: 10,
            portfolioSize: 10,
            activeSlots: 7,
            benchSlots: 3,
            scoringMethod: 'Total Return %',
            enabledAssetClasses: ['Stock', 'ETF', 'Crypto'],
            draftType: 'Snake',
            draftDate: '2025-11-01T10:00:00Z',
        },
    },
    {
        id: 'league_2',
        name: 'Crypto Kings',
        adminUserId: 'user_1',
        members: MOCK_MEMBERS,
        status: 'pre-draft',
        currentWeek: 0,
        settings: {
            seasonLength: 8,
            portfolioSize: 5,
            activeSlots: 5,
            benchSlots: 0,
            scoringMethod: 'Absolute Gain $',
            enabledAssetClasses: ['Crypto'],
            draftType: 'Auction',
            draftDate: '2025-12-01T18:00:00Z',
        },
    },
];
