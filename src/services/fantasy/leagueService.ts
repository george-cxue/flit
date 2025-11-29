import { MOCK_LEAGUES } from '@/src/mocks/fantasy/leagues';
import { League, LeagueSettings } from '@/src/types/fantasy';

const DELAY_MS = 500;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const LeagueService = {
    getLeagues: async (): Promise<League[]> => {
        await delay(DELAY_MS);
        return MOCK_LEAGUES;
    },

    getLeagueById: async (id: string): Promise<League | undefined> => {
        await delay(DELAY_MS);
        return MOCK_LEAGUES.find(l => l.id === id);
    },

    createLeague: async (name: string, settings: LeagueSettings): Promise<League> => {
        await delay(DELAY_MS);
        const newLeague: League = {
            id: `league_${Date.now()}`,
            name,
            adminUserId: 'user_1', // Current user
            members: [], // Start empty or with creator
            status: 'pre-draft',
            currentWeek: 0,
            settings,
        };
        // In a real app, we'd add this to the store/backend
        return newLeague;
    },
};
