import React, { FunctionComponent, memo } from 'react';
import { Grid } from '@material-ui/core';
import { Navbar } from './navigation/Navbar';
import { ConnectedUserNavigation } from './navigation/ConnectedUserNavigation';
import { connect } from 'react-redux';
import { CategoryModel } from '../../model';
import { State } from '../../store/State';

export interface PageLayoutStateProps {
    categories?: CategoryModel[];
}

export interface PageLayoutProps extends PageLayoutStateProps {
    sidebar?: JSX.Element;
}

const PageLayout: FunctionComponent<PageLayoutProps> = memo(({ children, sidebar, categories }) => {
    return (
        <Grid container direction={'column'} justify={'flex-start'}>
            <Grid item component={'header'}>
                <div>
                    <img src={'https://via.placeholder.com/939x100'} alt={'Banner'} />
                </div>
                <Navbar categories={categories} />
            </Grid>
            <Grid item component={'main'} style={{ marginTop: '.5em' }}>
                <Grid container spacing={16} justify={'flex-start'}>
                    <Grid item xs>
                        <main style={{ width: '100%', height: '100%' }}>
                            {children}
                        </main>
                    </Grid>
                    <Grid item xs={3} lg={2}>
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
)(PageLayout);