import { Chore, getChores, getCompletionsByRange } from "@/api/chores";
import { getHouseholdMembers, HouseholdMember } from "@/api/household";
import { AvatarKey } from "@/utils/avatar";

export interface UserSlice {
  userId: string;
  value: number;
  avatar?: AvatarKey | null;
  name?: string | null;
}

export interface ChoreStat {
  choreId: string;
  name: string;
  slices: UserSlice[];
  total: number;
}

export interface StatsBundle {
  total: UserSlice[];
  chores: ChoreStat[];
}

/**
 * Beräknar viktad fördelning per användare (totalt) och per syssla
 * inom [from, to] för ett hushåll. Vikt = chore.weight (default 1).
 */
export async function computeStats(
  householdId: string,
  from: Date,
  to: Date
): Promise<StatsBundle> {
  const [completions, chores, members] = await Promise.all([
    getCompletionsByRange(householdId, from, to),
    getChores(householdId),
    getHouseholdMembers(householdId),
  ]);

  const choreById = new Map<string, Chore>();
  chores.forEach((c) => choreById.set(c.id, c));

  const memberByUserId = new Map<string, HouseholdMember>();
  members.forEach((m) => memberByUserId.set(m.userId, m));

  const totalByUser = new Map<string, number>();
  const perChoreByUser = new Map<string, Map<string, number>>();

  for (const row of completions) {
    const chore = choreById.get(row.chore_id);
    const weight = (chore?.weight ?? 1) || 1;
    const userId = row.done_by_user_id;

    totalByUser.set(userId, (totalByUser.get(userId) ?? 0) + weight);

    if (!perChoreByUser.has(row.chore_id)) {
      perChoreByUser.set(row.chore_id, new Map<string, number>());
    }
    const inner = perChoreByUser.get(row.chore_id)!;
    inner.set(userId, (inner.get(userId) ?? 0) + weight);
  }

  const total: UserSlice[] = Array.from(totalByUser.entries())
    .map(([userId, value]) => {
      const m = memberByUserId.get(userId);
      return {
        userId,
        value,
        avatar: m?.avatar ?? null,
        name: m?.name ?? null,
      };
    })
    .sort((a, b) => b.value - a.value);

  const choresStats: ChoreStat[] = Array.from(perChoreByUser.entries()).map(
    ([choreId, byUser]) => {
      const c = choreById.get(choreId);
      const slices: UserSlice[] = Array.from(byUser.entries())
        .map(([userId, value]) => {
          const m = memberByUserId.get(userId);
          return {
            userId,
            value,
            avatar: m?.avatar ?? null,
            name: m?.name ?? null,
          };
        })
        .sort((a, b) => b.value - a.value);

      const total = slices.reduce((sum, s) => sum + s.value, 0);
      return {
        choreId,
        name: c?.name ?? "Okänd syssla",
        slices,
        total,
      };
    }
  );

  choresStats.sort((a, b) => b.total - a.total);

  return { total, chores: choresStats };
}
