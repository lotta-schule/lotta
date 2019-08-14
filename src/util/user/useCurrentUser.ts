import { useSelector } from 'react-redux';
import { State } from 'store/State';
import { UserModel } from 'model';

export const useCurrentUser = (): UserModel | null => {
    return useSelector<State, UserModel | null>(s => s.user.user);
}