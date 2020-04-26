import { useMemo } from 'react';
import { UserGroupModel } from 'model/UserGroupModel';
import { useTenant } from './useTenant';

export const useUserGroups = (): UserGroupModel[] => {
    const tenant = useTenant();
    return useMemo(() => [...tenant.groups].sort((g1, g2) => g1.sortKey - g2.sortKey), [tenant.groups]);
}