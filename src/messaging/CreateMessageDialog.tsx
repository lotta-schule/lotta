import * as React from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    Tabbar,
    Tab,
} from '@lotta-schule/hubert';
import { faAdd } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import { NewMessageDestination } from 'model';
import { SearchUserField } from 'administration/users/SearchUserField';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { Icon } from 'shared/Icon';
import { GroupSelect } from 'shared/edit/GroupSelect';
import { UserAvatar } from 'shared/userAvatar/UserAvatar';

import styles from './CreateMessageDialog.module.scss';

export interface CreateMessageDialogProps {
    isOpen: boolean;
    onConfirm(subject: NewMessageDestination): void;
    onAbort(): void;
}

export const CreateMessageDialog = React.memo<CreateMessageDialogProps>(
    ({ isOpen, onConfirm, onAbort }) => {
        const currentUser = useCurrentUser();
        const [newMessageType, setNewMessageType] = React.useState<
            'user' | 'group'
        >('user');

        const [messageDestination, setMessageDestination] =
            React.useState<NewMessageDestination | null>(null);

        React.useEffect(() => {
            setMessageDestination(null);
        }, [isOpen]);

        return (
            <Dialog
                open={isOpen}
                onRequestClose={onAbort}
                title={'Empfänger wählen'}
                className={styles.root}
            >
                <DialogContent>
                    {!messageDestination && (
                        <motion.div
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -50 }}
                        >
                            <Tabbar
                                value={newMessageType}
                                onChange={(value) => {
                                    setNewMessageType(
                                        value as 'group' | 'user'
                                    );
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
                                            setMessageDestination({ user });
                                        }}
                                    />
                                )}
                                {newMessageType === 'group' && (
                                    <GroupSelect
                                        className={styles.input}
                                        hidePublicGroupSelection
                                        label={'Gruppe wählen'}
                                        selectedGroups={[]}
                                        filterSelection={(group) =>
                                            !!currentUser!.groups.find(
                                                (g) => g.id === group.id
                                            )
                                        }
                                        onSelectGroups={([group]) => {
                                            if (group) {
                                                setMessageDestination({
                                                    group,
                                                });
                                            }
                                        }}
                                    />
                                )}
                            </div>
                        </motion.div>
                    )}
                    {messageDestination && (
                        <motion.div
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -50 }}
                            data-testid={'message-destination'}
                        >
                            Neue Nachricht an{' '}
                            {messageDestination.user ? (
                                <em>
                                    <UserAvatar
                                        user={messageDestination.user}
                                        size={20}
                                    />
                                    &nbsp;
                                    {messageDestination.user.name}
                                </em>
                            ) : (
                                <>
                                    Gruppe{' '}
                                    <em>{messageDestination.group.name}</em>
                                </>
                            )}{' '}
                            verfassen.
                        </motion.div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            if (messageDestination) {
                                setMessageDestination(null);
                            } else {
                                onAbort();
                            }
                        }}
                    >
                        Abbrechen
                    </Button>
                    <Button
                        icon={<Icon icon={faAdd} size={'lg'} />}
                        disabled={!messageDestination}
                        onClick={() => {
                            onConfirm(messageDestination!);
                        }}
                    >
                        Nachricht verfassen
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
);
CreateMessageDialog.displayName = 'CreateMessageDialog';
