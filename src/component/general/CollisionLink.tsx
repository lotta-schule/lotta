import React, { forwardRef } from 'react';
import { Link as RouterLink, LinkProps } from 'react-router-dom';

export const CollisionLink =
    forwardRef<HTMLAnchorElement, LinkProps>(
        (props, ref) => <RouterLink innerRef={ref as any} {...props} />,
    );