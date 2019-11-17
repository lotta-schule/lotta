import React, { memo } from 'react';
import { Card, CardContent, Typography } from '@material-ui/core';
import { FileExplorer } from 'component/fileExplorer/FileExplorer';

export const ProfileMediaFiles = memo(() => {

    return (
        <Card>
            <CardContent>
                <Typography variant={'h4'}>Meine Medien</Typography>
                <FileExplorer />
            </CardContent>
        </Card>
    );
});