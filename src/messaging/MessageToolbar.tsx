import * as React from 'react';
import { ChatType, ThreadRepresentation } from 'model';
import { Box, Popover, Tab, Tabs } from '@material-ui/core';
import { Button } from 'shared/general/button/Button';
import { Add, ArrowLeft } from '@material-ui/icons';
import {
    bindTrigger,
    bindPopover,
    usePopupState,
} from 'material-ui-popup-state/hooks';
import { GroupSelect } from 'shared/edit/GroupSelect';
import { useIsMobile } from 'util/useIsMobile';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { SearchUserField } from 'administration/users/SearchUserField';

import styles from './MessageToolbar.module.scss';

export interface MessageToolbarProps {
    onCreateMessageThread(thread: ThreadRepresentation): void;
    onToggle(): void;
}

export const MessageToolbar = React.memo<MessageToolbarProps>(
    ({ onToggle, onCreateMessageThread }) => {
        const isMobile = useIsMobile();

        const currentUser = useCurrentUser();
        const popupState = usePopupState({
            variant: 'popover',
            popupId: 'create-message-thread',
        });

        const [newMessageType, setNewMessageType] = React.useState<ChatType>(
            ChatType.DirectMessage
        );

        return (
            <div className={styles.root}>
                <Button
                    aria-label={'Neue Nachricht schreiben'}
                    icon={<Add />}
                    {...bindTrigger(popupState)}
                />
                {isMobile && onToggle && (
                    <Button
                        style={{ float: 'right' }}
                        aria-label={'Seitenleiste einklappen'}
                        onClick={onToggle}
                        icon={<ArrowLeft />}
                    />
                )}
                <Popover
                    {...bindPopover(popupState)}
                    className={styles.popover}
                    aria-label={'Empfänger wählen'}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                    <Box p={3} className={styles.box}>
                        <Tabs
                            value={newMessageType}
                            onChange={(_e, value) => setNewMessageType(value)}
                        >
                            <Tab
                                value={ChatType.DirectMessage}
                                label={'Nutzer'}
                            />
                            {currentUser!.groups.length > 0 && (
                                <Tab
                                    value={ChatType.GroupChat}
                                    label={'Gruppe'}
                                />
                            )}
                        </Tabs>
                        <div className={styles.tabsPanel}>
                            {newMessageType === ChatType.DirectMessage && (
                                <SearchUserField
                                    className={styles.input}
                                    onSelectUser={(user) => {
                                        const newMessageThread = {
                                            messageType: ChatType.DirectMessage,
                                            counterpart: user,
                                            date: new Date(),
                                        };
                                        popupState.close();
                                        onCreateMessageThread(newMessageThread);
                                    }}
                                />
                            )}
                            {newMessageType === ChatType.GroupChat && (
                                <GroupSelect
                                    className={styles.input}
                                    hidePublicGroupSelection
                                    label={''}
                                    selectedGroups={[]}
                                    filterSelection={(group) =>
                                        !!currentUser!.groups.find(
                                            (g) => g.id === group.id
                                        )
                                    }
                                    onSelectGroups={([group]) => {
                                        if (group) {
                                            const newMessageThread = {
                                                messageType: ChatType.GroupChat,
                                                counterpart: group,
                                                date: new Date(),
                                            };
                                            popupState.close();
                                            onCreateMessageThread(
                                                newMessageThread
                                            );
                                        }
                                    }}
                                />
                            )}
                        </div>
                    </Box>
                </Popover>
            </div>
        );
    }
);
