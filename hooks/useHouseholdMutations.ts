import {
  createHousehold,
  householdKeys,
  joinHouseholdByCode,
  updateHouseholdName,
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

  return { createHouseholdMutation, joinHouseholdMutation, renameHouseholdMutation };
}
