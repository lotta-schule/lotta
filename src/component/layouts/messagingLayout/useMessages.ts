import { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { MessageModel } from 'model';
import { GetMessagesQuery } from 'api/query/GetMessagesQuery';
import { ReceiveMessageSubscription } from 'api/subscription/ReceiveMessageSubscription';

export const useMessages = () => {
    const { subscribeToMore, ...result } = useQuery<{
        messages: MessageModel[];
    }>(GetMessagesQuery);
    useEffect(() => {
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
                        ...prev.messages.filter((msg) => msg.id !== message.id),
                        message,
                    ],
                };
            },
        });
    }, [subscribeToMore]);
    return result;
};
