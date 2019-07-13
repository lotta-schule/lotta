import React, { FunctionComponent, memo } from 'react';
import { Grid, makeStyles, Container, CardMedia } from '@material-ui/core';
import { Navbar } from './navigation/Navbar';
import { ConnectedUserNavigation } from './navigation/ConnectedUserNavigation';
import { CategoryModel, ClientModel } from '../../model';
import Typography from '@material-ui/core/Typography';
import { useSelector } from 'react-redux';
import { State } from 'store/State';


const useStyles = makeStyles(() => ({
    root: {
        backgroundColor: '#efefef'
    },
    header: {
        minWidth: '100%',
        height: '100px',
        backgroundSize: 'cover',
        textAlign: 'right',
    },
}));


export interface ConnectedBaseLayoutProps {
    sidebar?: JSX.Element;
}

export const ConnectedBaseLayout: FunctionComponent<ConnectedBaseLayoutProps> = memo(({ children, sidebar }) => {
    const styles = useStyles();
    const client = useSelector<State, ClientModel>(state => state.client.client!);
    const categories = useSelector<State, CategoryModel[]>(state => state.client.categories);
    return (
        <Container className={styles.root}>
            <header className={styles.header}>
                <Grid container style={{ display: 'flex', height: '100%' }}>
                    <Grid xs={12} sm={3}>
                        <CardMedia
                        style={{ maxHeight: 80, width: '100%', height: '100%', flexShrink: 0, flexGrow: 0, marginTop: '10px' }}
                        image="https://placeimg.com/300/80/any"
                        />
                    </Grid>
                    <Grid item xs={12} sm={9}>
                        <Typography variant="h5" gutterBottom style={{padding: '0.9em', marginBottom: '0'}}>{client.title}</Typography>
                    </Grid>
                </Grid>
            </header>
            <Navbar categories={categories} />
            <main style={{ marginTop: '.5em', maxWidth: '100%', paddingBottom: '1em' }}>
                <Grid container justify={'flex-start'}>
                    <Grid item xs>
                        <main style={{ width: '100%', height: '100%'}}>
                            {children}
                        </main>
                    </Grid>
                    <Grid item component={'aside'} xs={12} md={3} xl={3} style={{ marginLeft: '0.5em'}}>
                        <ConnectedUserNavigation />
                        {sidebar}
                    </Grid>
                </Grid>
            </main>
        </Container>
    );
});