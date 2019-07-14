import React, { FunctionComponent, memo } from 'react';
import { Grid } from '@material-ui/core';
import { CSSProperties } from '@material-ui/styles';

export interface BaseLayoutMainContentProps {
    style?: CSSProperties;
}

export const BaseLayoutMainContent: FunctionComponent<BaseLayoutMainContentProps> = memo(({ children, style }) => (
    <Grid item xs>
        <div style={{ ...style, width: '100%', height: '100%' }}>
            {children}
        </div>
    </Grid>
));