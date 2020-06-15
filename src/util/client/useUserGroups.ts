import { useMemo } from 'react';
import { UserGroupModel } from 'model/UserGroupModel';
import { useTenant } from './useTenant';

export const useUserGroups = (): UserGroupModel[] => {
    const tenant = useTenant();
    const groups = tenant?.groups ?? [];
    return useMemo(() => [...groups].sort((g1, g2) => g1.sortKey - g2.sortKey), [groups]);
}
