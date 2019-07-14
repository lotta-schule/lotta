import React, { FunctionComponent, memo } from 'react';
import { Grid } from '@material-ui/core';

export const BaseLayoutMainContent: FunctionComponent = memo(({ children }) => (
    <Grid item xs>
        <div style={{ width: '100%', height: '100%' }}>
            {children}
        </div>
    </Grid>
));