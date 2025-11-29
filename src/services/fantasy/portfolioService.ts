import { MOCK_PORTFOLIOS } from '@/src/mocks/fantasy/portfolios';
import { Portfolio } from '@/src/types/fantasy';

const DELAY_MS = 500;
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const PortfolioService = {
    getPortfolios: async (): Promise<Portfolio[]> => {
        await delay(DELAY_MS);
        return MOCK_PORTFOLIOS;
    },

    getPortfolioByLeagueId: async (leagueId: string): Promise<Portfolio | undefined> => {
        await delay(DELAY_MS);
        return MOCK_PORTFOLIOS.find(p => p.leagueId === leagueId && p.userId === 'user_1');
    },

    updateLineup: async (portfolioId: string, activeSlotIds: string[], benchSlotIds: string[]): Promise<void> => {
        await delay(DELAY_MS);
        console.log(`Updated lineup for ${portfolioId}: Active=${activeSlotIds}, Bench=${benchSlotIds}`);
    },
};
