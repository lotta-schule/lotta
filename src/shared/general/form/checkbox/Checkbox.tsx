import * as React from 'react';
import { type ToggleProps } from '@react-types/checkbox';
import { VisuallyHidden } from '@react-aria/visually-hidden';
import { useFocusRing } from '@react-aria/focus';
import { useToggleState } from '@react-stately/toggle';
import { useCheckbox } from '@react-aria/checkbox';
import clsx from 'clsx';

import styles from './Checkbox.module.scss';

export type CheckboxProps = {
    featureColor?: [red: number, green: number, blue: number];

    className?: string;
    style?: React.CSSProperties;

    children?: React.ReactNode;
} & ToggleProps & React.AriaAttributes;

export const Checkbox = React.memo<CheckboxProps>(
    ({ children, style, className, featureColor, ...props }) => {
        const customStyle =
            featureColor &&
            ({
                '--control-indicator-color': featureColor.join(', '),
            } as React.CSSProperties);

        const ref = React.useRef() as React.MutableRefObject<HTMLInputElement>;
        const state = useToggleState(props);
        const { inputProps } = useCheckbox(props, state, ref);
        const { isFocusVisible, focusProps } = useFocusRing();

        return (
            <label style={{...style, ...customStyle}} className={clsx(className, styles.root)}>
                <VisuallyHidden>
                    <input
                        {...inputProps}
                        {...focusProps}
                        ref={ref}
                        className={clsx(className, styles.input)}
                    />
                </VisuallyHidden>
                <div className={clsx(styles.controlIndicator, {
                    [styles.isSelected]: state.isSelected,
                    [styles.isFocusVisible]: isFocusVisible,
                    [styles.isDisabled]: props.isDisabled
                })} />
                {children}
            </label>
        );
    }
);
Checkbox.displayName = 'Checkbox';
