import React, { memo, useEffect } from 'react';
import { Typography } from '@material-ui/core';
import { BaseLayoutMainContent } from '../BaseLayoutMainContent';
import { BaseLayoutSidebar } from '../BaseLayoutSidebar';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { Header } from '../../general/Header';
import { MessagingView } from './MessagingView';
import { useIsMobile } from 'util/useIsMobile';
import useRouter from 'use-react-router';
import bannerProfil from '../profileLayout/bannerProfil.png';

export const MessagingLayout = memo(() => {
    const currentUser = useCurrentUser();
    const { history } = useRouter();

    const isMobile = useIsMobile();

    useEffect(() => {
        if (currentUser === null) {
            history.replace('/');
        }
    }, [currentUser, history]);

    if (!currentUser) {
        return <div />;
    }

    return (
        <>
            <BaseLayoutMainContent>
                {!isMobile && (
                    <Header bannerImageUrl={bannerProfil}>
                        <Typography variant={'h2'} data-testid={'title'}>Nachrichten</Typography>
                    </Header>
                )}
                <MessagingView />
            </BaseLayoutMainContent>
            <BaseLayoutSidebar isEmpty />
        </>
    );
});
export default MessagingLayout;
