import { useSelector } from 'react-redux';
import { State } from 'store/State';
import { ClientModel } from 'model';

export const useTenant = (): ClientModel => {
    return useSelector<State, ClientModel>(s => s.client.client!);
}