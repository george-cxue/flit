import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
  RefreshControl,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  Colors,
  Typography,
  Radii,
  Spacing,
  AmbientShadow,
  SubtleShadow,
} from "@/constants/theme";
import { WatchlistService } from "@/src/services/watchlistService";
import { ExploreService, TrendingStock } from "@/src/services/exploreService";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useFocusEffect } from "@react-navigation/native";
import { useAuthContext } from "@/contexts/auth-context";

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

type SortOption = "symbol" | "price" | "change" | "changePercent";

const SECTOR_MAP: { key: string; label: string; icon: string }[] = [
  { key: "Technology", label: "Tech", icon: "💻" },
  { key: "Healthcare", label: "Healthcare", icon: "🏥" },
  { key: "Financial Services", label: "Finance", icon: "💰" },
  { key: "Entertainment", label: "Entertainment", icon: "🎬" },
  { key: "Energy", label: "Energy", icon: "⚡" },
  { key: "Consumer", label: "Consumer", icon: "🛍️" },
];

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const { isLoaded, isSignedIn, userId } = useAuthContext();
  const c = Colors.light;

  // Unified search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchingStocks, setSearchingStocks] = useState(false);

  // Trending / explore data
  const [trendingStocks, setTrendingStocks] = useState<TrendingStock[]>([]);
  const [loadingExplore, setLoadingExplore] = useState(true);

  // Watchlist
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loadingWatchlist, setLoadingWatchlist] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("symbol");
  const [sortAscending, setSortAscending] = useState(true);

  // Contextual news
  const [selectedNewsSymbol, setSelectedNewsSymbol] = useState<string | null>(
    null,
  );
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);

  const fetchExploreData = async () => {
    try {
      const data = await ExploreService.getExploreData();
      setTrendingStocks(data.trendingStocks || []);
    } catch (error) {
      console.error("Failed to fetch explore data:", error);
    } finally {
      setLoadingExplore(false);
    }
  };

  const fetchWatchlist = async () => {
    try {
      setLoadingWatchlist(true);
      const data = await WatchlistService.getWatchlist();
      setWatchlist(data);
    } catch (error) {
      console.error("Failed to fetch watchlist:", error);
    } finally {
      setLoadingWatchlist(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (isLoaded && isSignedIn && userId) {
        fetchWatchlist();
        fetchExploreData();
      }
    }, [isLoaded, isSignedIn, userId]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchWatchlist(), fetchExploreData()]);
    if (selectedNewsSymbol) {
      await fetchNewsForSymbol(selectedNewsSymbol);
    }
    setRefreshing(false);
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
      console.error("Failed to search stocks:", error);
      setSearchResults([]);
    } finally {
      setSearchingStocks(false);
    }
  };

  const addToWatchlist = async (symbol: string) => {
    try {
      await WatchlistService.addToWatchlist(symbol);
      await fetchWatchlist();
    } catch (error: any) {
      console.error("Failed to add to watchlist:", error);
      alert(error.response?.data?.error || "Failed to add to watchlist");
    }
  };

  const removeFromWatchlist = async (id: string) => {
    try {
      await WatchlistService.removeFromWatchlist(id);
      setWatchlist((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Failed to remove from watchlist:", error);
      alert("Failed to remove from watchlist");
    }
  };

  const fetchNewsForSymbol = async (symbol: string) => {
    setSelectedNewsSymbol(symbol);
    setLoadingNews(true);
    try {
      const articles = await WatchlistService.getStockNews(symbol);
      setNews(articles);
    } catch (error) {
      console.error("Failed to fetch news:", error);
      setNews([]);
    } finally {
      setLoadingNews(false);
    }
  };

  const selectStockForNews = (symbol: string) => {
    setSearchQuery("");
    setSearchResults([]);
    fetchNewsForSymbol(symbol);
  };

  const clearNews = () => {
    setSelectedNewsSymbol(null);
    setNews([]);
  };

  const dismissSearch = () => {
    setSearchResults([]);
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
    return [...watchlist].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "symbol":
          comparison = a.symbol.localeCompare(b.symbol);
          break;
        case "price":
          comparison = a.currentPrice - b.currentPrice;
          break;
        case "change":
          comparison = a.change - b.change;
          break;
        case "changePercent":
          comparison = a.changePercent - b.changePercent;
          break;
      }
      return sortAscending ? comparison : -comparison;
    });
  };

  // Auth guards
  if (!isLoaded || (isSignedIn && !userId)) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={c.primary} />
          <ThemedText type="body-md" style={{ marginTop: 12 }}>
            Loading...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!isSignedIn) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centerContainer}>
          <ThemedText type="title-lg">
            Please sign in to access Explore
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  const searchBarTop = insets.top + Spacing.md;

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={c.primary}
          />
        }
      >
        {/* Search Bar */}
        <View style={[styles.searchSection, { paddingTop: searchBarTop }]}>
          <View style={styles.searchBarWrapper}>
            <View style={styles.searchIconWrapper}>
              <IconSymbol
                name="magnifyingglass"
                size={18}
                color={c.onSurfaceVariant}
              />
            </View>
            <TextInput
              style={[
                styles.searchInput,
                { backgroundColor: c.surfaceContainerHigh, color: c.onSurface },
              ]}
              placeholder="Search stocks by name or symbol..."
              placeholderTextColor={c.onSurfaceVariant}
              value={searchQuery}
              onChangeText={searchStocks}
              autoCapitalize="characters"
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                }}
              >
                <IconSymbol
                  name="xmark.circle.fill"
                  size={20}
                  color={c.onSurfaceVariant}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search Results Overlay + Backdrop */}
        {(searchResults.length > 0 || searchingStocks) && (
          <>
            <Pressable style={styles.overlayBackdrop} onPress={dismissSearch} />
            <View
              style={[
                styles.searchOverlay,
                {
                  top: searchBarTop + 48 + Spacing.sm,
                  backgroundColor: c.surfaceContainerLowest,
                },
              ]}
            >
              {searchingStocks && (
                <View style={styles.searchingIndicator}>
                  <ActivityIndicator size="small" color={c.primary} />
                </View>
              )}
              <ScrollView nestedScrollEnabled showsVerticalScrollIndicator>
                {searchResults.map((result, idx) => (
                  <View key={result.symbol}>
                    {idx > 0 && <View style={styles.floatingDivider} />}
                    <View style={styles.searchResultRow}>
                      <TouchableOpacity
                        style={styles.searchResultInfo}
                        onPress={() => selectStockForNews(result.symbol)}
                      >
                        <ThemedText type="title-md">{result.symbol}</ThemedText>
                        <ThemedText
                          type="label-md"
                          style={styles.secondaryText}
                          numberOfLines={1}
                        >
                          {result.description}
                        </ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => addToWatchlist(result.symbol)}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <IconSymbol
                          name="plus.circle.fill"
                          size={22}
                          color={c.primary}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </>
        )}

        {/* Popular Stocks */}
        <View style={styles.sectionSpacing}>
          <ThemedText type="title-lg" style={styles.sectionTitle}>
            Popular Stocks
          </ThemedText>
          {loadingExplore ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={c.primary} />
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.popularScrollContent}
            >
              {trendingStocks.map((stock) => {
                const isPositive = stock.changePercent >= 0;
                return (
                  <TouchableOpacity
                    key={stock.id}
                    style={[
                      styles.popularCard,
                      { backgroundColor: c.surfaceContainerLowest },
                    ]}
                    onPress={() => selectStockForNews(stock.ticker)}
                    activeOpacity={0.7}
                  >
                    <ThemedText type="title-md" style={styles.popularTicker}>
                      {stock.ticker}
                    </ThemedText>
                    <ThemedText
                      type="label-md"
                      style={styles.secondaryText}
                      numberOfLines={1}
                    >
                      {stock.name}
                    </ThemedText>
                    <ThemedText type="title-md" style={styles.popularPrice}>
                      ${stock.currentPrice.toFixed(2)}
                    </ThemedText>
                    <View
                      style={[
                        styles.changeBadge,
                        {
                          backgroundColor: isPositive
                            ? `${c.success}15`
                            : `${c.danger}15`,
                        },
                      ]}
                    >
                      <ThemedText
                        type="label-md"
                        style={{ color: isPositive ? c.success : c.danger }}
                      >
                        {isPositive ? "+" : ""}
                        {stock.changePercent.toFixed(2)}%
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Explore Sectors */}
        <View style={styles.sectionSpacing}>
          <ThemedText type="title-lg" style={styles.sectionTitle}>
            Explore Sectors
          </ThemedText>
          <View style={styles.sectorGrid}>
            {SECTOR_MAP.map((sector) => (
              <TouchableOpacity
                key={sector.key}
                style={[
                  styles.sectorCard,
                  { backgroundColor: c.surfaceContainerLow },
                ]}
                onPress={() => searchStocks(sector.key)}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.sectorIcon}>{sector.icon}</ThemedText>
                <ThemedText type="label-lg">{sector.label}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* My Watchlist */}
        <View
          style={[styles.card, { backgroundColor: c.surfaceContainerLowest }]}
        >
          <View style={styles.watchlistHeader}>
            <ThemedText type="title-lg">My Watchlist</ThemedText>
            <ThemedText type="label-md" style={styles.secondaryText}>
              {watchlist.length} {watchlist.length === 1 ? "stock" : "stocks"}
            </ThemedText>
          </View>

          {/* Sort Pills */}
          {watchlist.length > 0 && (
            <View style={styles.sortContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {(
                  [
                    { key: "symbol" as SortOption, label: "Symbol" },
                    { key: "price" as SortOption, label: "Price" },
                    { key: "change" as SortOption, label: "Change $" },
                    { key: "changePercent" as SortOption, label: "Change %" },
                  ] as const
                ).map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.sortPill,
                      {
                        backgroundColor:
                          sortBy === option.key
                            ? c.primary
                            : c.surfaceContainerHigh,
                      },
                    ]}
                    onPress={() => handleSort(option.key)}
                  >
                    <ThemedText
                      type="label-md"
                      style={
                        sortBy === option.key
                          ? styles.sortPillTextActive
                          : styles.sortPillText
                      }
                    >
                      {option.label +
                        (sortBy === option.key
                          ? sortAscending
                            ? " ↑"
                            : " ↓"
                          : "")}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Watchlist Items */}
          {loadingWatchlist && (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={c.primary} />
            </View>
          )}

          {!loadingWatchlist && watchlist.length === 0 && (
            <View style={styles.emptyState}>
              <IconSymbol
                name="star.fill"
                size={40}
                color={c.surfaceContainerHighest}
              />
              <ThemedText type="body-lg" style={{ marginTop: 12 }}>
                Your watchlist is empty
              </ThemedText>
              <ThemedText type="body-md" style={styles.secondaryText}>
                Search above to add stocks
              </ThemedText>
            </View>
          )}

          {!loadingWatchlist && watchlist.length > 0 && (
            <View>
              {getSortedWatchlist().map((item, idx) => (
                <View key={item.id}>
                  {idx > 0 && <View style={styles.floatingDivider} />}
                  <TouchableOpacity
                    style={styles.watchlistItem}
                    onPress={() => selectStockForNews(item.symbol)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.watchlistItemLeft}>
                      <ThemedText type="title-md">{item.symbol}</ThemedText>
                      <ThemedText
                        type="label-md"
                        style={styles.secondaryText}
                        numberOfLines={1}
                      >
                        {item.name}
                      </ThemedText>
                    </View>
                    <View style={styles.watchlistItemRight}>
                      <ThemedText type="title-md">
                        ${(item.currentPrice || 0).toFixed(2)}
                      </ThemedText>
                      <View style={styles.changeRow}>
                        <ThemedText
                          type="label-md"
                          style={{
                            color:
                              (item.change || 0) >= 0 ? c.success : c.danger,
                          }}
                        >
                          {((item.change || 0) >= 0 ? "+$" : "-$") +
                            Math.abs(item.change || 0).toFixed(2)}
                        </ThemedText>
                        <ThemedText
                          type="label-md"
                          style={{
                            color:
                              (item.changePercent || 0) >= 0
                                ? c.success
                                : c.danger,
                          }}
                        >
                          (
                          {((item.changePercent || 0) >= 0 ? "+" : "") +
                            (item.changePercent || 0).toFixed(2)}
                          %)
                        </ThemedText>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeFromWatchlist(item.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <IconSymbol
                        name="xmark.circle.fill"
                        size={22}
                        color={c.danger}
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Stock News — contextual */}
        {selectedNewsSymbol && (
          <View
            style={[styles.card, { backgroundColor: c.surfaceContainerLowest }]}
          >
            <View style={styles.newsHeader}>
              <ThemedText type="title-lg">
                News for {selectedNewsSymbol}
              </ThemedText>
              <TouchableOpacity
                onPress={clearNews}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <IconSymbol
                  name="xmark.circle.fill"
                  size={24}
                  color={c.onSurfaceVariant}
                />
              </TouchableOpacity>
            </View>

            {loadingNews && (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={c.primary} />
              </View>
            )}

            {!loadingNews && news.length > 0 && (
              <View style={styles.newsContainer}>
                {news.slice(0, 5).map((article) => (
                  <TouchableOpacity
                    key={article.id}
                    style={[
                      styles.newsCard,
                      { backgroundColor: c.surfaceContainerLow },
                    ]}
                    onPress={() => Linking.openURL(article.url)}
                    activeOpacity={0.7}
                  >
                    <ThemedText
                      type="title-md"
                      style={styles.newsHeadline}
                      numberOfLines={2}
                    >
                      {article.headline}
                    </ThemedText>
                    <ThemedText type="label-md" style={styles.secondaryText}>
                      {article.source || "Unknown"}
                      {" \u2022 "}
                      {article.publishedAt
                        ? new Date(article.publishedAt).toLocaleDateString()
                        : "Unknown date"}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {!loadingNews && news.length === 0 && (
              <ThemedText
                type="body-md"
                style={[
                  styles.secondaryText,
                  { textAlign: "center", paddingVertical: Spacing.md },
                ]}
              >
                No news found for {selectedNewsSymbol}
              </ThemedText>
            )}
          </View>
        )}

        {/* Bottom spacer */}
        <View style={{ height: Spacing.sm }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },

  // Search
  searchSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  searchBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchIconWrapper: {
    position: "absolute",
    left: 14,
    zIndex: 1,
    height: 48,
    justifyContent: "center",
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderRadius: Radii.md,
    paddingLeft: 42,
    paddingRight: 42,
    fontFamily: Typography["body-lg"].fontFamily,
    fontSize: Typography["body-lg"].fontSize,
  },
  clearButton: {
    position: "absolute",
    right: 14,
    height: 48,
    justifyContent: "center",
  },

  // Overlay
  overlayBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9,
  },
  searchOverlay: {
    position: "absolute",
    left: Spacing.lg,
    right: Spacing.lg,
    borderRadius: Radii.md,
    maxHeight: 280,
    zIndex: 10,
    ...AmbientShadow,
  },
  searchResultRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
  },
  searchResultInfo: {
    flex: 1,
  },
  addButton: {
    padding: 4,
  },
  searchingIndicator: {
    paddingVertical: Spacing.sm,
    alignItems: "center",
  },

  // Sections
  sectionSpacing: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    paddingHorizontal: Spacing.lg,
    marginBottom: 12,
  },

  // Popular stocks
  popularScrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: 12,
  },
  popularCard: {
    width: 140,
    padding: Spacing.md,
    borderRadius: Radii.md,
    ...SubtleShadow,
  },
  popularTicker: {
    marginBottom: 2,
  },
  popularPrice: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  changeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radii.full,
  },

  // Sectors
  sectorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.lg,
    gap: 12,
  },
  sectorCard: {
    width: "47%",
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radii.md,
  },
  sectorIcon: {
    fontSize: 22,
  },

  // Shared
  secondaryText: {
    color: Colors.light.onSurfaceVariant,
  },
  floatingDivider: {
    height: 1,
    backgroundColor: Colors.light.surfaceContainerHigh,
    marginHorizontal: "10%",
  },
  loadingRow: {
    padding: Spacing.lg,
    alignItems: "center",
  },

  // Card wrapper
  card: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radii.md,
    ...AmbientShadow,
  },

  // Watchlist
  watchlistHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sortContainer: {
    marginBottom: Spacing.md,
  },
  sortPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.full,
    marginRight: Spacing.sm,
  },
  sortPillText: { color: Colors.light.onSurface },
  sortPillTextActive: { color: "#FFFFFF" },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  watchlistItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  watchlistItemLeft: {
    flex: 1,
  },
  watchlistItemRight: {
    alignItems: "flex-end",
    marginRight: 12,
  },
  changeRow: {
    flexDirection: "row",
    gap: 4,
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
  },

  // News
  newsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  newsContainer: {
    gap: 12,
  },
  newsCard: {
    padding: 12,
    borderRadius: Radii.sm,
  },
  newsHeadline: {
    lineHeight: 20,
    marginBottom: Spacing.xs,
  },
});
