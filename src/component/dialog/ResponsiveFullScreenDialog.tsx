import React, { memo } from 'react';
import { useIsMobile } from 'util/useIsMobile';
import { Dialog } from '@material-ui/core';
import { DialogProps } from '@material-ui/core/Dialog';

export const ResponsiveFullScreenDialog = memo<Omit<DialogProps, 'fullscreen'>>(
    ({ ...dialogProps }) => {
        const isMobile = useIsMobile();

        return <Dialog fullScreen={isMobile} {...dialogProps} />;
    }
);
