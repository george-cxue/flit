import { MOCK_ASSETS } from '@/src/mocks/fantasy/assets';
import { Asset, DraftPick, DraftState } from '@/src/types/fantasy';

const DELAY_MS = 500;
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory mock state
let mockDraftState: DraftState = {
    leagueId: 'league_1',
    status: 'active',
    currentRound: 1,
    currentPickNumber: 1,
    currentUserId: 'user_1', // Starts with user 1
    picks: [],
    remainingTimeSeconds: 60,
};

export const DraftService = {
    getDraftState: async (leagueId: string): Promise<DraftState> => {
        await delay(DELAY_MS);
        return mockDraftState;
    },

    makePick: async (leagueId: string, assetId: string): Promise<DraftState> => {
        await delay(DELAY_MS);

        const pick: DraftPick = {
            round: mockDraftState.currentRound,
            pickNumber: mockDraftState.currentPickNumber,
            userId: mockDraftState.currentUserId,
            assetId,
            timestamp: new Date().toISOString(),
        };

        mockDraftState.picks.push(pick);

        // Advance pick
        mockDraftState.currentPickNumber++;
        // Simple round logic (assuming 4 users)
        if (mockDraftState.currentPickNumber > 4) {
            mockDraftState.currentRound++;
            mockDraftState.currentPickNumber = 1;
        }

        // Rotate user (simple round robin for mock)
        const memberIds = ['user_1', 'user_2', 'user_3', 'user_4'];
        const currentIndex = memberIds.indexOf(mockDraftState.currentUserId);
        const nextIndex = (currentIndex + 1) % memberIds.length;
        mockDraftState.currentUserId = memberIds[nextIndex];

        mockDraftState.remainingTimeSeconds = 60;

        return { ...mockDraftState };
    },

    getDraftableAssets: async (leagueId: string, query: string = ''): Promise<Asset[]> => {
        await delay(DELAY_MS);
        // Filter out already picked assets
        const pickedAssetIds = mockDraftState.picks.map(p => p.assetId);
        let available = MOCK_ASSETS.filter(a => !pickedAssetIds.includes(a.id));

        if (query) {
            const lowerQuery = query.toLowerCase();
            available = available.filter(a =>
                a.ticker.toLowerCase().includes(lowerQuery) ||
                a.name.toLowerCase().includes(lowerQuery)
            );
        }

        return available;
    }
};
