'use client';

import * as React from 'react';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { useIsMobile } from '@lotta-schule/hubert';
import { useApolloClient } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { LegacyHeader, Main, Sidebar } from 'layout';
import { isBrowser } from 'util/isBrowser';
import { ConversationModel } from 'model';
import { MessagingView } from './MessagingView';

import GetConversationsQuery from 'api/query/GetConversationsQuery.graphql';

export interface MessagingPageProps {
  conversations?: ConversationModel[];
}

export const MessagingPage = React.memo(
  ({ conversations }: MessagingPageProps) => {
    const didWriteCache = React.useRef(false);
    const apolloClient = useApolloClient();
    const currentUser = useCurrentUser();
    const router = useRouter();

    const isMobile = useIsMobile();

    if (isBrowser() && conversations && !didWriteCache.current) {
      apolloClient.writeQuery({
        query: GetConversationsQuery,
        data: {
          conversations,
        },
      });

      didWriteCache.current = true;
    }

    if (currentUser === null) {
      router.replace('/');
      return null;
    }

    return (
      <>
        <Main>
          {!isMobile && (
            <LegacyHeader bannerImageUrl={'/bannerMessaging.png'}>
              <h2 data-testid={'title'}>Nachrichten</h2>
            </LegacyHeader>
          )}
          <MessagingView />
        </Main>
        <Sidebar isEmpty />
      </>
    );
  }
);
MessagingPage.displayName = 'MessagingPage';
