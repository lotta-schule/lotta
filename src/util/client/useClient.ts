import { useSelector } from 'react-redux';
import { State } from 'store/State';
import { ClientModel } from 'model';

export const useTenant = (): ClientModel | null => {
    return useSelector<State, ClientModel | null>(state => state.client.client);
}