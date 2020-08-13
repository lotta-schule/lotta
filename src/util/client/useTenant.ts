import { ClientModel } from 'model';
import { useQuery } from '@apollo/client';
import { GetTenantQuery } from 'api/query/GetTenantQuery';

export const useTenant = (): ClientModel => {
    const { data } = useQuery<{ tenant: ClientModel }>(GetTenantQuery);
    return data?.tenant ?? {} as any;
}
