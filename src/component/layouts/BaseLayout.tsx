import React, { FunctionComponent, memo } from 'react';
import { Grid, makeStyles } from '@material-ui/core';
import { Navbar } from './navigation/Navbar';
import { ConnectedUserNavigation } from './navigation/ConnectedUserNavigation';
import { CategoryModel } from '../../model';
import Typography from '@material-ui/core/Typography';


const useStyles = makeStyles(() => ({
    header: {
        minWidth: '100%',
        height: 200,
        '& > h5': {
            textAlign: 'right',
            background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.6) 0%,rgba(255,255,255,0) 100%)',
            padding: '0.7em',
            color: '#fff',
            fontSize: '22pt',
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
        <Grid container direction={'column'} justify={'flex-start'}>
            <Grid component={'header'} className={styles.header} style={{ backgroundImage: 'url(https://placeimg.com/1000/200/any)', backgroundSize:'cover' }}>
                <Typography variant="h5" gutterBottom>Christian-Gottfried-Ehrenberg-Gymnasium Delitzsch
                </Typography>
                <div  />
            </Grid>
            <Navbar categories={categories} />
            <Grid item style={{ marginTop: '.5em', maxWidth: '100%' }}>
                <Grid container spacing={8} justify={'flex-start'}>
                    <Grid item xs>
                        <main style={{ width: '100%', height: '100%' }}>
                            {children}
                        </main>
                    </Grid>
                    <Grid item component={'aside'} xs={3} md={4} lg={3} xl={2}>
                        <ConnectedUserNavigation />
                        {sidebar}
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
});