import { computeStats, type StatsBundle } from "@/api/stats";
import { currentHouseholdAtom } from "@/atoms";
import AppHeader from "@/components/AppHeader";
import PeriodPicker, {
  getPeriodRange,
  PeriodPickerValue,
} from "@/components/stats/PeriodPicker";
import { useTheme } from "@/state/ThemeContext";
import { getAvatarInfo } from "@/utils/avatar";
import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { ActivityIndicator, Card, Text } from "react-native-paper";

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

  const { data: stats, isPending } = useQuery<StatsBundle>({
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

  const renderTotalLine = () => {
    if (isPending) return <ActivityIndicator size="small" />;
    if (!stats || stats.total.length === 0) {
      return (
        <Text style={{ color: colors.textSecondary }}>
          (inga data för vald period)
        </Text>
      );
    }
    const parts = stats.total.map((s) => {
      const emoji = s.avatar ? getAvatarInfo(s.avatar).emoji : "👤";
      return `${emoji} ${s.value}`;
    });
    return (
      <Text style={{ color: colors.textSecondary, textAlign: "center" }}>
        {parts.join("   •   ")}
      </Text>
    );
  };

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
          <Card.Content style={styles.center}>
            <View style={[styles.bigCircle, { borderColor: colors.border }]} />
            <Text style={[styles.totalTitle, { color: colors.text }]}>
              Totalt
            </Text>
            {renderTotalLine()}
          </Card.Content>
        </Card>

        <View style={[styles.grid, { columnGap: GAP, rowGap: GAP }]}>
          {(stats?.chores ?? []).map((c) => {
            const parts = c.slices.map((s) => {
              const emoji = s.avatar ? getAvatarInfo(s.avatar).emoji : "👤";
              return `${emoji} ${s.value}`;
            });
            return (
              <Card
                key={c.choreId}
                style={[styles.smallCard, { backgroundColor: colors.card }]}
              >
                <Card.Content style={styles.smallCardContent}>
                  <View
                    style={[styles.smallCircle, { borderColor: colors.border }]}
                  />
                  <Text
                    numberOfLines={2}
                    ellipsizeMode="tail"
                    style={[styles.choreName, { color: colors.text }]}
                  >
                    {c.name}
                  </Text>
                  {parts.length > 0 ? (
                    <Text
                      numberOfLines={2}
                      style={[
                        styles.choreValues,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {parts.join("  •  ")}
                    </Text>
                  ) : (
                    <Text
                      style={[
                        styles.choreValues,
                        { color: colors.textSecondary },
                      ]}
                    >
                      (ingen data)
                    </Text>
                  )}
                </Card.Content>
              </Card>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const CIRCLE_SIZE = 160;

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  periodWrapper: { marginBottom: 4 },

  // Totalt-kort
  totalCard: { borderRadius: 16, paddingVertical: 12, marginBottom: 16 },
  center: { alignItems: "center", justifyContent: "center" },
  bigCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 10,
    opacity: 0.25,
  },
  totalTitle: { marginTop: 8, fontSize: 16, fontWeight: "600" },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  smallCard: {
    width: "31%",
    borderRadius: 16,
    paddingVertical: 10,
  },
  smallCardContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  smallCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 8,
    opacity: 0.25,
    marginBottom: 6,
  },
  choreName: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
    minHeight: 36,
  },
  choreValues: {
    marginTop: 2,
    textAlign: "center",
  },
});
