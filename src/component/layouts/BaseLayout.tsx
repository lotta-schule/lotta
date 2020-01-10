import React, { memo } from 'react';
import { Grid, Container, Theme, makeStyles } from '@material-ui/core';
import { Navbar } from './navigation/Navbar';
import { useIsMobile } from 'util/useIsMobile';
import { usePiwikAnalytics } from 'util/usePiwikAnalytics';
import { useTenant } from 'util/client/useTenant';
import { ClientModel } from 'model';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles<Theme, { tenant: ClientModel }>(theme => ({
    '@global': {
        body: {
            backgroundColor: theme.palette.background.default,
            backgroundAttachment: 'fixed',
            backgroundSize: 'cover',
            [theme.breakpoints.up('md')]: {
                backgroundImage: ({ tenant }) => tenant.backgroundImageFile ? `url(${tenant.backgroundImageFile.remoteLocation})` : undefined,
            }
        }
    },
    header: {
        minWidth: '100%',
        height: 100,
        backgroundSize: 'cover',
        textAlign: 'right',
    },
    main: {
        marginTop: '.5em',
        maxWidth: '100%',
        paddingBottom: '1em'
    },
    logoGridItem: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingLeft: theme.spacing(2),
        [theme.breakpoints.down('sm')]: {
            display: 'none'
        },
    },
    titleGridItem: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
        paddingRight: theme.spacing(2),
        margin: 'auto 0'
    }
}));


export const BaseLayout = memo(({ children }) => {
    usePiwikAnalytics();
    const tenant = useTenant();
    const styles = useStyles({ tenant });
    const isMobile = useIsMobile();
    return (
        <Container>
            <header className={styles.header}>
                <Grid container style={{ height: '100%' }}>
                    <Grid item md={3} className={styles.logoGridItem}>
                        {tenant.logoImageFile && (
                            <img
                                src={`https://afdptjdxen.cloudimg.io/height/80/foil1/${tenant.logoImageFile.remoteLocation}`}
                                alt={`Logo ${tenant.title}`}
                            />
                        )}
                    </Grid>
                    <Grid item md={9} className={styles.titleGridItem}>
                        <Typography variant="h5" style={{ marginBottom: 0, }} gutterBottom>{tenant.title}</Typography>
                    </Grid>
                </Grid>
            </header>
            <Navbar />
            <main className={styles.main}>
                <Grid container justify={'flex-start'} direction={isMobile ? 'column-reverse' : 'row'}>
                    {children}
                </Grid>
            </main>
        </Container>
    );
});