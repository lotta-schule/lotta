import { ClientModel } from 'model';
import { useQuery } from '@apollo/client';
import { GetSystemQuery } from 'api/query/GetSystemQuery';

export const useSystem = (): ClientModel => {
    const { data } = useQuery<{ system: ClientModel }>(GetSystemQuery);
    return data?.system ?? {} as any;
}
