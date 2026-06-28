import * as React from 'react';
import { useApolloClient, useQuery } from '@apollo/client/react';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import {
  ErrorMessage,
  LinearProgress,
  SplitViewButton,
  Toolbar,
} from '@lotta-schule/hubert';
import { FragmentOf } from '#/api/graphql';
import { Icon } from '#/shared/Icon';
import { useCurrentUser } from '#/util/user/useCurrentUser';
import { MessageBubble } from './MessageBubble';

import { GET_CONVERSATION_QUERY } from './_graphql/GetConversationQuery';
import { GET_OLDER_MESSAGES_QUERY } from './_graphql/GetOlderMessagesQuery';
import {
  CONVERSATION_FRAGMENT,
  LIVE_MESSAGES_FILTER,
  MESSAGE_FRAGMENT,
} from './_graphql/fragments';

import styles from './MessagesThread.module.scss';

const OLDER_MESSAGES_PAGE_SIZE = 25;

const uniqById = <T extends { id: string }>(messages: T[]): T[] => {
  const map = new Map<string, T>();
  for (const message of messages) {
    if (!map.has(message.id)) {
      map.set(message.id, message);
    }
  }
  return [...map.values()];
};

export interface MessagesThreadProps {
  conversation: FragmentOf<typeof CONVERSATION_FRAGMENT>;
}

type MessageFragment = FragmentOf<typeof MESSAGE_FRAGMENT>;

