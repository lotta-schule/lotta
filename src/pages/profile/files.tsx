import * as React from 'react';
import { MediaPage } from 'layouts/profile/MediaPage';
import { GetServerSidePropsContext } from 'next';

const FilesRoute = () => {
    return <MediaPage />;
};

export const getServerSideProps = async ({}: GetServerSidePropsContext) => {
    return {
        props: {},
    };
};

export default FilesRoute;
