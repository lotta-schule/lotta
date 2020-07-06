import React, { MouseEvent as ReactMouseEvent, memo } from 'react';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import ButtonBase from '@material-ui/core/ButtonBase';
import Typography from '@material-ui/core/Typography';
import get from 'lodash/get';

export interface SelectTemplateButtonProps {
    title: string;
    theme: Partial<Theme>;
    onClick?(event: ReactMouseEvent<HTMLButtonElement, MouseEvent>): void;
};

const useStyles = makeStyles<Theme, { partialTheme: Partial<Theme> }>((theme: Theme) => createStyles({
    root: {
        position: 'relative',
        height: 200,
        width: 200,
        [theme.breakpoints.down('xs')]: {
            width: '100px !important', // Overrides inline-style
            height: 100,
        },
        '&:hover, &$focusVisible': {
            zIndex: 1,
        },
    },
    focusVisible: {},
    imageButton: {
        position: 'absolute' as any,
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.palette.common.white,
        background: ({ partialTheme }) => {
            const primaryColor: string = get(partialTheme, 'palette.primary.main', get(theme, 'palette.primary.main'));
            const secondaryColor: string = get(partialTheme, 'palette.secondary.main', get(theme, 'palette.secondary.main'));
            const backgroundColor: string = get(partialTheme, 'palette.background.default', get(theme, 'palette.background.default'));
            return `linear-gradient(${primaryColor} 33%, ${secondaryColor} 33%, ${secondaryColor} 66%, ${backgroundColor} 66%)`;
        }
    },
    imageTitle: {
        position: 'relative',
        padding: `${theme.spacing(2)}px ${theme.spacing(4)}px ${theme.spacing(1) + 6}px`,
    }
}));

export const SelectTemplateButton = memo<SelectTemplateButtonProps>(({ title, theme: partialTheme, onClick }) => {
    const classes = useStyles({ partialTheme });

    return (
        <ButtonBase
            focusRipple
            className={classes.root}
            focusVisibleClassName={classes.focusVisible}
            onClick={onClick}
        >
            <span className={classes.imageButton}>
                <Typography
                    component="span"
                    variant="subtitle1"
                    color="inherit"
                    className={classes.imageTitle}
                >
                    {title}
                </Typography>
            </span>
        </ButtonBase>
    );
});