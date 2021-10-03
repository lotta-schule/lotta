import * as React from 'react';
import { Grid } from '@material-ui/core';

export interface BaseLayoutMainContentProps {
    style?: React.CSSProperties;
    children?: React.ReactNode | React.ReactNodeArray;
}

export const BaseLayoutMainContent = React.memo<BaseLayoutMainContentProps>(
    ({ children, style }) => {
        return (
            <Grid item xs>
                <div style={{ ...style, width: '100%', height: '100%' }}>
                    {children}
                </div>
            </Grid>
        );
    }
);
BaseLayoutMainContent.displayName = 'BaseLayoutMainContent';
