import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
  Linking,
  RefreshControl,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { WatchlistService } from '@/src/services/watchlistService';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthContext } from '@/contexts/auth-context';

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

type SortOption = 'symbol' | 'price' | 'change' | 'changePercent';

export default function ExploreScreen() {
  const { isLoaded, isSignedIn, userId } = useAuthContext();
  
  const [newsSymbol, setNewsSymbol] = useState('');
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [newsSearchResults, setNewsSearchResults] = useState<any[]>([]);
  
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loadingWatchlist, setLoadingWatchlist] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchingStocks, setSearchingStocks] = useState(false);
  
  const [sortBy, setSortBy] = useState<SortOption>('symbol');
  const [sortAscending, setSortAscending] = useState(true);

  const primaryColor = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');

  // Fetch watchlist on mount and when screen gains focus - only if authenticated with backend userId
  useFocusEffect(
    useCallback(() => {
      if (isLoaded && isSignedIn && userId) {
        fetchWatchlist();
      }
    }, [isLoaded, isSignedIn, userId])
  );

  const fetchWatchlist = async () => {
    try {
      setLoadingWatchlist(true);
      const data = await WatchlistService.getWatchlist();
      setWatchlist(data);
    } catch (error) {
      console.error('Failed to fetch watchlist:', error);
    } finally {
      setLoadingWatchlist(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWatchlist();
    if (newsSymbol) {
      await searchNews();
    }
    setRefreshing(false);
  };

  const searchNews = async () => {
    if (!newsSymbol.trim()) return;

    try {
      setLoadingNews(true);
      setNewsSearchResults([]); // Clear search results when searching
      const articles = await WatchlistService.getStockNews(newsSymbol.trim());
      setNews(articles);
    } catch (error) {
      console.error('Failed to fetch news:', error);
      setNews([]);
    } finally {
      setLoadingNews(false);
    }
  };

  const searchNewsSymbols = async (query: string) => {
    setNewsSymbol(query);
    
    if (!query.trim()) {
      setNewsSearchResults([]);
      setNews([]); // Also clear news articles when search is cleared
      return;
    }

    try {
      const results = await WatchlistService.searchStocks(query);
      setNewsSearchResults(results);
    } catch (error) {
      console.error('Failed to search stocks for news:', error);
      setNewsSearchResults([]);
    }
  };

  const selectNewsSymbol = async (symbol: string, description: string) => {
    setNewsSymbol(symbol);
    setNewsSearchResults([]);
    // Automatically fetch news for selected symbol
    try {
      setLoadingNews(true);
      const articles = await WatchlistService.getStockNews(symbol);
      setNews(articles);
    } catch (error) {
      console.error('Failed to fetch news:', error);
      setNews([]);
    } finally {
      setLoadingNews(false);
    }
  };

  const searchStocks = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchingStocks(true);
      const results = await WatchlistService.searchStocks(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Failed to search stocks:', error);
      setSearchResults([]);
    } finally {
      setSearchingStocks(false);
    }
  };

  const addToWatchlist = async (symbol: string) => {
    try {
      await WatchlistService.addToWatchlist(symbol);
      await fetchWatchlist();
      setSearchQuery('');
      setSearchResults([]);
    } catch (error: any) {
      console.error('Failed to add to watchlist:', error);
      alert(error.response?.data?.error || 'Failed to add to watchlist');
    }
  };

  const removeFromWatchlist = async (id: string) => {
    try {
      await WatchlistService.removeFromWatchlist(id);
      setWatchlist(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Failed to remove from watchlist:', error);
      alert('Failed to remove from watchlist');
    }
  };

  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortAscending(!sortAscending);
    } else {
      setSortBy(option);
      setSortAscending(true);
    }
  };

  const getSortedWatchlist = () => {
    const sorted = [...watchlist].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'symbol':
          comparison = a.symbol.localeCompare(b.symbol);
          break;
        case 'price':
          comparison = a.currentPrice - b.currentPrice;
          break;
        case 'change':
          comparison = a.change - b.change;
          break;
        case 'changePercent':
          comparison = a.changePercent - b.changePercent;
          break;
      }
      
      return sortAscending ? comparison : -comparison;
    });
    
    return sorted;
  };

  // Show loading state while authentication is initializing
  if (!isLoaded || (isSignedIn && !userId)) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centerLoadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <ThemedText style={{ marginTop: 12 }}>Loading...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  // Show message if not signed in
  if (!isSignedIn) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centerLoadingContainer}>
          <ThemedText type="subtitle">Please sign in to access Explore</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title">Explore</ThemedText>
        </View>

        {/* News Search Section */}
        <View style={[styles.section, { backgroundColor: cardBg, borderColor }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Stock News</ThemedText>
          <View style={styles.searchContainer}>
            <View style={styles.searchIconWrapper}>
              <IconSymbol name="magnifyingglass" size={18} color="#999" />
            </View>
            <TextInput
              style={[styles.searchInputWithIcon, { backgroundColor: cardBg, borderColor, color: textColor }]}
              placeholder="Enter stock symbol (e.g., AAPL)"
              placeholderTextColor="#999"
              value={newsSymbol}
              onChangeText={searchNewsSymbols}
              autoCapitalize="characters"
              onSubmitEditing={searchNews}
            />
            <TouchableOpacity
              style={[styles.searchButton, { backgroundColor: primaryColor }]}
              onPress={searchNews}
            >
              <IconSymbol name="arrow.right" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* News Symbol Search Results */}
          {newsSearchResults.length > 0 && (
            <View style={[styles.searchResultsContainer, { borderColor, backgroundColor: cardBg }]}>
              <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={true}>
                {newsSearchResults.map((result) => (
                  <TouchableOpacity
                    key={result.symbol}
                    style={[styles.searchResultItem, { borderBottomColor: borderColor }]}
                    onPress={() => selectNewsSymbol(result.symbol, result.description)}
                  >
                    <View>
                      <ThemedText style={styles.searchResultSymbol}>{result.symbol}</ThemedText>
                      <ThemedText style={styles.searchResultName} numberOfLines={1}>
                        {result.description}
                      </ThemedText>
                    </View>
                    <IconSymbol name="arrow.right" size={20} color={primaryColor} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {loadingNews && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={primaryColor} />
            </View>
          )}

          {!loadingNews && news.length > 0 && (
            <View style={styles.newsContainer}>
              {news.slice(0, 5).map((article) => (
                <TouchableOpacity
                  key={article.id}
                  style={[styles.newsCard, { borderColor }]}
                  onPress={() => Linking.openURL(article.url)}
                >
                  <View style={styles.newsContent}>
                    <ThemedText style={styles.newsHeadline} numberOfLines={2}>
                      {article.headline}
                    </ThemedText>
                    <ThemedText style={styles.newsSource}>
                      {article.source || 'Unknown'}{' • '}{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Unknown date'}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {!loadingNews && newsSymbol && news.length === 0 && (
            <ThemedText style={styles.noResults}>No news articles found</ThemedText>
          )}
        </View>

        {/* Watchlist Section */}
        <View style={[styles.section, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.watchlistHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>My Watchlist</ThemedText>
            <ThemedText style={styles.watchlistCount}>
              {watchlist.length} {watchlist.length === 1 ? 'stock' : 'stocks'}
            </ThemedText>
          </View>

          {/* Add to Watchlist Search */}
          <View style={styles.searchContainer}>
            <View style={styles.searchIconWrapper}>
              <IconSymbol name="magnifyingglass" size={18} color="#999" />
            </View>
            <TextInput
              style={[styles.searchInputWithIcon, { backgroundColor: cardBg, borderColor, color: textColor }]}
              placeholder="Search stocks to add..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={searchStocks}
              autoCapitalize="characters"
              onSubmitEditing={() => searchStocks(searchQuery)}
            />
            <TouchableOpacity
              style={[styles.searchButton, { backgroundColor: primaryColor }]}
              onPress={() => searchStocks(searchQuery)}
            >
              <IconSymbol name="arrow.right" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <View style={[styles.searchResultsContainer, { borderColor, backgroundColor: cardBg }]}>
              <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={true}>
                {searchResults.map((result) => (
                  <TouchableOpacity
                    key={result.symbol}
                    style={[styles.searchResultItem, { borderBottomColor: borderColor }]}
                    onPress={() => addToWatchlist(result.symbol)}
                  >
                    <View>
                      <ThemedText style={styles.searchResultSymbol}>{result.symbol}</ThemedText>
                      <ThemedText style={styles.searchResultName} numberOfLines={1}>
                        {result.description}
                      </ThemedText>
                    </View>
                    <IconSymbol name="plus.circle.fill" size={24} color={primaryColor} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Sort Options */}
          {watchlist.length > 0 && (
            <View style={styles.sortContainer}>
              <ThemedText style={styles.sortLabel}>Sort by:</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortButtons}>
                {[
                  { key: 'symbol' as SortOption, label: 'Symbol' },
                  { key: 'price' as SortOption, label: 'Price' },
                  { key: 'change' as SortOption, label: 'Change $' },
                  { key: 'changePercent' as SortOption, label: 'Change %' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.sortButton,
                      { borderColor },
                      sortBy === option.key && { backgroundColor: primaryColor, borderColor: primaryColor },
                    ]}
                    onPress={() => handleSort(option.key)}
                  >
                    <ThemedText
                      style={[
                        styles.sortButtonText,
                        sortBy === option.key && styles.sortButtonTextActive,
                      ]}
                    >
                      {option.label + (sortBy === option.key ? (sortAscending ? ' ↑' : ' ↓') : '')}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Watchlist */}
          {loadingWatchlist && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={primaryColor} />
            </View>
          )}

          {!loadingWatchlist && watchlist.length === 0 && (
            <View style={styles.emptyState}>
              <IconSymbol name="star" size={48} color="#999" />
              <ThemedText style={styles.emptyText}>Your watchlist is empty</ThemedText>
              <ThemedText style={styles.emptyHint}>Search for stocks above to add them</ThemedText>
            </View>
          )}

          {!loadingWatchlist && watchlist.length > 0 && (
            <View style={styles.watchlistContainer}>
              {getSortedWatchlist().map((item) => (
                <View key={item.id} style={[styles.watchlistItem, { borderBottomColor: borderColor }]}>
                  <View style={styles.watchlistItemLeft}>
                    <View>
                      <ThemedText style={styles.watchlistSymbol}>{item.symbol}</ThemedText>
                      <ThemedText style={styles.watchlistName} numberOfLines={1}>
                        {item.name}
                      </ThemedText>
                    </View>
                  </View>
                  <View style={styles.watchlistItemRight}>
                    <ThemedText style={styles.watchlistPrice}>
                      ${(item.currentPrice || 0).toFixed(2)}
                    </ThemedText>
                    <View style={styles.watchlistChange}>
                      <ThemedText
                        style={[
                          styles.watchlistChangeText,
                          { color: (item.change || 0) >= 0 ? '#4CAF50' : '#F44336' },
                        ]}
                      >
                        {((item.change || 0) >= 0 ? '+$' : '-$') + Math.abs(item.change || 0).toFixed(2)}
                      </ThemedText>
                      <ThemedText
                        style={[
                          styles.watchlistChangePercent,
                          { color: (item.changePercent || 0) >= 0 ? '#4CAF50' : '#F44336' },
                        ]}
                      >
                        ({((item.changePercent || 0) >= 0 ? '+' : '') + (item.changePercent || 0).toFixed(2)}%)
                      </ThemedText>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeFromWatchlist(item.id)}
                  >
                    <IconSymbol name="xmark.circle.fill" size={24} color="#F44336" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  searchInputWithIcon: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 40,
    paddingRight: 12,
    fontSize: 16,
  },
  searchIconWrapper: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
    height: 44,
    justifyContent: 'center',
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchLoader: {
    position: 'absolute',
    right: 12,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  newsContainer: {
    gap: 12,
  },
  newsCard: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  newsContent: {
    gap: 8,
  },
  newsHeadline: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  newsSource: {
    fontSize: 12,
    opacity: 0.6,
  },
  noResults: {
    textAlign: 'center',
    opacity: 0.6,
    paddingVertical: 16,
  },
  watchlistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  watchlistCount: {
    fontSize: 14,
    opacity: 0.6,
  },
  searchResultsContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  searchResultSymbol: {
    fontSize: 16,
    fontWeight: '600',
  },
  searchResultName: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  sortContainer: {
    marginBottom: 16,
  },
  sortLabel: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 8,
  },
  sortButtons: {
    flexDirection: 'row',
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  sortButtonText: {
    fontSize: 12,
  },
  sortButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptyHint: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 4,
  },
  watchlistContainer: {
    gap: 0,
  },
  watchlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  watchlistItemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  watchlistSymbol: {
    fontSize: 16,
    fontWeight: '700',
  },
  watchlistName: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  watchlistItemRight: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  watchlistPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  watchlistChange: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 2,
  },
  watchlistChangeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  watchlistChangePercent: {
    fontSize: 12,
    fontWeight: '600',
  },
  removeButton: {
    padding: 4,
  },
  centerLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
});
