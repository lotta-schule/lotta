import * as React from 'react';
import { Card, CardContent } from '@material-ui/core';
import { FileExplorer } from 'shared/fileExplorer/FileExplorer';
import { Header, Main } from 'layout';

export const MediaPage = () => {
    return (
        <Main>
            <Header bannerImageUrl={'/bannerProfil.png'}>
                <h2>Dateien und Medien</h2>
            </Header>

            <Card style={{ width: '100%' }}>
                <CardContent>
                    <FileExplorer />
                </CardContent>
            </Card>
        </Main>
    );
};
