import React, { ReactNode, ReactNodeArray, memo, useRef } from 'react';
import { Grid } from '@material-ui/core';
import { CSSProperties } from '@material-ui/styles';

export interface BaseLayoutMainContentProps {
    style?: CSSProperties;
    children?: ReactNode | ReactNodeArray;
}

export const BaseLayoutMainContent = memo<BaseLayoutMainContentProps>(({ children, style }) => {
    const rootElement = useRef<HTMLDivElement>();

    return (
        <Grid item xs innerRef={rootElement}>
            <div style={{ ...style, width: '100%', height: '100%' }}>
                {children}
            </div>
        </Grid>
    );
});