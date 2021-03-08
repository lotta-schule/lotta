import React, { FunctionComponent, memo, FocusEvent } from 'react';
import { Typography, makeStyles, Theme } from '@material-ui/core';
import clsx from 'clsx';

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        padding: theme.spacing(0, 1),
    },
    figcaption: {
        borderBottom: `1px solid ${theme.palette.secondary.main}`,
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        width: '100%',
    },
}));

interface ImageCaptionProps {
    isEditModeEnabled: boolean;
    value: string;
    onUpdate(caption: string): void;
}

export const ImageCaption: FunctionComponent<ImageCaptionProps> = memo(
    ({ isEditModeEnabled, value, onUpdate }) => {
        const styles = useStyles();

        return (
            <figcaption className={styles.root}>
                <Typography
                    variant={'subtitle2'}
                    placeholder={
                        isEditModeEnabled ? 'Bildbeschreibung' : undefined
                    }
                    component={isEditModeEnabled ? 'input' : 'span'}
                    contentEditable={isEditModeEnabled}
                    defaultValue={value}
                    children={isEditModeEnabled ? undefined : value}
                    className={clsx({ [styles.figcaption]: isEditModeEnabled })}
                    onBlur={
                        isEditModeEnabled
                            ? (e: FocusEvent<HTMLInputElement>) =>
                                  onUpdate((e.target as HTMLInputElement).value)
                            : undefined
                    }
                />
            </figcaption>
        );
    }
);
