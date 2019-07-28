import { LayoutState } from '../State';
import { OpenDrawerAction, CloseDrawerAction, LayoutActionType } from '../actions/layout';

export type LayoutActions = OpenDrawerAction | CloseDrawerAction;

export const initialLayoutState: LayoutState = {
    isDrawerOpen: false
};

export const layoutReducer = (s: LayoutState = initialLayoutState, action: LayoutActions): LayoutState => {
    switch (action.type) {
        case LayoutActionType.OPEN_DRAWER:
            return {
                ...s,
                isDrawerOpen: true
            };
        case LayoutActionType.CLOSE_DRAWER:
            return {
                ...s,
                isDrawerOpen: false
            };
        default:
            return s;
    }
};
