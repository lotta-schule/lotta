import React, { FunctionComponent, memo } from 'react';
import { Grid, makeStyles, Container } from '@material-ui/core';
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
        height: 200,
        backgroundSize: 'cover',
        '& > h5': {
            textAlign: 'right',
            background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.6) 0%,rgba(255,255,255,0) 100%)',
            padding: '0.7em',
            color: '#fff',
            fontWeight: 'bold',
        }
    }
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
            <header
                className={styles.header}
                style={{ backgroundImage: 'url(https://placeimg.com/1000/200/any)' }}
            >
                <Typography variant="h5" gutterBottom>{client.title}</Typography>
                <div />
            </header>
            <Navbar categories={categories} />
            <main style={{ marginTop: '.5em', maxWidth: '100%' }}>
                <Grid container justify={'flex-start'}>
                    <Grid item xs>
                        <main style={{ width: '100%', height: '100%'}}>
                            {children}
                        </main>
                    </Grid>
                    <Grid item component={'aside'} xs={12} md={2} xl={3} style={{ margin: '1em'}}>
                        <ConnectedUserNavigation />
                        {sidebar}
                    </Grid>
                </Grid>
            </main>
        </Container>
    );
});