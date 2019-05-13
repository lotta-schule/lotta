import React, { FunctionComponent, memo } from 'react';
import { Grid } from '@material-ui/core';
import { Navbar } from './navigation/Navbar';
import { ConnectedUserNavigation } from './navigation/ConnectedUserNavigation';
import { connect } from 'react-redux';
import { CategoryModel } from '../../model';
import { State } from '../../store/State';
import Typography from '@material-ui/core/Typography';

export interface PageLayoutStateProps {
    categories?: CategoryModel[];
}

export interface PageLayoutProps extends PageLayoutStateProps {
    sidebar?: JSX.Element;
}

const BaseLayout: FunctionComponent<PageLayoutProps> = memo(({ children, sidebar, categories }) => {
    return (
        <Grid container direction={'column'} justify={'flex-start'}>
            <Grid component={'header'}>
                <Typography variant="h4" gutterBottom>Christian-Gottfried-Ehrenberg-Gymnasium Delitzsch
                </Typography>
                <Navbar categories={categories} />
            </Grid>
            <Grid item component={'main'} style={{ marginTop: '.5em' }}>
                <Grid container spacing={8} justify={'flex-start'}>
                    <Grid item xs>
                        <main style={{ width: '100%', height: '100%' }}>
                            {children}
                        </main>
                    </Grid>
                    <Grid item xs={4} lg={3}>
                        <ConnectedUserNavigation />
                        {sidebar}
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
});

export default connect<PageLayoutStateProps, {}, PageLayoutProps, State>(
    state => ({
        categories: state.content.categories
    })
)(BaseLayout);