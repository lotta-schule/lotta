import React, { FunctionComponent, memo, FormEvent } from 'react';
import { Typography, makeStyles, Theme } from '@material-ui/core';
import classNames from 'classnames';

const useStyles = makeStyles((theme: Theme) => ({
    figcaption: {
        borderBottom: `1px solid ${theme.palette.secondary.main}`,
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        width: '100%',
    }
}));

interface ImageCaptionProps {
    isEditModeEnabled: boolean;
    value: string;
    onUpdate(caption: string): void;
}

export const ImageCaption: FunctionComponent<ImageCaptionProps> = memo(({ isEditModeEnabled, value, onUpdate }) => {
    const styles = useStyles();

    return (
        <figcaption>
            <Typography
                variant={'subtitle2'}
                placeholder={isEditModeEnabled ? 'Bildbeschreibung' : undefined}
                component={isEditModeEnabled ? 'input' : 'span'}
                contentEditable={isEditModeEnabled}
                defaultValue={value}
                children={isEditModeEnabled ? undefined : value}
                className={classNames({ [styles.figcaption]: isEditModeEnabled })}
                onChange={isEditModeEnabled ? (e: FormEvent<HTMLInputElement>) => onUpdate((e.target as HTMLInputElement).value) : undefined}
            />
        </figcaption>
    );
});