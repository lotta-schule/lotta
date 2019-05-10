import { UserActionType, LoginAction, LogoutAction } from '../actions/user';
import { UserState } from '../State';
import { mockData } from '../../mockData';

export type UserActions = LoginAction | LogoutAction;

export const initialUserState: UserState = mockData.user;

export const userReducer = (s: UserState = initialUserState, action: UserActions): UserState => {
    switch (action.type) {
        case UserActionType.LOGIN: {
            return {
                user: action.user,
                token: action.token
            } || initialUserState;
        }
        case UserActionType.LOGOUT:
            return initialUserState;
        default:
            return s;
    }
};
