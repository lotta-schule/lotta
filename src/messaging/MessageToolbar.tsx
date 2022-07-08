import * as React from 'react';
import { NewMessageDestination } from 'model';
import { Button, Tab, Tabbar, Popover } from '@lotta-schule/hubert';
import { Add, ArrowLeft } from '@material-ui/icons';
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

        const [newMessageType, setNewMessageType] = React.useState<
            'user' | 'group'
        >('user');

        return (
            <div className={styles.root}>
                <Popover
                    aria-label={'Empfänger wählen'}
                    className={styles.popover}
                    buttonProps={{
                        'aria-label': 'Neue Nachricht schreiben',
                        icon: <Add />,
                    }}
                >
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
                                        onRequestNewMessage({ group });
                                    }
                                }}
                            />
                        )}
                    </div>
                </Popover>
                {isMobile && onToggle && (
                    <Button
                        style={{ float: 'right' }}
                        aria-label={'Seitenleiste einklappen'}
                        onClick={onToggle}
                        icon={<ArrowLeft />}
                    />
                )}
            </div>
        );
    }
);
MessageToolbar.displayName = 'MessageToolbar';
