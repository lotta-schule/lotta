import { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { MessageModel } from 'model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import ReceiveMessageSubscription from 'api/subscription/ReceiveMessageSubscription.graphql';
import GetMessagesQuery from 'api/query/GetMessagesQuery.graphql';

export const useMessages = () => {
    const currentUser = useCurrentUser();
    const skip = !!!currentUser;
    const { subscribeToMore, ...result } = useQuery<{
        messages: MessageModel[];
    }>(GetMessagesQuery, { skip });
    useEffect(() => {
        if (!skip) {
            return subscribeToMore({
                document: ReceiveMessageSubscription,
                updateQuery: (prev, { subscriptionData }) => {
                    if (!subscriptionData.data) {
                        return prev;
                    }
                    const message: MessageModel = (subscriptionData.data as any)
                        .message;
                    return {
                        ...prev,
                        messages: [
                            ...prev.messages.filter(
                                (msg) => msg.id !== message.id
                            ),
                            message,
                        ],
                    };
                },
            });
        }
    }, [skip, subscribeToMore]);
    return result;
};
