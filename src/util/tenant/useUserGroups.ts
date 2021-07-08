import * as React from 'react';
import { UserGroupModel } from 'model/UserGroupModel';
import { useTenant } from './useTenant';

export const useUserGroups = (): UserGroupModel[] => {
    const tenant = useTenant();
    const groups = React.useMemo(() => tenant?.groups ?? [], [tenant]);
    return React.useMemo(
        () => [...groups].sort((g1, g2) => g1.sortKey - g2.sortKey),
        [groups]
    );
};
