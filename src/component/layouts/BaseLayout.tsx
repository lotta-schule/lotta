import React, { FunctionComponent, memo } from 'react';
import { Grid, makeStyles, Container } from '@material-ui/core';
import { Navbar } from './navigation/Navbar';
import { ConnectedUserNavigation } from './navigation/ConnectedUserNavigation';
import { CategoryModel } from '../../model';
import Typography from '@material-ui/core/Typography';


const useStyles = makeStyles(() => ({
    root: {
        backgroundColor: '#efefef'
    },
    header: {
        minWidth: '100%',
        height: 200,
        backgroundSize:'cover',
        '& > h5': {
            textAlign: 'right',
            background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.6) 0%,rgba(255,255,255,0) 100%)',
            padding: '0.7em',
            color: '#fff',
            fontWeight: 'bold',
        }
    }
}));

export interface BaseLayoutStateProps {
    categories?: CategoryModel[];
}

export interface BaseLayoutProps extends BaseLayoutStateProps {
    sidebar?: JSX.Element;
}

export const BaseLayout: FunctionComponent<BaseLayoutProps> = memo(({ children, sidebar, categories }) => {
    const styles = useStyles();
    return (
        <Container className={styles.root}>
            <header
                className={styles.header}
                style={{ backgroundImage: 'url(https://placeimg.com/1000/200/any)' }}
            >
                <Typography variant="h5" gutterBottom>Christian-Gottfried-Ehrenberg-Gymnasium Delitzsch
                </Typography>
                <div  />
            </header>
            <Navbar categories={categories} />
            <main style={{ marginTop: '.5em', maxWidth: '100%' }}>
                <Grid container justify={'flex-start'}>
                    <Grid item xs>
                        <main style={{ width: '100%', height: '100%' }}>
                            {children}
                        </main>
                    </Grid>
                    <Grid item component={'aside'} xs={12} md={2} xl={4}>
                        <ConnectedUserNavigation />
                        {sidebar}
                    </Grid>
                </Grid>
            </main>
        </Container>
    );
});