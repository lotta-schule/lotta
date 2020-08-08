import React, { CSSProperties, ReactNode, ReactNodeArray, memo } from 'react';
import { Grid } from '@material-ui/core';

export interface BaseLayoutMainContentProps {
    style?: CSSProperties;
    children?: ReactNode | ReactNodeArray;
}

export const BaseLayoutMainContent = memo<BaseLayoutMainContentProps>(({ children, style }) => {
    return (
        <Grid item xs>
            <div style={{ ...style, width: '100%', height: '100%' }}>
                {children}
            </div>
        </Grid>
    );
});
