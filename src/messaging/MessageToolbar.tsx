import * as React from 'react';
import { NewMessageDestination } from 'model';
import { Box, Popover } from '@material-ui/core';
import { Tab } from 'shared/general/tabs/Tab';
import { Tabbar } from 'shared/general/tabs/Tabbar';
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
    onRequestNewMessage(subject: NewMessageDestination): void;
    onToggle: null | (() => void);
}

export const MessageToolbar = React.memo<MessageToolbarProps>(
    ({ onToggle, onRequestNewMessage }) => {
        const isMobile = useIsMobile();

        const currentUser = useCurrentUser();
        const popupState = usePopupState({
            variant: 'popover',
            popupId: 'create-message-thread',
        });

        const [newMessageType, setNewMessageType] = React.useState<
            'user' | 'group'
        >('user');

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
                        <Tabbar
                            value={newMessageType}
                            onChange={(value) => {
                                setNewMessageType(value as 'group' | 'user');
                            }}
                        >
                            <Tab value={'user'} label={'Nutzer'} />
                            {currentUser!.groups.length > 0 && (
                                <Tab
                                    key={'group'}
                                    value={'group'}
                                    label={'Gruppe'}
                                />
                            )}
                        </Tabbar>
                        <div className={styles.tabsPanel}>
                            {newMessageType === 'user' && (
                                <SearchUserField
                                    className={styles.input}
                                    onSelectUser={(user) => {
                                        popupState.close();
                                        onRequestNewMessage({ user });
                                    }}
                                />
                            )}
                            {newMessageType === 'group' && (
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
                                            popupState.close();
                                            onRequestNewMessage({ group });
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
MessageToolbar.displayName = 'MessageToolbar';
