import { ActionCreator, Action } from 'redux';

// Action Types

export enum LayoutActionType {
    OPEN_DRAWER = '[LayoutAction] open drawer',
    CLOSE_DRAWER = '[LayoutAction] close drawer',
}

// Actions

export type OpenDrawerAction = Action<LayoutActionType.OPEN_DRAWER>;

export type CloseDrawerAction = Action<LayoutActionType.CLOSE_DRAWER>;

// Action Creators

export const createOpenDrawerAction: ActionCreator<OpenDrawerAction> = () => ({
    type: LayoutActionType.OPEN_DRAWER
});

export const createCloseDrawerAction: ActionCreator<CloseDrawerAction> = () => ({
    type: LayoutActionType.CLOSE_DRAWER
});