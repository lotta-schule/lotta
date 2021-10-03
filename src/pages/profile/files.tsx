import * as React from 'react';
import { Card, CardContent } from '@material-ui/core';
import { FileExplorer } from 'component/fileExplorer/FileExplorer';
import { GetServerSidePropsContext } from 'next';

export const Files = () => {
    return (
        <Card style={{ width: '100%' }}>
            <CardContent>
                <h4>Dateien und Medien</h4>
                <FileExplorer />
            </CardContent>
        </Card>
    );
};

export const getServerSideProps = async ({}: GetServerSidePropsContext) => {
    return {
        props: {},
    };
};

export default Files;
