import { useTheme } from "@/state/ThemeContext";
import { addMonths, addWeeks, addYears, format } from "date-fns";
import sv from "date-fns/locale/sv";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { IconButton, Text } from "react-native-paper";

export type PeriodMode = "week" | "month" | "year";

export type PeriodPickerValue = {
  mode: PeriodMode;
  anchor: Date; // referensdatum inom vald period
};

type Props = {
  value: PeriodPickerValue;
  onChange: (next: PeriodPickerValue) => void;
  disableNextWhenCurrent?: boolean;
};

function getLabel(mode: PeriodMode, anchor: Date): string {
  if (mode === "week") {
    const weekNum = Number(format(anchor, "I", { locale: sv }));
    const currentWeek = Number(format(new Date(), "I", { locale: sv }));
    if (weekNum === currentWeek) return "nuvarande vecka";
    return `vecka ${weekNum}`;
  }
  if (mode === "month") return format(anchor, "LLLL", { locale: sv });
  return format(anchor, "yyyy", { locale: sv });
}

export default function PeriodPicker({
  value,
  onChange,
  disableNextWhenCurrent = true,
}: Props) {
  const { colors } = useTheme();
  const { mode, anchor } = value;

  const goPrev = () => {
    if (mode === "week") onChange({ mode, anchor: addWeeks(anchor, -1) });
    else if (mode === "month")
      onChange({ mode, anchor: addMonths(anchor, -1) });
    else onChange({ mode, anchor: addYears(anchor, -1) });
  };

  const goNext = () => {
    if (mode === "week") onChange({ mode, anchor: addWeeks(anchor, 1) });
    else if (mode === "month") onChange({ mode, anchor: addMonths(anchor, 1) });
    else onChange({ mode, anchor: addYears(anchor, 1) });
  };

  const isAtCurrent =
    (mode === "week" &&
      format(anchor, "yyyy-I", { locale: sv }) ===
        format(new Date(), "yyyy-I", { locale: sv })) ||
    (mode === "month" &&
      format(anchor, "yyyy-MM", { locale: sv }) ===
        format(new Date(), "yyyy-MM", { locale: sv })) ||
    (mode === "year" &&
      format(anchor, "yyyy", { locale: sv }) ===
        format(new Date(), "yyyy", { locale: sv }));

  const buttons: { value: PeriodMode; label: string }[] = [
    { value: "week", label: "Vecka" },
    { value: "month", label: "Månad" },
    { value: "year", label: "År" },
  ];

  return (
    <View style={styles.wrapper}>
      <View style={styles.segmentRow}>
        {buttons.map((b) => {
          const selected = mode === b.value;
          return (
            <TouchableOpacity
              key={b.value}
              activeOpacity={0.8}
              onPress={() => onChange({ mode: b.value, anchor: new Date() })}
              style={[
                styles.segmentBtn,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
                selected && [
                  styles.segmentBtnSelected,
                  { borderColor: colors.primary },
                ],
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  { color: colors.text },
                  selected && [{ color: colors.primary, fontWeight: "600" }],
                ]}
              >
                {b.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.navRow}>
        <View style={styles.side}>
          <IconButton icon="chevron-left" onPress={goPrev} size={22} />
        </View>

        <Text
          variant="titleMedium"
          style={[styles.title, { color: colors.text }]}
          numberOfLines={1}
        >
          {getLabel(mode, anchor)}
        </Text>

        <View style={styles.side}>
          <IconButton
            icon="chevron-right"
            onPress={goNext}
            size={22}
            disabled={disableNextWhenCurrent && isAtCurrent}
          />
        </View>
      </View>
    </View>
  );
}

const SIDE_WIDTH = 44;

const styles = StyleSheet.create({
  wrapper: { gap: 8, marginBottom: 6 },
  segmentRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentBtn: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentBtnSelected: {},
  segmentText: {
    fontSize: 14,
  },

  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  side: { width: SIDE_WIDTH, alignItems: "center", justifyContent: "center" },
  title: { flex: 1, textAlign: "center", textTransform: "capitalize" },
});

/** Returnerar ett from/to-intervall baserat på vald period */
export function getPeriodRange(mode: PeriodMode, anchor: Date) {
  const from = new Date(anchor);
  const to = new Date(anchor);

  switch (mode) {
    case "week": {
      const day = anchor.getDay();
      const diffToMonday = day === 0 ? -6 : 1 - day;
      from.setDate(anchor.getDate() + diffToMonday);
      from.setHours(0, 0, 0, 0);

      to.setDate(from.getDate() + 6);
      to.setHours(23, 59, 59, 999);
      break;
    }

    case "month": {
      from.setDate(1);
      from.setHours(0, 0, 0, 0);

      to.setMonth(anchor.getMonth() + 1, 0);
      to.setHours(23, 59, 59, 999);
      break;
    }

    case "year": {
      from.setMonth(0, 1);
      from.setHours(0, 0, 0, 0);

      to.setMonth(11, 31);
      to.setHours(23, 59, 59, 999);
      break;
    }
  }

  return { from, to };
}
