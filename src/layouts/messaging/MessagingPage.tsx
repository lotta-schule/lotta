import * as React from 'react';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { useIsMobile } from 'util/useIsMobile';
import { useRouter } from 'next/router';
import { Header, Main, Sidebar } from 'layouts/base';
import { MessagingView } from './MessagingView';

export const MessagingPage = () => {
    const currentUser = useCurrentUser();
    const router = useRouter();

    const isMobile = useIsMobile();

    if (currentUser === null) {
        router.replace('/');
        return null;
    }

    return (
        <>
            <Main>
                {!isMobile && (
                    <Header bannerImageUrl={'/bannerMessaging.png'}>
                        <h2 data-testid={'title'}>Nachrichten</h2>
                    </Header>
                )}
                <MessagingView />
            </Main>
            <Sidebar isEmpty />
        </>
    );
};
