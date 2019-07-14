import React, { FunctionComponent, memo } from 'react';
import { CircularProgress } from '@material-ui/core';
import { BaseLayoutMainContent } from './BaseLayoutMainContent';
import { BaseLayoutSidebar } from './BaseLayoutSidebar';

export const EmptyLoadingLayout: FunctionComponent = memo(() => {
    return (
        <>
            <BaseLayoutMainContent style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress />
            </BaseLayoutMainContent>
            <BaseLayoutSidebar />
        </>
    );
});