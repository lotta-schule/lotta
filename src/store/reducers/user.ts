import { UserActionType, LoginAction, LogoutAction } from '../actions/user';
import { UserState } from '../State';
import jwtDecode from 'jwt-decode';
import { get, set, remove } from 'js-cookie';
import { UserModel } from 'model';

export type UserActions = LoginAction | LogoutAction;

export const initialUserState: UserState = {
    user: (() => {
        const token = get(process.env.REACT_APP_AUTHENTICATION_TOKEN_NAME);
        if (token) {
            const decoded: any = jwtDecode(token);
            if (decoded.exp * 1000 > new Date().getTime()) {
                return {
                    id: decoded.sub,
                    name: decoded.name,
                    email: decoded.email,

                } as UserModel;
            }
        }
        return null;
    })()
};

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
