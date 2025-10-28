import { computeStats, type StatsBundle } from "@/api/stats";
import { currentHouseholdAtom } from "@/atoms";
import AppHeader from "@/components/AppHeader";
import PeriodPicker, {
  getPeriodRange,
  PeriodPickerValue,
} from "@/components/stats/PeriodPicker";
import { useTheme } from "@/state/ThemeContext";
import { useFocusEffect } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
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

  const {
    data: stats,
    isPending,
    refetch,
  } = useQuery<StatsBundle>({
    queryKey: [
      "stats",
      activeHouseholdId,
      period.mode,
      range.from.toISOString(),
      range.to.toISOString(),
    ],
    queryFn: () => computeStats(activeHouseholdId!, range.from, range.to),
    enabled: !!activeHouseholdId,
    refetchOnWindowFocus: true, // via AppState (bakgrund → förgrund)
    refetchOnReconnect: true,
    staleTime: 0,
    gcTime: 1000 * 60 * 5,
  });

  // Refetcha när skärmen får fokus (tab in igen)
  useFocusEffect(
    useCallback(() => {
      if (!activeHouseholdId) return;
      refetch();
    }, [activeHouseholdId, refetch, period.mode, range.from, range.to])
  );

  // Logga när data uppdateras
  useEffect(() => {
    if (!stats || !activeHouseholdId) return;
    console.log(
      `[stats] Hushåll: ${activeHouseholdId}` +
        `\nPeriod: ${range.from.toISOString()} – ${range.to.toISOString()}` +
        `\nTotalt-slices: ${stats.total.length}, Sysslor: ${stats.chores.length}`
    );
    if (stats.total[0])
      console.log("[stats] Första totalslice:", stats.total[0]);
    if (stats.chores[0])
      console.log("[stats] Första sysslan:", stats.chores[0]);
  }, [stats, activeHouseholdId, range.from, range.to]);

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
            <Text style={{ color: colors.textSecondary }}>
              {isPending ? "(laddar...)" : "(diagram kommer här)"}
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.grid}>
          {[
            "Laga mat",
            "Damma",
            "Diska",
            "Ta hand om My",
            "Torka golvet",
            "Vattna blommor",
          ].map((name) => (
            <Card
              key={name}
              style={[styles.smallCard, { backgroundColor: colors.card }]}
            >
              <Card.Content style={styles.center}>
                <View
                  style={[styles.smallCircle, { borderColor: colors.border }]}
                />
                <Text style={{ marginTop: 6, color: colors.textSecondary }}>
                  {name}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const CIRCLE_SIZE = 180;

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  periodWrapper: { marginBottom: 4 },
  totalCard: { borderRadius: 16, paddingVertical: 12, marginBottom: 16 },
  center: { alignItems: "center", justifyContent: "center" },
  bigCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 10,
    opacity: 0.3,
  },
  totalTitle: { marginTop: 8, fontSize: 16, fontWeight: "600" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
  smallCard: { width: "31%", borderRadius: 16, paddingVertical: 12 },
  smallCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 8,
    opacity: 0.3,
  },
});
