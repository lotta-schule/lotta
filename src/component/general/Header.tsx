import React, { memo } from 'react';
import { Grid, makeStyles, Theme } from '@material-ui/core';
import { UserNavigation } from 'component/layouts/navigation/UserNavigation';

export interface HeaderProps {
    bannerImageUrl?: string;
    children?: any;
}

const useStyles = makeStyles<Theme, HeaderProps>(theme => ({
    root: {
        background: '#ffffff',
        borderRadius: theme.shape.borderRadius,
        boxShadow: 'none',
        '& h2': {
            color: theme.palette.text.primary,
            padding: theme.spacing(1),
            fontSize: '1.5rem',
            letterSpacing: 5,
            textTransform: 'uppercase'
        }
    },
    subheader: {
        height: 120,
        background: ({ bannerImageUrl }) => bannerImageUrl ?  `url(${bannerImageUrl})` : 'none',
        borderWidth: theme.spacing(1, 0, 1, 1),
        borderStyle: 'solid',
        borderColor: '#ffffff',
        width: '100%',
        flexShrink: 1,
        flexGrow: 1,
        position: 'relative',
        '&::after': {
            position: 'absolute',
            display: 'block',
            content: `''`,
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(to right, #ffffff00 75%, #ffffffff 98%)'
        }
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
        [theme.breakpoints.down('sm')]: {
            display: 'none'
        }
    }
}));

export const Header = memo<HeaderProps>(({ children, bannerImageUrl }) => {
    const styles = useStyles({ bannerImageUrl });

    return (
        <Grid container className={styles.root} data-testid="Header">
            <Grid item xs={12} sm={8} xl={9} className={styles.subheader} data-testid="HeaderContent">
                {children}
            </Grid>
            <Grid item xs={false} sm={4} xl={3} className={styles.userNavigationGridItem}>
                <UserNavigation />
            </Grid>
        </Grid>
    );
});
