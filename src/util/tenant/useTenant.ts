import { TenantModel } from 'model';
import { useQuery } from '@apollo/client';
import { GetTenantQuery } from 'api/query/GetTenantQuery';

export const useTenant = (): TenantModel => {
    const { data } = useQuery<{ tenant: TenantModel }>(GetTenantQuery, {
        onCompleted: ({ tenant }) => {
            window.tid = tenant.id;
        },
    });
    return (
        data?.tenant ??
        (({
            title: '',
            host: '',
            slug: '',
            groups: [],
            configuration: {},
            updatedAt: new Date().toISOString(),
            insertedAt: new Date().toISOString(),
        } as unknown) as TenantModel)
    );
};
