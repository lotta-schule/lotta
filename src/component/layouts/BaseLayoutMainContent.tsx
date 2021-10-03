import * as React from 'react';
import { Grid } from '@material-ui/core';

export interface BaseLayoutMainContentProps {
    className?: string;
    style?: React.CSSProperties;
}

export const BaseLayoutMainContent: React.FC<BaseLayoutMainContentProps> = ({
    className,
    children,
    style,
}) => {
    return (
        <Grid item xs className={className}>
            <div style={{ ...style, width: '100%', height: '100%' }}>
                {children}
            </div>
        </Grid>
    );
};
BaseLayoutMainContent.displayName = 'BaseLayoutMainContent';
