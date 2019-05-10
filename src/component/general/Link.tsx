import React, { FunctionComponent, memo } from 'react';
import { Link as MuiLink } from '@material-ui/core';
import { LinkProps as MuiLinkProps } from '@material-ui/core/Link';
import { Link as RouterLink } from 'react-router-dom';

export interface LinkProps {
    to: string;
}

export const Link: FunctionComponent<LinkProps & MuiLinkProps> = memo(({ children, to, ...props }) => (
    <MuiLink href={to} {...props} component={({ href, children: innerChildren, ...innerProps }) => (
        <RouterLink to={href!} {...innerProps}>
            {innerChildren}
        </RouterLink>
    )}>
        {children}
    </MuiLink>
));