export const MessagesThread = React.memo(
  ({ conversation }: MessagesThreadProps) => {
    const currentUser = useCurrentUser()!;
    const apolloClient = useApolloClient();
    const { data, error, loading } = useQuery(GET_CONVERSATION_QUERY, {
      variables: { id: conversation.id!, filter: LIVE_MESSAGES_FILTER },
      fetchPolicy: 'cache-and-network',
    });

    // Apollo v4 removed `onCompleted` from `useQuery`; mark the conversation read as a
    // side-effect of the data arriving instead.
    const loadedConversation = data?.conversation;
    React.useEffect(() => {
      if (!loadedConversation) {
        return;
      }
      const { cache } = apolloClient;
      let readCount = 0;
      cache.modify({
        id: cache.identify(loadedConversation as any),
        fields: {
          unreadMessages: (ref: any) => {
            readCount = ref ?? 0;
            return 0;
          },
        },
      });
      cache.modify({
        id: cache.identify(currentUser as any),
        fields: {
          unreadMessages: (ref: any) => ref - readCount,
        },
      });
    }, [loadedConversation, apolloClient, currentUser]);

    const liveMessages: MessageFragment[] = React.useMemo(
      () => data?.conversation?.messages ?? [],
      [data?.conversation?.messages]
    );

    // Older pages are intentionally *not* routed through Apollo's normalized cache: they're
    // immutable history that no mutation or subscription will ever target, so keeping them in
    // local state avoids fighting the live-window cache writes `ComposeMessage` and
    // `Authentication`'s subscription handler do on `GetConversationQuery`'s `messages` field.
    const [olderMessages, setOlderMessages] = React.useState<MessageFragment[]>(
      []
    );
    const [isLoadingOlder, setIsLoadingOlder] = React.useState(false);
    const [hasMoreOlder, setHasMoreOlder] = React.useState(true);

    const allMessagesNewestFirst = React.useMemo(
      () =>
        uniqById([...liveMessages, ...olderMessages]).sort(
          (a, b) => Number(b.id) - Number(a.id)
        ),
      [liveMessages, olderMessages]
    );
    const messages = React.useMemo(
      () => [...allMessagesNewestFirst].reverse(),
      [allMessagesNewestFirst]
    );

    const wrapperRef = React.useRef<HTMLDivElement>(null);
    const sentinelRef = React.useRef<HTMLDivElement>(null);
    const scrollHeightBeforeOlderLoadRef = React.useRef<number | null>(null);

    const loadOlderMessages = React.useCallback(async () => {
      const oldestId = allMessagesNewestFirst.at(-1)?.id;
      if (!oldestId) {
        return;
      }
      setIsLoadingOlder(true);
      try {
        const { data: olderData } = await apolloClient.query({
          query: GET_OLDER_MESSAGES_QUERY,
          variables: {
            id: conversation.id!,
            filter: { first: OLDER_MESSAGES_PAGE_SIZE, before: oldestId },
          },
          fetchPolicy: 'network-only',
        });
        const fetched = olderData?.conversation?.messages ?? [];
        setHasMoreOlder(fetched.length === OLDER_MESSAGES_PAGE_SIZE);
        if (fetched.length) {
          setOlderMessages((current) => uniqById([...current, ...fetched]));
        }
      } finally {
        setIsLoadingOlder(false);
      }
    }, [allMessagesNewestFirst, apolloClient, conversation.id]);

    // --- Three distinct scroll cases. A single `[messages]`-keyed effect would yank the
    // viewport to the bottom every time an older page is prepended, so they're kept separate. ---

    // Case 1: initial mount -> jump to bottom, no animation.
    React.useLayoutEffect(() => {
      if (wrapperRef.current) {
        wrapperRef.current.scroll({
          behavior: 'auto',
          top:
            wrapperRef.current.scrollHeight - wrapperRef.current.clientHeight,
        });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Case 2: a new message arrives at the tail (own send or subscription) -> scroll to bottom.
    const previousLiveCountRef = React.useRef(liveMessages.length);
    React.useEffect(() => {
      const grew = liveMessages.length > previousLiveCountRef.current;
      previousLiveCountRef.current = liveMessages.length;
      if (!grew) {
        return;
      }
      let n: number | null = null;
      if (wrapperRef.current) {
        n = requestAnimationFrame(() => {
          if (
            wrapperRef.current &&
            wrapperRef.current.clientHeight < wrapperRef.current.scrollHeight
          ) {
            wrapperRef.current.scroll?.({
              behavior: 'smooth',
              top:
                wrapperRef.current.scrollHeight -
                wrapperRef.current.clientHeight,
            });
          }
        });
      }
      return () => {
        if (n) {
          cancelAnimationFrame(n);
        }
      };
    }, [liveMessages.length]);

    // Case 3: an older page was prepended -> preserve scroll position, no jump.
    const previousOlderCountRef = React.useRef(olderMessages.length);
    React.useLayoutEffect(() => {
      const grew = olderMessages.length > previousOlderCountRef.current;
      previousOlderCountRef.current = olderMessages.length;
      if (
        grew &&
        wrapperRef.current &&
        scrollHeightBeforeOlderLoadRef.current !== null
      ) {
        const delta =
          wrapperRef.current.scrollHeight -
          scrollHeightBeforeOlderLoadRef.current;
        wrapperRef.current.scrollTop += delta;
      }
      scrollHeightBeforeOlderLoadRef.current = null;
    }, [olderMessages.length]);

    React.useEffect(() => {
      const sentinel = sentinelRef.current;
      const wrapper = wrapperRef.current;
      if (!sentinel || !wrapper) {
        return;
      }
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && hasMoreOlder && !isLoadingOlder) {
            scrollHeightBeforeOlderLoadRef.current = wrapper.scrollHeight;
            void loadOlderMessages();
          }
        },
        { root: wrapper, threshold: 0 }
      );
      observer.observe(sentinel);
      return () => observer.disconnect();
    }, [loadOlderMessages, hasMoreOlder, isLoadingOlder]);

    return (
      <div
        ref={wrapperRef}
        className={styles.root}
        data-testid={'MessagesThread'}
      >
        <Toolbar hasScrollableParent>
          <SplitViewButton
            action={'open'}
            style={{ width: 40 }}
            icon={<Icon icon={faAngleLeft} />}
          />
        </Toolbar>
        <ErrorMessage error={error} />
        <div ref={sentinelRef} data-testid={'older-messages-sentinel'} />
        {isLoadingOlder && (
          <LinearProgress
            isIndeterminate
            aria-label={'Ältere Nachrichten werden geladen'}
          />
        )}
        {!loading && messages.length === 0 && (
          <div className={styles.noMessagesWrapper}>
            In dieser Unterhaltung wurden noch keine Nachrichten geschrieben.
          </div>
        )}
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            active={currentUser!.id === message.user?.id}
          />
        ))}
      </div>
    );
  }
);
MessagesThread.displayName = 'MessagesThread';
