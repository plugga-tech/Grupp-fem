import { getHouseholdMembers, householdKeys } from "@/api/household";
import AppHeader from "@/components/AppHeader";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import { useAtom } from "jotai";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { completeChore, getChoresWithStatus } from "../../../../api/chores";
import { currentHouseholdAtom } from "../../../../atoms";
import { useTheme } from "../../../../state/ThemeContext";

export default function ChoreDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const [currentHousehold] = useAtom(currentHouseholdAtom);
  const activeHouseholdId = currentHousehold?.id ?? null;
  const { colors } = useTheme();
    
  const auth = getAuth();  // Hämta current user från Firebase Auth
  const userId = auth.currentUser?.uid;
   // Hämta household members för att kolla om användaren är admin
  const { data: members = [] } = useQuery({
    queryKey: householdKeys.members(activeHouseholdId || ""),
    queryFn: () => getHouseholdMembers(activeHouseholdId || ""),
    enabled: !!activeHouseholdId,
  });
     // Kolla om current user är admin
  const currentMember = members.find((m) => m.userId === userId);
  const isAdmin = currentMember?.isAdmin ?? false;

  const { data: chores, isLoading } = useQuery({
    queryKey: ["chores", activeHouseholdId],
    queryFn: () => getChoresWithStatus(activeHouseholdId || ""),
    enabled: !!activeHouseholdId,
  });

  const chore = chores?.find((c) => c.id === id);

  const completeMutation = useMutation({
    mutationFn: () =>
      completeChore(id as string, activeHouseholdId || "", userId || ""),
    meta: { invalidateStatsForHousehold: activeHouseholdId },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chores"] });
      router.push("/(tabs)/chores");
    },
    onError: (error) => {
      console.error("Error completing chore:", error);
    },
  });

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!chore) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Sysslans information"
        leftAction={{ 
          icon: "arrow-left", 
          onPress: () => router.push("/(tabs)/chores")
        }}
        rightActions={
          isAdmin
            ? [
                {
                  icon: "pen",
                  onPress: () => router.push(`/chores/edit/${chore.id}`),
                },
              ]
            : undefined
        }
      />

      <ScrollView style={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.choreName, { color: colors.text }]}>{chore.name}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.description, { color: colors.text }]}>{chore.description}</Text>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.infoLabel, { color: colors.text }]}>Återkommer:</Text>
          <View style={styles.frequencyContainer}>
            <Text style={[styles.varText, { color: colors.text }]}>var</Text>
            <View
              style={[
                styles.numberBadge,
                chore.is_overdue
                  ? styles.numberBadgeRed
                  : styles.numberBadgeGreen,
              ]}
            >
              <Text style={styles.numberBadgeText}>{chore.frequency}</Text>
            </View>
            <Text style={[styles.varText, { color: colors.text }]}>dag</Text>
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View>
            <Text style={[styles.infoLabel, { color: colors.text }]}>Värde:</Text>
            <Text style={[styles.infoSubtitle, { color: colors.textSecondary }]}>
              Hur energikrävande är sysslan?
            </Text>
          </View>
          <View style={styles.numberBadgeGray}>
            <Text style={styles.numberBadgeText}>{chore.weight}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.buttonContainer, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.completeButton, { backgroundColor: colors.buttonPrimary }]}
          onPress={() => completeMutation.mutate()}
          disabled={completeMutation.isPending}
        >
          <Text style={styles.completeButtonText}>
            {completeMutation.isPending ? "Markerar..." : "Markera som gjord ✓"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  choreName: {
    fontSize: 18,
    fontWeight: "500",
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  infoCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  infoSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  frequencyContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  varText: {
    fontSize: 16,
  },
  numberBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  numberBadgeGreen: {
    backgroundColor: "#6AC08B",
  },
  numberBadgeRed: {
    backgroundColor: "#CD5D6F",
  },
  numberBadgeGray: {
    backgroundColor: "#9E9E9E",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberBadgeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  buttonContainer: {
    padding: 16,
  },
  completeButton: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  completeButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});