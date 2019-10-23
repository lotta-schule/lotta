import React, { memo } from 'react';
import { Grid, makeStyles, Container, CardMedia } from '@material-ui/core';
import { Navbar } from './navigation/Navbar';
import { ClientModel } from '../../model';
import { useIsMobile } from 'util/useIsMobile';
import { usePiwikAnalytics } from 'util/usePiwikAnalytics';
import { useQuery } from '@apollo/react-hooks';
import Typography from '@material-ui/core/Typography';
import { GetTenantQuery } from 'api/query/GetTenantQuery';


const useStyles = makeStyles(() => ({
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
    }
}));


export const BaseLayout = memo(({ children }) => {
    usePiwikAnalytics();
    const styles = useStyles();
    const isMobile = useIsMobile();
    const { data } = useQuery<{ tenant: ClientModel }>(GetTenantQuery);
    return (
        <Container>
            <header className={styles.header}>
                <Grid container style={{ display: 'flex', height: '100%' }}>
                    <Grid item xs={false} sm={3} style={{ display: 'flex', }} >
                        <CardMedia
                            style={{ height: '80%', backgroundSize: 'contain', margin: 'auto auto', width: '100%' }}
                            image='/img/logo_neu.png'
                        />
                    </Grid>
                    <Grid item xs={12} sm={9} style={{ display: 'flex', flexDirection: 'row-reverse', paddingRight: '1em' }}>
                        <Typography variant="h5" gutterBottom style={{ margin: 'auto 0' }}>{data!.tenant.title}</Typography>
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