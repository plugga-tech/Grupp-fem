import AppHeader from "@/components/AppHeader";
import { useTheme } from "@/contexts/ThemeContext";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Card, SegmentedButtons, Text } from "react-native-paper";

type PeriodKey = "currentWeek" | "lastWeek" | "lastMonth";

export default function StatScreen() {
  const { colors } = useTheme();
  const [period, setPeriod] = useState<PeriodKey>("currentWeek");

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Hushållet"
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
        <SegmentedButtons
          value={period}
          onValueChange={(v) => setPeriod(v as PeriodKey)}
          buttons={[
            { value: "currentWeek", label: "Nuvarande vecka" },
            { value: "lastWeek", label: "Förra veckan" },
            { value: "lastMonth", label: "Förra månaden" },
          ]}
          density="regular"
          style={styles.segments}
        />

        {/* Stor "Total"-pie placeholder */}
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

        {/* Små “per syssla” placeholders – tre rader à tre kort funkar bra */}
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
  content: { padding: 16, gap: 16 },
  segments: { marginBottom: 8 },
  totalCard: { borderRadius: 16, paddingVertical: 12 },
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
    gap: 12,
    justifyContent: "space-between",
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
