import React, { FunctionComponent, memo } from 'react';
import { Grid } from '@material-ui/core';
import { Navbar } from './navigation/Navbar';
import { ConnectedUserNavigation } from './navigation/ConnectedUserNavigation';
import { CategoryModel } from '../../model';
import Typography from '@material-ui/core/Typography';

export interface BaseLayoutStateProps {
    categories?: CategoryModel[];
}

export interface BaseLayoutProps extends BaseLayoutStateProps {
    sidebar?: JSX.Element;
}

export const BaseLayout: FunctionComponent<BaseLayoutProps> = memo(({ children, sidebar, categories }) => {
    return (
        <Grid container direction={'column'} justify={'flex-start'}>
            <Grid component={'header'} style={{ maxWidth: '100%' }}>
                <Typography variant="h4" gutterBottom>Christian-Gottfried-Ehrenberg-Gymnasium Delitzsch
                </Typography>
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