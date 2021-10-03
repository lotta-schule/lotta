import * as React from 'react';
import { Dialog } from '@material-ui/core';
import { DialogProps } from '@material-ui/core/Dialog';
import { useIsMobile } from 'util/useIsMobile';

export const ResponsiveFullScreenDialog = React.memo<
    Omit<DialogProps, 'fullscreen'>
>(({ ...dialogProps }) => {
    const isMobile = useIsMobile();

    return <Dialog fullScreen={isMobile} {...dialogProps} />;
});
ResponsiveFullScreenDialog.displayName = 'ResponsiveFullScreenDialog';
