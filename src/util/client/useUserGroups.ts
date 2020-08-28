import { useMemo } from 'react';
import { UserGroupModel } from 'model/UserGroupModel';
import { useSystem } from './useSystem';

export const useUserGroups = (): UserGroupModel[] => {
    const system = useSystem();
    const groups = useMemo(() => system?.groups ?? [], [system]);
    return useMemo(() => [...groups].sort((g1, g2) => g1.sortKey - g2.sortKey), [groups]);
}
