declare module 'material-ui-popup-state' {
    import { ComponentType } from 'react';

    export interface PopupState {
        close(): void;
    }

    export interface PopupStateProps {
        variant: 'popover' | 'popup' | 'popper';
        popupId: string;
        children(state: PopupState): JSX.Element;
    }

    export default PopupState as ComponentType<PopupStateProps>;

    export const bindTrigger = (state: PopupState) => any;
    export const bindMenu = (state: PopupState) => any;
};