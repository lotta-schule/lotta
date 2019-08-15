import { /*get,*/ set, remove } from 'js-cookie';
import { UserActionType, LoginAction, LogoutAction } from '../actions/user';
// import { UserModel } from 'model';
import { UserState } from '../State';
// import jwtDecode from 'jwt-decode';
import Matomo from 'matomo-ts';

export type UserActions = LoginAction | LogoutAction;

export const initialUserState: UserState = {
    user: (() => {
        // const token = get(process.env.REACT_APP_AUTHENTICATION_TOKEN_NAME);
        // if (token) {
        //     const decoded: any = jwtDecode(token);
        //     if (decoded.exp * 1000 > new Date().getTime()) {
        //         return {
        //             id: decoded.sub,
        //             name: decoded.name,
        //             nickname: decoded.nickname,
        //             email: decoded.email,
        //             class: decoded.class,
        //             avatar: '',
        //             groups: decoded.groups
        //         } as UserModel;
        //     }
        // }
        return null;
    })()
};

export const userReducer = (s: UserState = initialUserState, action: UserActions): UserState => {
    switch (action.type) {
        case UserActionType.LOGIN: {
            set(process.env.REACT_APP_AUTHENTICATION_TOKEN_NAME, action.token, {
                domain: process.env.REACT_APP_APP_BASE_DOMAIN
            });
            Matomo.default().setUserId(action.user.id);
            return {
                user: action.user
            };
        }
        case UserActionType.LOGOUT:
            remove(process.env.REACT_APP_AUTHENTICATION_TOKEN_NAME, {
                domain: process.env.REACT_APP_APP_BASE_DOMAIN
            });
            Matomo.default().resetUserId();
            return {
                user: null
            };
        default:
            return s;
    }
};
