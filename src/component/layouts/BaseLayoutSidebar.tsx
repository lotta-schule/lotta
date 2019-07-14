import React, { FunctionComponent, memo } from 'react';
import { Grid } from '@material-ui/core';
import { UserNavigation } from './navigation/UserNavigation';

export const BaseLayoutSidebar: FunctionComponent = memo(({ children }) => (
    <Grid item component={'aside'} xs={12} md={3} xl={3} style={{ marginLeft: '0.5em' }}>
        <UserNavigation />
        {children}
    </Grid>
));