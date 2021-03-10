import { ClientModel } from 'model';
import { useQuery } from '@apollo/client';
import { GetSystemQuery } from 'api/query/GetSystemQuery';

export const useSystem = (): ClientModel => {
    const { data } = useQuery<{ system: ClientModel }>(GetSystemQuery);
    return (
        data?.system ??
        (({
            title: '',
            host: '',
            slug: '',
            groups: [],
            customDomains: [],
            updatedAt: new Date().toISOString(),
            insertedAt: new Date().toISOString(),
        } as unknown) as ClientModel)
    );
};
