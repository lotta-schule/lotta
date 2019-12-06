import React, { ReactNode, ReactNodeArray, memo, useLayoutEffect, useRef, useState } from 'react';
import { Grid } from '@material-ui/core';
import { CSSProperties } from '@material-ui/styles';

export interface BaseLayoutMainContentProps {
    style?: CSSProperties;
    children?: ReactNode | ReactNodeArray;
}

export const BaseLayoutMainContent = memo<BaseLayoutMainContentProps>(({ children, style }) => {
    const [isFullWidth, setIsFullWidth] = useState(false);
    const rootElement = useRef<HTMLDivElement>();

    useLayoutEffect(() => {
        if (rootElement.current) {
            setIsFullWidth(!(rootElement.current.nextSibling?.nodeType === 1));
        }
    }, []);

    return (
        <Grid item xs={12} md={isFullWidth ? 12 : 9} xl={isFullWidth ? 12 : 9} innerRef={rootElement}>
            <div style={{ ...style, width: '100%', height: '100%' }}>
                {children}
            </div>
        </Grid>
    );
});