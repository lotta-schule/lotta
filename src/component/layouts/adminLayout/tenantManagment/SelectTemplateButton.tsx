import React, { MouseEvent as ReactMouseEvent, memo } from 'react';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import ButtonBase from '@material-ui/core/ButtonBase';
import Typography from '@material-ui/core/Typography';

export interface SelectTemplateButtonProps {
    imageUrl: string;
    title: string;
    onClick?(event: ReactMouseEvent<HTMLButtonElement, MouseEvent>): void;
};

const useStyles = makeStyles((theme: Theme) => createStyles({
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
            '& $imageBackdrop': {
                opacity: 0.15,
            },
            '& $imageMarked': {
                opacity: 0,
            },
            '& $imageTitle': {
                border: '4px solid currentColor',
            },
        },
    },
    focusVisible: {},
    imageButton: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.palette.common.white,
    },
    imageSrc: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundSize: 'cover',
        backgroundPosition: 'center 40%',
    },
    imageBackdrop: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: theme.palette.common.black,
        opacity: 0.4,
        transition: theme.transitions.create('opacity'),
    },
    imageTitle: {
        position: 'relative',
        padding: `${theme.spacing(2)}px ${theme.spacing(4)}px ${theme.spacing(1) + 6}px`,
    },
    imageMarked: {
        height: 3,
        width: 18,
        backgroundColor: theme.palette.common.white,
        position: 'absolute',
        bottom: -2,
        left: 'calc(50% - 9px)',
        transition: theme.transitions.create('opacity'),
    },
}));

export const SelectTemplateButton = memo<SelectTemplateButtonProps>(({ imageUrl, title, onClick }) => {
    const classes = useStyles();

    return (
        <ButtonBase
            focusRipple
            key={imageUrl}
            className={classes.root}
            focusVisibleClassName={classes.focusVisible}
            onClick={onClick}
        >
            <span
                className={classes.imageSrc}
                style={{
                    backgroundImage: `url(${imageUrl})`,
                }}
            />
            <span className={classes.imageBackdrop} />
            <span className={classes.imageButton}>
                <Typography
                    component="span"
                    variant="subtitle1"
                    color="inherit"
                    className={classes.imageTitle}
                >
                    {title}
                    <span className={classes.imageMarked} />
                </Typography>
            </span>
        </ButtonBase>
    );
});