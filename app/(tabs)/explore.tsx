import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
  RefreshControl,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Typography, Radii, Spacing, AmbientShadow } from '@/constants/theme';
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
  const c = Colors.light;

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
      setNewsSearchResults([]);
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
      setNews([]);
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
        case 'symbol': comparison = a.symbol.localeCompare(b.symbol); break;
        case 'price': comparison = a.currentPrice - b.currentPrice; break;
        case 'change': comparison = a.change - b.change; break;
        case 'changePercent': comparison = a.changePercent - b.changePercent; break;
      }
      return sortAscending ? comparison : -comparison;
    });
    return sorted;
  };

  if (!isLoaded || (isSignedIn && !userId)) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centerLoadingContainer}>
          <ActivityIndicator size="large" color={c.primary} />
          <ThemedText type="body-md" style={{ marginTop: 12 }}>Loading...</ThemedText>
        </View>
      </ThemedView>
    );
  }

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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="headline-lg">Explore</ThemedText>
        </View>

        {/* News Search Section */}
        <View style={[styles.section, { backgroundColor: c.surfaceContainerLowest }]}>
          <ThemedText type="title-lg" style={styles.sectionTitle}>Stock News</ThemedText>
          <View style={styles.searchContainer}>
            <View style={styles.searchIconWrapper}>
              <IconSymbol name="magnifyingglass" size={18} color={c.onSurfaceVariant} />
            </View>
            <TextInput
              style={[styles.searchInputWithIcon, { backgroundColor: c.surfaceContainerHigh, color: c.onSurface }]}
              placeholder="Enter stock symbol (e.g., AAPL)"
              placeholderTextColor={c.onSurfaceVariant}
              value={newsSymbol}
              onChangeText={searchNewsSymbols}
              autoCapitalize="characters"
              onSubmitEditing={searchNews}
            />
            <TouchableOpacity
              style={[styles.searchButton, { backgroundColor: c.primary }]}
              onPress={searchNews}
            >
              <IconSymbol name="arrow.right" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* News Symbol Search Results */}
          {newsSearchResults.length > 0 && (
            <View style={[styles.searchResultsContainer, { backgroundColor: c.surfaceContainerLowest }]}>
              <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={true}>
                {newsSearchResults.map((result, idx) => (
                  <TouchableOpacity
                    key={result.symbol}
                    style={styles.searchResultItem}
                    onPress={() => selectNewsSymbol(result.symbol, result.description)}
                  >
                    {idx > 0 && <View style={styles.floatingDivider} />}
                    <View style={styles.searchResultInner}>
                      <View>
                        <ThemedText type="title-md" style={styles.searchResultSymbol}>{result.symbol}</ThemedText>
                        <ThemedText type="label-md" style={styles.searchResultName} numberOfLines={1}>
                          {result.description}
                        </ThemedText>
                      </View>
                      <IconSymbol name="arrow.right" size={20} color={c.primary} />
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {loadingNews && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={c.primary} />
            </View>
          )}

          {!loadingNews && news.length > 0 && (
            <View style={styles.newsContainer}>
              {news.slice(0, 5).map((article) => (
                <TouchableOpacity
                  key={article.id}
                  style={[styles.newsCard, { backgroundColor: c.surfaceContainerLow }]}
                  onPress={() => Linking.openURL(article.url)}
                >
                  <View style={styles.newsContent}>
                    <ThemedText type="title-md" style={styles.newsHeadline} numberOfLines={2}>
                      {article.headline}
                    </ThemedText>
                    <ThemedText type="label-md" style={styles.newsSource}>
                      {article.source || 'Unknown'}{' \u2022 '}{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Unknown date'}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {!loadingNews && newsSymbol && news.length === 0 && (
            <ThemedText type="body-md" style={styles.noResults}>No news articles found</ThemedText>
          )}
        </View>

        {/* Watchlist Section */}
        <View style={[styles.section, { backgroundColor: c.surfaceContainerLowest }]}>
          <View style={styles.watchlistHeader}>
            <ThemedText type="title-lg" style={styles.sectionTitle}>My Watchlist</ThemedText>
            <ThemedText type="label-md" style={styles.watchlistCount}>
              {watchlist.length} {watchlist.length === 1 ? 'stock' : 'stocks'}
            </ThemedText>
          </View>

          {/* Add to Watchlist Search */}
          <View style={styles.searchContainer}>
            <View style={styles.searchIconWrapper}>
              <IconSymbol name="magnifyingglass" size={18} color={c.onSurfaceVariant} />
            </View>
            <TextInput
              style={[styles.searchInputWithIcon, { backgroundColor: c.surfaceContainerHigh, color: c.onSurface }]}
              placeholder="Search stocks to add..."
              placeholderTextColor={c.onSurfaceVariant}
              value={searchQuery}
              onChangeText={searchStocks}
              autoCapitalize="characters"
              onSubmitEditing={() => searchStocks(searchQuery)}
            />
            <TouchableOpacity
              style={[styles.searchButton, { backgroundColor: c.primary }]}
              onPress={() => searchStocks(searchQuery)}
            >
              <IconSymbol name="arrow.right" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <View style={[styles.searchResultsContainer, { backgroundColor: c.surfaceContainerLowest }]}>
              <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={true}>
                {searchResults.map((result, idx) => (
                  <TouchableOpacity
                    key={result.symbol}
                    style={styles.searchResultItem}
                    onPress={() => addToWatchlist(result.symbol)}
                  >
                    {idx > 0 && <View style={styles.floatingDivider} />}
                    <View style={styles.searchResultInner}>
                      <View>
                        <ThemedText type="title-md" style={styles.searchResultSymbol}>{result.symbol}</ThemedText>
                        <ThemedText type="label-md" style={styles.searchResultName} numberOfLines={1}>
                          {result.description}
                        </ThemedText>
                      </View>
                      <IconSymbol name="plus.circle.fill" size={24} color={c.primary} />
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Sort Options */}
          {watchlist.length > 0 && (
            <View style={styles.sortContainer}>
              <ThemedText type="label-md" style={styles.sortLabel}>Sort by:</ThemedText>
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
                      {
                        backgroundColor: sortBy === option.key ? c.primary : c.surfaceContainerHigh,
                      },
                    ]}
                    onPress={() => handleSort(option.key)}
                  >
                    <ThemedText
                      type="label-md"
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
              <ActivityIndicator color={c.primary} />
            </View>
          )}

          {!loadingWatchlist && watchlist.length === 0 && (
            <View style={styles.emptyState}>
              <IconSymbol name="star.fill" size={48} color="#999" />
              <ThemedText style={styles.emptyText}>Your watchlist is empty</ThemedText>
              <ThemedText style={styles.emptyHint}>Search for stocks above to add them</ThemedText>
            </View>
          )}

          {!loadingWatchlist && watchlist.length > 0 && (
            <View style={styles.watchlistContainer}>
              {getSortedWatchlist().map((item, idx) => (
                <View key={item.id}>
                  {idx > 0 && <View style={styles.floatingDivider} />}
                  <View style={styles.watchlistItem}>
                    <View style={styles.watchlistItemLeft}>
                      <View>
                        <ThemedText type="title-md" style={styles.watchlistSymbol}>{item.symbol}</ThemedText>
                        <ThemedText type="label-md" style={styles.watchlistName} numberOfLines={1}>
                          {item.name}
                        </ThemedText>
                      </View>
                    </View>
                    <View style={styles.watchlistItemRight}>
                      <ThemedText type="title-md" style={styles.watchlistPrice}>
                        ${(item.currentPrice || 0).toFixed(2)}
                      </ThemedText>
                      <View style={styles.watchlistChange}>
                        <ThemedText
                          type="label-md"
                          style={[
                            styles.watchlistChangeText,
                            { color: (item.change || 0) >= 0 ? c.success : c.danger },
                          ]}
                        >
                          {((item.change || 0) >= 0 ? '+$' : '-$') + Math.abs(item.change || 0).toFixed(2)}
                        </ThemedText>
                        <ThemedText
                          type="label-md"
                          style={[
                            styles.watchlistChangePercent,
                            { color: (item.changePercent || 0) >= 0 ? c.success : c.danger },
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
                      <IconSymbol name="xmark.circle.fill" size={24} color={c.danger} />
                    </TouchableOpacity>
                  </View>
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
  container: { flex: 1 },
  scrollView: { flex: 1 },
  header: { padding: Spacing.lg, paddingTop: 60 },

  // Sections — no border, tonal bg + ambient shadow
  section: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    borderRadius: Radii.md,
    ...AmbientShadow,
  },
  sectionTitle: { marginBottom: 12 },

  // Search — filled input style
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  searchInputWithIcon: {
    flex: 1,
    height: 44,
    borderRadius: Radii.md,
    paddingLeft: 40,
    paddingRight: 12,
    fontFamily: Typography['body-lg'].fontFamily,
    fontSize: Typography['body-lg'].fontSize,
    // No borderWidth
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
    borderRadius: Radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingContainer: { padding: Spacing.lg, alignItems: 'center' },

  // Search results — ambient shadow instead of border
  searchResultsContainer: {
    borderRadius: Radii.md,
    marginBottom: Spacing.md,
    maxHeight: 200,
    ...AmbientShadow,
  },
  searchResultItem: {
    paddingHorizontal: 12,
  },
  searchResultInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  searchResultSymbol: {},
  searchResultName: {
    color: Colors.light.onSurfaceVariant,
    marginTop: 2,
  },

  // Floating divider
  floatingDivider: {
    height: 1,
    backgroundColor: Colors.light.surfaceContainerHigh,
    marginHorizontal: '10%',
  },

  // News cards — no border, tonal bg
  newsContainer: { gap: 12 },
  newsCard: {
    padding: 12,
    borderRadius: Radii.sm,
    // No borderWidth
  },
  newsContent: { gap: Spacing.sm },
  newsHeadline: { lineHeight: 20 },
  newsSource: { color: Colors.light.onSurfaceVariant },
  noResults: {
    textAlign: 'center',
    color: Colors.light.onSurfaceVariant,
    paddingVertical: Spacing.md,
  },

  // Watchlist header
  watchlistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  watchlistCount: { color: Colors.light.onSurfaceVariant },

  // Sort pills — no border, pill radius
  sortContainer: { marginBottom: Spacing.md },
  sortLabel: { color: Colors.light.onSurfaceVariant, marginBottom: Spacing.sm },
  sortButtons: { flexDirection: 'row' },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.full,
    marginRight: Spacing.sm,
    // No borderWidth
  },
  sortButtonText: { color: Colors.light.onSurface },
  sortButtonTextActive: { color: '#FFFFFF' },

  // Empty state
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xl },
  emptyText: { marginTop: 12 },
  emptyHint: { color: Colors.light.onSurfaceVariant, marginTop: 4 },

  // Watchlist items — floating dividers instead of borderBottom
  watchlistContainer: { gap: 0 },
  watchlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    // No borderBottomWidth
  },
  watchlistItemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  watchlistSymbol: {},
  watchlistName: { color: Colors.light.onSurfaceVariant, marginTop: 2 },
  watchlistItemRight: { alignItems: 'flex-end', marginRight: 12 },
  watchlistPrice: {},
  watchlistChange: { flexDirection: 'row', gap: 4, marginTop: 2 },
  watchlistChangeText: {},
  watchlistChangePercent: {},
  removeButton: { padding: 4 },

  centerLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
});
