import { ActionCreator, Action } from 'redux';
import { UserModel } from '../../model';

// Action Types

export enum UserActionType {
    LOGIN = '[UserAction] login',
    LOGOUT = '[UserAction] logout'
}


// Actions

export type LoginAction = Action<UserActionType.LOGIN> & { user: UserModel; token: string };

export type LogoutAction = Action<UserActionType.LOGOUT>;

// Action Creators

export const createLoginAction: ActionCreator<LoginAction> = (user: UserModel, token: string) => ({
    user,
    token,
    type: UserActionType.LOGIN
});

export const createLogoutAction: ActionCreator<LogoutAction> = () => ({
    type: UserActionType.LOGOUT
});