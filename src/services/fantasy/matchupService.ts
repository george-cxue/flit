import { MOCK_MATCHUPS } from '@/src/mocks/fantasy/matchups';
import { Matchup } from '@/src/types/fantasy';

const DELAY_MS = 500;
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const MatchupService = {
    getCurrentMatchup: async (leagueId: string): Promise<Matchup | undefined> => {
        await delay(DELAY_MS);
        // For mock purposes, return the first matchup for the league involving the current user
        return MOCK_MATCHUPS.find(m => m.leagueId === leagueId && (m.userAId === 'user_1' || m.userBId === 'user_1'));
    },

    getMatchupsByWeek: async (leagueId: string, week: number): Promise<Matchup[]> => {
        await delay(DELAY_MS);
        return MOCK_MATCHUPS.filter(m => m.leagueId === leagueId && m.week === week);
    },
};
