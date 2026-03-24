import { apiClient } from './api';

export interface TrendingStock {
  id: string;
  ticker: string;
  name: string;
  currentPrice: number;
  previousClose: number;
  marketCap: number | null;
  sector: string | null;
  type: string;
  changePercent: number;
}

interface ExploreData {
  trendingStocks: TrendingStock[];
}

export const ExploreService = {
  getExploreData: async (): Promise<ExploreData> => {
    const response = await apiClient.get('/explore');
    return response.data;
  },
};
