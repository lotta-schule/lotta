import * as React from 'react';
import { Card, CardContent } from '@material-ui/core';
import { FileExplorer } from 'component/fileExplorer/FileExplorer';
import { BaseLayoutMainContent } from 'component/layouts/BaseLayoutMainContent';
import { Header } from 'component/general/Header';
import { GetServerSidePropsContext } from 'next';

export const Files = () => {
    return (
        <BaseLayoutMainContent>
            <Header bannerImageUrl={'/bannerProfil.png'}>
                <h2>Dateien und Medien</h2>
            </Header>

            <Card style={{ width: '100%' }}>
                <CardContent>
                    <FileExplorer />
                </CardContent>
            </Card>
        </BaseLayoutMainContent>
    );
};

export const getServerSideProps = async ({}: GetServerSidePropsContext) => {
    return {
        props: {},
    };
};

export default Files;
