import React, { memo } from 'react';
import { Grid, makeStyles, Theme } from '@material-ui/core';
import { UserNavigation } from 'component/layouts/navigation/UserNavigation';

export interface HeaderProps {
    bannerImageUrl?: string;
    children?: any;
}

const useStyles = makeStyles<Theme, HeaderProps>((theme) => ({
    root: {
        borderRadius: 0,
        boxShadow: 'none',
        padding: theme.spacing(1),
        backgroundColor: theme.palette.background.paper,
        '& h2': {
            color: theme.palette.text.primary,
            padding: theme.spacing(1),
            fontSize: '1.5rem',
            letterSpacing: 5,
            textTransform: 'uppercase',
        },
    },
    subheader: {
        minHeight: 120,
        backgroundImage: ({ bannerImageUrl }) =>
            bannerImageUrl ? `url(${bannerImageUrl})` : 'none',
        backgroundSize: 'cover',
        width: '100%',
        [theme.breakpoints.down('sm')]: {
            maxWidth: 'initial',
        },
        flexShrink: 1,
        flexGrow: 1,
        position: 'relative',
        '&::after': {
            position: 'absolute',
            display: ({ bannerImageUrl }) =>
                bannerImageUrl ? 'block' : 'none',
            content: `''`,
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            background:
                'linear-gradient(to right, #ffffff00 75%, #ffffffff 98%)',
        },
    },
    bannerheading: {
        textTransform: 'uppercase',
        letterSpacing: '5px',
        fontSize: '1.5em',
        textShadow: '1px 1px 15px #fff',
        padding: '0.6em',
        color: theme.palette.primary.dark,
    },
    userNavigationGridItem: {
        paddingLeft: theme.spacing(1),
        [theme.breakpoints.down('sm')]: {
            display: 'none',
        },
    },
}));

export const Header = memo<HeaderProps>(({ children, bannerImageUrl }) => {
    const styles = useStyles({ bannerImageUrl });

    return (
        <Grid container className={styles.root} data-testid="Header">
            <Grid
                item
                xs={12}
                sm={8}
                className={styles.subheader}
                data-testid="HeaderContent"
            >
                {children}
            </Grid>
            <Grid
                item
                xs={false}
                sm={4}
                className={styles.userNavigationGridItem}
            >
                <UserNavigation />
            </Grid>
        </Grid>
    );
});
