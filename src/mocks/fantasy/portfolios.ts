import { Portfolio, PortfolioSlot } from '@/src/types/fantasy';
import { MOCK_ASSETS } from './assets';

const createSlot = (id: string, assetId: string, status: 'ACTIVE' | 'BENCH', price: number, value: number): PortfolioSlot => {
    const asset = MOCK_ASSETS.find(a => a.id === assetId);
    return {
        id,
        assetId,
        asset,
        status,
        acquiredAt: '2025-11-01T10:30:00Z',
        purchasePrice: price,
        currentValue: value,
        gainLossPercent: ((value - price) / price) * 100,
    };
};

export const MOCK_PORTFOLIOS: Portfolio[] = [
    {
        id: 'portfolio_1',
        leagueId: 'league_1',
        userId: 'user_1', // Current User
        name: 'To The Moon',
        totalValue: 12500,
        weeklyReturn: 2.4,
        slots: [
            createSlot('slot_1', '1', 'ACTIVE', 180.00, 185.64), // AAPL
            createSlot('slot_2', '3', 'ACTIVE', 390.00, 402.12), // MSFT
            createSlot('slot_3', '2', 'ACTIVE', 490.00, 498.32), // SPY
            createSlot('slot_4', '6', 'BENCH', 60000.00, 64230.50), // BTC (Bench)
        ],
    },
    {
        id: 'portfolio_2',
        leagueId: 'league_1',
        userId: 'user_2',
        name: 'Safe Haven',
        totalValue: 11800,
        weeklyReturn: 1.1,
        slots: [
            createSlot('slot_5', '2', 'ACTIVE', 485.00, 498.32), // SPY
        ],
    },
];
