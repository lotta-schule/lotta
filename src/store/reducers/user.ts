import { UserActionType, LoginAction, LogoutAction } from '../actions/user';
import { UserState } from '../State';
import { mockData } from '../../mockData';
import { set, remove } from 'js-cookie';

export type UserActions = LoginAction | LogoutAction;

export const initialUserState: UserState = mockData.user;

export const userReducer = (s: UserState = initialUserState, action: UserActions): UserState => {
    switch (action.type) {
        case UserActionType.LOGIN: {
            set(process.env.REACT_APP_AUTHENTICATION_TOKEN_NAME, action.token, {
                domain: process.env.REACT_APP_APP_BASE_DOMAIN
            });
            return {
                user: action.user
            };
        }
        case UserActionType.LOGOUT:
            remove(process.env.REACT_APP_AUTHENTICATION_TOKEN_NAME, {
                domain: process.env.REACT_APP_APP_BASE_DOMAIN
            })
            return {
                user: null
            };
        default:
            return s;
    }
};
