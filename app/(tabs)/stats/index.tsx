import { computeStats, type StatsBundle } from "@/api/stats";
import { currentHouseholdAtom } from "@/atoms";
import AppHeader from "@/components/AppHeader";
import MiniPie from "@/components/stats/MiniPie";
import PeriodPicker, {
  getPeriodRange,
  PeriodPickerValue,
} from "@/components/stats/PeriodPicker";
import Pie from "@/components/stats/Pie";
import { useTheme } from "@/state/ThemeContext";
import { AVATAR_COLORS, AvatarKey, getAvatarInfo } from "@/utils/avatar";
import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { Card, Text } from "react-native-paper";

export default function StatScreen() {
  const { colors } = useTheme();
  const currentHousehold = useAtomValue(currentHouseholdAtom);
  const activeHouseholdId = currentHousehold?.id ?? null;

  const [period, setPeriod] = useState<PeriodPickerValue>({
    mode: "week",
    anchor: new Date(),
  });
  const range = useMemo(
    () => getPeriodRange(period.mode, period.anchor),
    [period.mode, period.anchor]
  );

  const { data: stats } = useQuery<StatsBundle>({
    queryKey: [
      "stats",
      activeHouseholdId,
      period.mode,
      range.from.toISOString(),
      range.to.toISOString(),
    ],
    queryFn: () => computeStats(activeHouseholdId!, range.from, range.to),
    enabled: !!activeHouseholdId,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 0,
    gcTime: 1000 * 60 * 5,
  });

  const { width } = useWindowDimensions();
  const H_PADDING = 16;
  const innerWidth = width - H_PADDING * 2;
  const GAP = innerWidth * 0.03;

  const LARGE_PIE_SIZE = 184;
  const MINI_PIE_SIZE = 76;

  // Totalt: färger + emoji på varje slice
  const totalSlices = (stats?.total ?? []).map((s) => ({
    value: s.value,
    color: s.avatar
      ? AVATAR_COLORS[s.avatar as AvatarKey] ?? "#CCCCCC"
      : "#CCCCCC",
    icon: s.avatar ? getAvatarInfo(s.avatar).emoji : "👤",
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Statistik"
        rightActions={[
          {
            icon: "chart-box-outline",
            onPress: () => {},
            accessibilityLabel: "Statistik",
          },
        ]}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.periodWrapper}>
          <PeriodPicker value={period} onChange={setPeriod} />
        </View>

        <Card style={[styles.totalCard, { backgroundColor: colors.card }]}>
          <Card.Content style={[styles.center, styles.totalContent]}>
            {/* Stor “pie” */}
            <Pie
              data={totalSlices}
              showSliceIcons
              iconSize={20}
              size={LARGE_PIE_SIZE}
            />
            <Text style={[styles.totalTitle, { color: colors.text }]}>
              Totalt
            </Text>
          </Card.Content>
        </Card>

        <View style={[styles.grid, { columnGap: GAP, rowGap: GAP }]}>
          {(stats?.chores ?? []).map((c) => {
            const slices = c.slices.map((s) => ({
              value: s.value,
              color: s.avatar
                ? AVATAR_COLORS[s.avatar as AvatarKey] ?? "#CCCCCC"
                : "#CCCCCC",
            }));

            return (
              <Card
                key={c.choreId}
                style={[styles.smallCard, { backgroundColor: colors.card }]}
              >
                <Card.Content style={styles.smallCardContent}>
                  <MiniPie data={slices} size={MINI_PIE_SIZE} />
                  <Text
                    numberOfLines={2}
                    ellipsizeMode="tail"
                    style={[styles.choreName, { color: colors.text }]}
                  >
                    {c.name}
                  </Text>
                </Card.Content>
              </Card>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  periodWrapper: { marginBottom: 4 },

  totalCard: { borderRadius: 16, marginBottom: 16 },
  totalContent: { paddingHorizontal: 10, paddingVertical: 10 },

  center: { alignItems: "center", justifyContent: "center" },
  totalTitle: { marginTop: 10, fontSize: 16, fontWeight: "600" },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },

  smallCard: { width: "31%", borderRadius: 16 },
  smallCardContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 12,
  },

  choreName: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
    minHeight: 36,
  },
});
