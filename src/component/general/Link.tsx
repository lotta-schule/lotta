import React, { FunctionComponent, memo } from 'react';
import { Link as MuiLink } from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';

export interface LinkProps {
    to: string;
}

export const Link: FunctionComponent<LinkProps> = memo(({ children, to }) => (
    <MuiLink href={to} component={({ href, children: innerChildren, ...props }) => (
        <RouterLink to={href!} {...props}>
            {innerChildren}
        </RouterLink>
    )}>
        {children}
    </MuiLink>
));