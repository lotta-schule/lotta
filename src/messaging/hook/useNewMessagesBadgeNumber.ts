import { UserGroupModel, UserModel } from 'model';
import { useMemo } from 'react';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { useMessages } from './useMessages';

export const useNewMessagesBadgeNumber = (options?: {
    user?: UserModel;
    group?: UserGroupModel;
}) => {
    const { data: messagesData } = useMessages();
    const currentUser = useCurrentUser();
    return useMemo(() => {
        if (!currentUser) {
            return 0;
        }
        return (
            messagesData?.messages
                .filter(
                    (msg) =>
                        msg.senderUser.id !== currentUser.id &&
                        new Date(msg.insertedAt) >=
                            new Date(currentUser.lastSeen)
                )
                .filter((msg) => {
                    if (options?.user) {
                        return msg.senderUser?.id === options.user.id;
                    }
                    if (options?.group) {
                        return msg.recipientGroup?.id === options.group.id;
                    }
                    return true;
                }).length || 0
        );
    }, [messagesData, currentUser, options]);
};
