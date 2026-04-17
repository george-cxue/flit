import { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Pressable, Modal, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Typography, Spacing, Radii, AmbientShadow } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { ProfileButton } from '@/components/profile-button';
import { useAuthContext } from '@/contexts/auth-context';
import { useLessons } from '@/hooks/use-lessons';
import { useThemeMode } from '@/contexts/theme-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type TooltipKey = 'iq' | 'streak' | 'dollars' | null;

const TOOLTIPS: Record<Exclude<TooltipKey, null>, { title: string; description: string }> = {
  iq: {
    title: 'Financial IQ',
    description: 'Your Financial IQ score reflects your investing knowledge. Complete lessons and make smart portfolio decisions to increase it.',
  },
  streak: {
    title: 'Daily Streak',
    description: 'Your streak tracks consecutive days of completing at least one lesson. Keep it going to earn bonus rewards!',
  },
  dollars: {
    title: 'Learning Dollars',
    description: 'Learning Dollars are earned by completing lessons. They determine your starting portfolio balance when you join or create a group.',
  },
};

export function TopBar() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthContext();
  const { portfolioBalance, reload } = useLessons(user?.id || null);
  const { themeMode } = useThemeMode();
  const c = themeMode === 'dark' ? Colors.dark : Colors.light;
  const styles = createStyles(c);
  const [activeTooltip, setActiveTooltip] = useState<TooltipKey>(null);
  const [tooltipPos, setTooltipPos] = useState({ left: 0, top: 0, arrowLeft: 0 });

  const iqRef = useRef<View>(null);
  const streakRef = useRef<View>(null);
  const dollarsRef = useRef<View>(null);

  const iqScore = user?.financialIQScore || 500;
  const streak = user?.learningStreak || 0;

  const tooltip = activeTooltip ? TOOLTIPS[activeTooltip] : null;
  const hasLargeTopInset = insets.top >= 44;
  // Keep icons clear of the status area while avoiding oversized spacing on all devices.
  const topPadding = insets.top + (hasLargeTopInset ? 8 : 10);

  const MARGIN = 12;

  const showTooltip = (key: TooltipKey, ref: React.RefObject<View | null>) => {
    ref.current?.measureInWindow((x, y, width, height) => {
      const screenWidth = Dimensions.get('window').width;
      const centerX = x + width / 2;
      const idealLeft = centerX - TOOLTIP_WIDTH / 2;

      // Clamp so tooltip stays within screen margins
      const clampedLeft = Math.max(MARGIN, Math.min(idealLeft, screenWidth - TOOLTIP_WIDTH - MARGIN));
      // Arrow points to the center of the tapped item relative to the tooltip
      const arrowLeft = centerX - clampedLeft;

      setTooltipPos({ left: clampedLeft, top: y + height + 8, arrowLeft });
      setActiveTooltip(key);
    });
  };

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  return (
    <>
      <View style={[styles.container, { paddingTop: topPadding }]}>
        <View style={styles.row}>
          {/* Financial IQ */}
          <TouchableOpacity ref={iqRef} style={styles.stat} onPress={() => showTooltip('iq', iqRef)} activeOpacity={0.6}>
            <MaterialIcons name="trending-up" size={22} color={c.primary} />
            <ThemedText style={styles.statValue}>{iqScore}</ThemedText>
          </TouchableOpacity>

          {/* Daily Streak */}
          <TouchableOpacity ref={streakRef} style={styles.stat} onPress={() => showTooltip('streak', streakRef)} activeOpacity={0.6}>
            <MaterialIcons name="local-fire-department" size={22} color={c.warning} />
            <ThemedText style={styles.statValue}>{streak}</ThemedText>
          </TouchableOpacity>

          {/* Learning Dollars */}
          <TouchableOpacity ref={dollarsRef} style={styles.stat} onPress={() => showTooltip('dollars', dollarsRef)} activeOpacity={0.6}>
            <MaterialIcons name="account-balance-wallet" size={22} color={c.success} />
            <ThemedText style={styles.statValue}>
              {portfolioBalance.toLocaleString()}
            </ThemedText>
          </TouchableOpacity>

          {/* Profile */}
          <ProfileButton />
        </View>
      </View>

      {/* Tooltip */}
      <Modal visible={activeTooltip !== null} transparent animationType="fade" onRequestClose={() => setActiveTooltip(null)}>
        <Pressable style={styles.tooltipOverlay} onPress={() => setActiveTooltip(null)}>
          <View
            style={[
              styles.tooltipCard,
              { backgroundColor: c.surfaceContainerLowest, top: tooltipPos.top, left: tooltipPos.left },
            ]}
          >
            <View style={[styles.tooltipArrow, { backgroundColor: c.surfaceContainerLowest, left: tooltipPos.arrowLeft - 6 }]} />
            <ThemedText type="label-lg" style={styles.tooltipTitle}>{tooltip?.title}</ThemedText>
            <ThemedText type="body-md" style={styles.tooltipDescription}>{tooltip?.description}</ThemedText>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const TOOLTIP_WIDTH = 220;

const createStyles = (c: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.sm,
      backgroundColor: c.surface,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 32,
    },
    stat: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    statValue: {
      fontFamily: Typography['label-lg'].fontFamily,
      fontSize: 16,
      color: c.onSurface,
    },
    tooltipOverlay: {
      flex: 1,
    },
    tooltipCard: {
      position: 'absolute',
      width: TOOLTIP_WIDTH,
      borderRadius: Radii.md,
      paddingHorizontal: Spacing.md,
      paddingVertical: 12,
      ...AmbientShadow,
    },
    tooltipArrow: {
      position: 'absolute',
      top: -6,
      width: 12,
      height: 12,
      borderRadius: 2,
      transform: [{ rotate: '45deg' }],
    },
    tooltipTitle: {
      color: c.onSurface,
      marginBottom: 4,
    },
    tooltipDescription: {
      color: c.onSurfaceVariant,
      lineHeight: 20,
    },
  });
