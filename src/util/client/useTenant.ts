import { ClientModel } from 'model';
import { useQuery } from '@apollo/react-hooks';
import { GetTenantQuery } from 'api/query/GetTenantQuery';

export const useTenant = (): ClientModel => {
    const { data } = useQuery<{ tenant: ClientModel }>(GetTenantQuery);
    return (data && data.tenant) as any;
}
