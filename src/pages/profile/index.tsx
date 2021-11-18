import * as React from 'react';
import { ProfilePage } from 'layouts/profile/ProfilePage';
import { GetServerSidePropsContext } from 'next';

const ProfileRoute = () => {
    return <ProfilePage />;
};

export const getServerSideProps = async ({}: GetServerSidePropsContext) => {
    return {
        props: {},
    };
};

export default ProfileRoute;
