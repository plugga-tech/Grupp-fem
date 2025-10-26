import AppHeader from "@/components/AppHeader";
import PeriodPicker, {
  getPeriodRange,
  PeriodPickerValue,
} from "@/components/stats/PeriodPicker";
import { useTheme } from "@/contexts/ThemeContext";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Card, Text } from "react-native-paper";

export default function StatScreen() {
  const { colors } = useTheme();
  const [period, setPeriod] = useState<PeriodPickerValue>({
    mode: "week",
    anchor: new Date(),
  });

  const range = getPeriodRange(period.mode, period.anchor);
  console.log(
    "Aktuell period:",
    range.from.toISOString(),
    "–",
    range.to.toISOString()
  );

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
        {/* Periodväljare */}
        <View style={styles.periodWrapper}>
          <PeriodPicker value={period} onChange={setPeriod} />
        </View>

        {/* "Total"-pie placeholder */}
        <Card style={[styles.totalCard, { backgroundColor: colors.card }]}>
          <Card.Content style={styles.center}>
            <View style={[styles.bigCircle, { borderColor: colors.border }]} />
            <Text style={[styles.totalTitle, { color: colors.text }]}>
              Totalt
            </Text>
            <Text style={{ color: colors.textSecondary }}>
              (diagram kommer här)
            </Text>
          </Card.Content>
        </Card>

        {/* “per syssla” placeholders */}
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
  periodWrapper: { marginBottom: 4 }, // litet kontrollerat avstånd
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
  smallCard: {
    width: "31%",
    borderRadius: 16,
    paddingVertical: 12,
  },
  smallCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 8,
    opacity: 0.3,
  },
});
