import React, { MouseEvent, memo, ReactNode, ReactNodeArray } from 'react';
import {
    Button,
    makeStyles,
    Theme,
    CircularProgress,
    ButtonProps,
} from '@material-ui/core';
import { DoneOutline } from '@material-ui/icons';
import clsx from 'clsx';

export interface SaveButtonProps
    extends Pick<ButtonProps, 'type' | 'style' | 'fullWidth'> {
    isLoading?: boolean;
    isSuccess?: boolean;
    disabled?: boolean;
    className?: string;
    onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
    children?: ReactNode | ReactNodeArray;
}

export const useStyles = makeStyles<Theme, { isSuccess?: boolean }>(
    (theme) => ({
        root: {
            color: ({ isSuccess }) =>
                isSuccess ? 'green' : theme.palette.secondary.main,
            borderColor: ({ isSuccess }) =>
                isSuccess ? 'green' : theme.palette.secondary.main,
            pointerEvents: ({ isSuccess }) => (isSuccess ? 'none' : 'inherit'),
            '& .icon': {
                color: 'green',
            },
        },
        progressCircle: {
            color: theme.palette.text.disabled,
        },
    })
);

export const SaveButton = memo<SaveButtonProps>(
    ({
        children,
        className,
        isSuccess,
        isLoading,
        disabled,
        ...buttonProps
    }) => {
        const styles = useStyles({ isSuccess });
        const icon = (() => {
            if (isLoading) {
                return (
                    <CircularProgress
                        size={'1em'}
                        classes={{ circle: styles.progressCircle }}
                    />
                );
            } else if (isSuccess) {
                return <DoneOutline color={'action'} className={'icon'} />;
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
    }
);
