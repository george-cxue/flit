import { apiClient, getAuthenticatedUserId } from './api';

interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  addedAt: Date;
}

interface NewsArticle {
  id: number;
  headline: string;
  summary: string;
  source: string;
  url: string;
  image: string;
  publishedAt: Date;
  ticker: string;
}

interface StockSearchResult {
  symbol: string;
  description: string;
  type: string;
}

export const WatchlistService = {
  /**
   * Get user's watchlist with current prices
   */
  getWatchlist: async (): Promise<WatchlistItem[]> => {
    try {
      const userId = getAuthenticatedUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const response = await apiClient.get('/watchlist', {
        params: { userId }
      });
      
      return response.data.map((item: any) => ({
        ...item,
        addedAt: new Date(item.addedAt)
      }));
    } catch (error: any) {
      console.error('Failed to fetch watchlist:', error);
      throw error;
    }
  },

  /**
   * Add a stock to watchlist
   */
  addToWatchlist: async (symbol: string): Promise<WatchlistItem> => {
    try {
      const userId = getAuthenticatedUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const response = await apiClient.post('/watchlist', {
        userId,
        symbol: symbol.toUpperCase()
      });

      return {
        ...response.data,
        addedAt: new Date(response.data.addedAt)
      };
    } catch (error: any) {
      console.error('Failed to add to watchlist:', error);
      throw error;
    }
  },

  /**
   * Remove a stock from watchlist
   */
  removeFromWatchlist: async (id: string): Promise<void> => {
    try {
      const userId = getAuthenticatedUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      await apiClient.delete(`/watchlist/${id}`, {
        data: { userId }
      });
    } catch (error: any) {
      console.error('Failed to remove from watchlist:', error);
      throw error;
    }
  },

  /**
   * Search for stocks
   */
  searchStocks: async (query: string): Promise<StockSearchResult[]> => {
    try {
      if (!query || query.trim().length === 0) {
        return [];
      }

      const response = await apiClient.get('/watchlist/search', {
        params: { query: query.trim() }
      });

      return response.data;
    } catch (error: any) {
      console.error('Failed to search stocks:', error);
      return [];
    }
  },

  /**
   * Get news articles for a stock
   */
  getStockNews: async (symbol: string, from?: string, to?: string): Promise<NewsArticle[]> => {
    try {
      const params: any = {};
      if (from) params.from = from;
      if (to) params.to = to;

      const response = await apiClient.get(`/watchlist/news/${symbol.toUpperCase()}`, {
        params
      });

      return response.data.map((article: any) => ({
        ...article,
        publishedAt: new Date(article.publishedAt)
      }));
    } catch (error: any) {
      console.error('Failed to fetch stock news:', error);
      return [];
    }
  },
};
