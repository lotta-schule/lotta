'use client';
import * as React from 'react';
import { useCurrentUser } from '#/util/user/useCurrentUser';
import { useIsMobile } from '@lotta-schule/hubert';
import { useApolloClient } from '@apollo/client/react';
import { Header, Main, Sidebar } from '#/layout';
import { isBrowser } from '#/util/isBrowser';
import { FragmentOf } from '#/api/graphql';
import { MessagingView } from './MessagingView';

import { GET_CONVERSATIONS_QUERY } from './_graphql/GetConversationsQuery';
import { CONVERSATION_FRAGMENT } from './_graphql/fragments';

export interface MessagingPageProps {
  conversations?: FragmentOf<typeof CONVERSATION_FRAGMENT>[];
}

export const MessagingPage = React.memo(
  ({ conversations }: MessagingPageProps) => {
    const didWriteCache = React.useRef(false);
    const apolloClient = useApolloClient();
    const currentUser = useCurrentUser();

    const isMobile = useIsMobile();

    if (isBrowser() && conversations && !didWriteCache.current) {
      apolloClient.writeQuery({
        query: GET_CONVERSATIONS_QUERY,
        data: {
          conversations,
        },
      });

      didWriteCache.current = true;
    }

    // Visitors who are not logged in are turned away by the route (on the
    // server). Here, the current user may simply not be loaded yet.
    if (currentUser === null) {
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
  }
);
MessagingPage.displayName = 'MessagingPage';
