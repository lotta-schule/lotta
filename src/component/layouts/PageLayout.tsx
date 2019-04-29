import React, { FunctionComponent, memo } from 'react';
import { Grid } from '@material-ui/core';
import { Navbar } from './navigation/Navbar';
import { UserNavigation } from './navigation/UserNavigation';


export interface PageLayoutProps {
    sidebar?: JSX.Element;
}

export const PageLayout: FunctionComponent<PageLayoutProps> = memo(({ children, sidebar }) => {
    return (
        <Grid container direction={'column'} justify={'flex-start'}>
            <Grid item component={'header'}>
                <div>
                    <img src={'https://via.placeholder.com/939x100'} alt={'Banner'} />
                </div>
                <Navbar />
            </Grid>
            <Grid item component={'main'} style={{ marginTop: '.5em' }}>
                <Grid container spacing={16} justify={'flex-start'}>
                    <Grid item xs>
                        <main style={{ width: '100%', height: '100%' }}>
                            {children}
                        </main>
                    </Grid>
                    <Grid item xs={3} lg={2}>
                        <UserNavigation />
                        {sidebar}
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
});