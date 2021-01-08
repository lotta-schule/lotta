import { useMemo } from 'react';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { useMessages } from '../messagingLayout/useMessages';

export const useNewMessagesBadgeNumber = () => {
    const { data: messagesData } = useMessages();
    const currentUser = useCurrentUser();
    return useMemo(() => {
        if (!currentUser) {
            return 0;
        }
        return messagesData?.messages
            .filter(msg => msg.senderUser.id !== currentUser.id && new Date(msg.insertedAt) >= new Date(currentUser.lastSeen))
            .length || 0;
    }, [messagesData, currentUser]);
};
