# Portfolio Tab - Fantasy Finance Educational App

## Overview

The Portfolio Tab is a comprehensive financial dashboard that allows users to manage their investment portfolios across multiple leagues. It combines educational finance concepts with an engaging, gamified interface similar to popular fintech apps like Robinhood and Fidelity.

## Features

### 1. League Switching
- Users can belong to multiple leagues (Class League, Friends League, Public Rankings)
- Each league maintains a separate portfolio with discrete performance tracking
- Visual tabs at the top allow seamless switching between leagues
- Member count displayed for each league

### 2. Portfolio Performance Visualization
- **Interactive Line Chart** showing portfolio value over time
- **S&P 500 Baseline Comparison** - dashed line overlay showing relative market performance
- **Time Frame Selection** - Toggle between 1 Day, 1 Week, and 1 Month views
- **Performance Metrics** - Real-time percentage change displayed for both portfolio and S&P 500
- Built with Recharts for smooth, responsive visualizations

### 3. Asset Allocation System
Three core investment vehicles with educational tooltips:

#### Savings Account 💰
- **Risk:** Low
- **Liquidity:** High
- **Diversification:** Low
- **Use Case:** Emergency funds and short-term goals

#### Bonds 📊
- **Risk:** Low
- **Liquidity:** Medium
- **Diversification:** Medium
- **Use Case:** Stable returns and portfolio balance

#### Index Funds 📈
- **Risk:** Medium
- **Liquidity:** Medium
- **Diversification:** High
- **Use Case:** Long-term growth with managed risk

Users can allocate liquid funds into these vehicles through an intuitive modal interface that displays:
- Current allocation amounts
- Percentage of total portfolio
- Educational information about risk, liquidity, and diversification tradeoffs

### 4. Stock Search & Purchase
- **Real-time Search** - Query stocks by symbol, name, or sector
- **15 Mock Stocks** including AAPL, MSFT, GOOGL, NVDA, TSLA, etc.
- **Purchase Interface:**
  - Current stock price with daily change percentage
  - Share quantity selector
  - Cost calculator showing total cost vs. available rewards
  - Validation to prevent overspending
- Purchases made using earned "Lesson Rewards" currency

### 5. Current Holdings Display
- Comprehensive list of owned stocks
- Per-holding information:
  - Number of shares
  - Average purchase price
  - Current price
  - Total value
  - Percentage gain/loss (color-coded green/red)
- Empty state messaging for new users

### 6. Educational Tooltips
Built into the Asset Allocation modal:
- **Risk Level** - Color-coded badges (Low = Green, Medium = Yellow, High = Red)
- **Liquidity** - How quickly assets can be converted to cash
- **Diversification** - Spread of investment across different securities
- Contextual explanations for each asset type

## File Structure

```
flit/
├── app/(tabs)/
│   └── portfolio.tsx              # Main Portfolio screen with state management
├── components/portfolio/
│   ├── performance-chart.tsx      # Chart component with S&P 500 baseline
│   ├── asset-allocation.tsx       # Allocation interface with educational modals
│   ├── stock-search.tsx           # Stock search and purchase component
│   └── holdings-list.tsx          # Current holdings display
├── types/
│   └── portfolio.ts               # TypeScript interfaces for all data types
└── data/
    └── mock-portfolio.ts          # Mock data generation and stock database
```

## Data Architecture

### Type Definitions

#### League
```typescript
interface League {
  id: string;
  name: string;
  type: 'class' | 'friends' | 'public';
  memberCount: number;
}
```

#### Portfolio
```typescript
interface Portfolio {
  leagueId: string;
  totalValue: number;
  liquidFunds: number;          // Available for asset allocation
  lessonRewards: number;        // Available for stock purchases
  allocation: AssetAllocation;
  holdings: StockHolding[];
  history: PortfolioSnapshot[]; // Time-series data for charting
}
```

#### Stock
```typescript
interface Stock {
  symbol: string;
  name: string;
  currentPrice: number;
  changePercent: number;
  sector: string;
}
```

### Mock Data Generation

The `generateHistoricalData` function creates realistic time-series data:
- Configurable volatility and trend parameters
- Random walk algorithm with floor protection
- 30 days of historical data for each portfolio and S&P 500

## User Flows

### 1. Allocating Funds to Assets
1. User selects an asset card (Savings, Bonds, or Index Funds)
2. Modal opens showing educational information
3. User enters allocation amount
4. System validates against available liquid funds
5. Portfolio updates and chart reflects new allocation

### 2. Purchasing Stocks
1. User searches for stock by symbol/name/sector
2. User selects stock from search results
3. Purchase modal displays current price and change
4. User enters number of shares to buy
5. System calculates total cost and validates against lesson rewards
6. If valid, stock is added to holdings (or shares are added to existing position)
7. Average price is recalculated for existing positions

### 3. Switching Leagues
1. User taps league tab at top of screen
2. Entire portfolio view updates to show selected league's data:
   - Portfolio value
   - Available funds
   - Asset allocation
   - Stock holdings
   - Performance chart

## Technical Implementation Details

### State Management
- React `useState` for local portfolio state
- Immutable state updates for portfolio modifications
- League-specific portfolio data stored in keyed object

### Performance Chart
- Uses Recharts `LineChart` component
- Normalizes data to percentage change from baseline
- Filters data based on selected timeframe
- Custom tooltip component for enhanced UX
- Responsive container for mobile/web compatibility

### Styling
- Theme-aware components using `useThemeColor` hook
- Supports light and dark modes
- Consistent card-based layout
- Color-coded financial indicators (green = positive, red = negative)

### Future Enhancement Opportunities
1. **Real-Time Data** - Integration with actual stock market APIs
2. **Portfolio Analytics** - Sharpe ratio, beta, volatility metrics
3. **Transaction History** - Log of all buys, sells, and allocations
4. **Leaderboards** - Ranking within each league
5. **Achievements** - Badges for investment milestones
6. **News Feed** - Relevant financial news for held stocks
7. **Alerts** - Price notifications and portfolio rebalancing suggestions
8. **Social Features** - Compare portfolios with league members

## Educational Philosophy

The Portfolio Tab teaches users about:
- **Diversification** - Through multiple asset types and stock selection
- **Risk Management** - Clear risk indicators and balanced allocation guidance
- **Market Comparison** - S&P 500 baseline shows relative performance
- **Long-term Thinking** - Historical charts demonstrate time horizons
- **Liquidity Tradeoffs** - Different asset types have different accessibility
- **Portfolio Construction** - Balancing growth, stability, and accessibility

## Usage

To run the app:

```bash
npm start          # Start Expo dev server
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
npm run web        # Run in web browser
```

The Portfolio Tab can be accessed via the bottom tab navigation in the app.

## Dependencies

- **recharts** - Chart visualization library
- **react-native** - Core mobile framework
- **expo-router** - File-based navigation
- **TypeScript** - Type safety and developer experience

## Notes

- All financial data is simulated for educational purposes
- Stock prices and changes are mocked but realistic
- Portfolio performance is generated algorithmically
- No real money or actual trading occurs
