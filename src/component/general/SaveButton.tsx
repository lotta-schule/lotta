import React, { MouseEvent, memo, ReactNode, ReactNodeArray } from 'react';
import { Button, makeStyles, Theme, LinearProgress, ButtonProps } from '@material-ui/core';
import { DoneOutline } from '@material-ui/icons';
import clsx from 'clsx';

export interface SaveButtonProps extends Pick<ButtonProps, 'type' | 'style' | 'fullWidth'> {
    isLoading?: boolean;
    isSuccess?: boolean;
    disabled?: boolean;
    className?: string;
    onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
    children?: ReactNode | ReactNodeArray;
}

export const useStyles = makeStyles<Theme, { isSuccess?: boolean }>(theme => ({
    root: {
        color: ({ isSuccess }) => isSuccess ? 'green' : theme.palette.secondary.main,
        borderColor: ({ isSuccess }) => isSuccess ? 'green' : theme.palette.secondary.main,
        pointerEvents: ({ isSuccess }) => isSuccess ? 'none' : 'inherit',
        '& .icon': {
            color: 'green',
            fontSize: '0.875rem',
            lineHeight: '0.875rem',
        }
    },
    progressCircle: {
        color: theme.palette.text.disabled
    }
}));

export const SaveButton = memo<SaveButtonProps>(({ children, className, isSuccess, isLoading, disabled, ...buttonProps }) => {
    const styles = useStyles({ isSuccess });
    const icon = (() => {
        if (isLoading) {
            return <LinearProgress />;
        } else if (isSuccess) {
            return <Button size="small" className={'icon'} startIcon={<DoneOutline />}>gespeichert</Button>
        } else {
            return null;
        }
    })();
    return (
        <Button
            className={clsx(styles.root, className)}
            color={'secondary'}
            variant={'outlined'}
            disabled={disabled || isLoading}
            startIcon={icon}
            {...buttonProps}
        >
            {isSuccess ? <>&nbsp;</> : children}
        </Button>
    );
});