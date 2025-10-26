import {
  createHousehold,
  householdKeys,
  joinHouseholdByCode,
  updateHouseholdName,
  leaveHousehold,
  removeMember,
} from '@/api/household';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useHouseholdMutations(userId: string) {
  const queryClient = useQueryClient();

  const createHouseholdMutation = useMutation({
    mutationFn: (name: string) => createHousehold({ name, ownerId: userId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: householdKeys.list(userId) }),
  });

  const joinHouseholdMutation = useMutation({
    mutationFn: (code: string) => joinHouseholdByCode({ code, userId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: householdKeys.list(userId) }),
  });

  const renameHouseholdMutation = useMutation({
    mutationFn: (payload: { id: string; name: string }) =>
      updateHouseholdName(payload.id, payload.name),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: householdKeys.list(userId) });
      queryClient.invalidateQueries({ queryKey: householdKeys.detail(id) });
    },
  });

  const leaveHouseholdMutation = useMutation({
    mutationFn: (householdId: string) => leaveHousehold(userId, householdId),
    onSuccess: (_, householdId) => {
      queryClient.invalidateQueries({ queryKey: householdKeys.list(userId) });
      queryClient.invalidateQueries({ queryKey: householdKeys.members(householdId) });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: ({ householdId, memberId }: { householdId: string; memberId: string }) =>
      removeMember(userId, householdId, memberId),
    onSuccess: (_, { householdId }) => {
      queryClient.invalidateQueries({ queryKey: householdKeys.list(userId) });
      queryClient.invalidateQueries({ queryKey: householdKeys.members(householdId) });
    },
  });

  return {
    createHouseholdMutation,
    joinHouseholdMutation,
    renameHouseholdMutation,
    leaveHouseholdMutation,
    removeMemberMutation,
  };
}
