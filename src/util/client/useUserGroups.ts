import { useMemo } from 'react';
import { UserGroupModel } from 'model/UserGroupModel';
import { useTenant } from './useTenant';

export const useUserGroups = (): UserGroupModel[] => {
    const tenant = useTenant();
    return useMemo(() => tenant.groups, [tenant.groups]);
}