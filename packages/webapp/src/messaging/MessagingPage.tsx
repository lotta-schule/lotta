import * as React from 'react';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { useIsMobile } from '@lotta-schule/hubert';
import { useApolloClient } from '@apollo/client';
import { useRouter } from 'next/router';
import { Header, Main, Sidebar } from 'layout';
import { MessagingView } from './MessagingView';
import { ConversationModel } from 'model';

import GetConversationsQuery from 'api/query/GetConversationsQuery.graphql';

export interface MessagingPageProps {
  conversations?: ConversationModel[];
}

export const MessagingPage = React.memo<MessagingPageProps>(
  ({ conversations }) => {
    const didWriteCache = React.useRef(false);
    const apolloClient = useApolloClient();
    const currentUser = useCurrentUser();
    const router = useRouter();

    const isMobile = useIsMobile();

    if (
      typeof window !== 'undefined' &&
      conversations &&
      !didWriteCache.current
    ) {
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
