declare module 'material-ui-popup-state' {
    import { ComponentType, ReactNode } from 'react';

    export type EventOrAnchorElement = Event | HTMLElement;

    export interface PopupState {
        isOpen: boolean;
        anchorEl: HTMLElement;
        popupId: string;
        variant: 'popover' | 'popup' | 'popper';
        open(eventOrAnchorEl: EventOrAnchorElement): void;
        toggle(eventOrAnchorEl: EventOrAnchorElement): void;
        setOpen(open: boolean, eventOrAnchorEl: EventOrAnchorElement): void;
        close(): void;
        setAnchorEl(anchorEl: HTMLElement): void;
    }

    export interface PopupStateProps {
        variant: 'popover' | 'popup' | 'popper';
        popupId: string;
    }

    export default PopupState as ComponentType<
        PopupStateProps & { children(state: PopupState): ReactNode }
    >;

    export function bindTrigger(state: PopupState): any;
    export function bindPopover(state: PopupState): any;
    export function bindMenu(state: PopupState): any;
}

declare module 'material-ui-popup-state/hooks' {
    export type EventOrAnchorElement = Event | HTMLElement;

    export interface PopupState {
        isOpen: boolean;
        anchorEl: HTMLElement;
        popupId: string;
        variant: 'popover' | 'popup' | 'popper';
        open(eventOrAnchorEl: EventOrAnchorElement): void;
        toggle(eventOrAnchorEl: EventOrAnchorElement): void;
        setOpen(open: boolean, eventOrAnchorEl: EventOrAnchorElement): void;
        close(): void;
        setAnchorEl(anchorEl: HTMLElement): void;
    }

    export interface PopupStateProps {
        variant: 'popover' | 'popup' | 'popper';
        popupId: string;
    }

    export function bindTrigger(state: PopupState): any;
    export function bindPopover(state: PopupState): any;
    export function bindMenu(state: PopupState): any;

    export function usePopupState(options: PopupStateProps): PopupState;
}
