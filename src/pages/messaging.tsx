import * as React from 'react';
import { GetServerSidePropsContext } from 'next';
import { BaseLayoutMainContent } from 'component/layouts/BaseLayoutMainContent';
import { BaseLayoutSidebar } from 'component/layouts/BaseLayoutSidebar';
import { Header } from 'component/general/Header';
import { MessagingView } from 'component/layouts/messagingLayout/MessagingView';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { useIsMobile } from 'util/useIsMobile';
import { useRouter } from 'next/router';

export const Messaging = () => {
    const currentUser = useCurrentUser();
    const router = useRouter();

    const isMobile = useIsMobile();

    if (currentUser === null) {
        router.replace('/');
        return null;
    }

    return (
        <>
            <BaseLayoutMainContent>
                {!isMobile && (
                    <Header bannerImageUrl={'/bannerMessaging.png'}>
                        <h2 data-testid={'title'}>Nachrichten</h2>
                    </Header>
                )}
                <MessagingView />
            </BaseLayoutMainContent>
            <BaseLayoutSidebar isEmpty />
        </>
    );
};

export const getServerSideProps = async ({}: GetServerSidePropsContext) => {
    return {
        props: {},
    };
};

export default Messaging;
