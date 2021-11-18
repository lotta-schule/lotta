import * as React from 'react';
import { Grid } from '@material-ui/core';

export interface MainProps {
    className?: string;
    style?: React.CSSProperties;
}

export const Main: React.FC<MainProps> = ({ className, children, style }) => {
    return (
        <Grid item xs className={className}>
            <div style={{ ...style, width: '100%', height: '100%' }}>
                {children}
            </div>
        </Grid>
    );
};
Main.displayName = 'BaseLayoutMainContent';
