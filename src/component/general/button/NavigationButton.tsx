import * as React from 'react';
import { Button, ButtonProps } from './Button';
import clsx from 'clsx';
import './navigation-button.css';

export type NavigationButtonProps = ButtonProps;

export const NavigationButton = React.forwardRef<
    HTMLButtonElement,
    NavigationButtonProps
>((props, ref) => {
    return (
        <Button
            {...props}
            ref={ref}
            className={clsx('lotta-navigation-button', props.className)}
        />
    );
});
