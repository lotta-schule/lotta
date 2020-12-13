import React, { memo, useState } from 'react';
import { ChatType, ThreadRepresentation } from 'model';
import { Box, IconButton, makeStyles, Popover, Tab, Tabs } from '@material-ui/core';
import { Add, ArrowLeft } from '@material-ui/icons';
import { bindTrigger, bindPopover, usePopupState } from 'material-ui-popup-state/hooks';
import { SearchUserField } from '../adminLayout/userManagement/SearchUserField';
import { GroupSelect } from 'component/edit/GroupSelect';
import {useIsMobile} from 'util/useIsMobile';

export interface MessageToolbarProps {
    onCreateMessageThread(thread: ThreadRepresentation): void;
    onToggle(): void;
}

const useStyles = makeStyles(theme => ({
    root: {
        position: 'sticky',
        top: 0,
        zIndex: 1,
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.background.default}`,
        padding: theme.spacing(1),
        '& [role=combobox]': {
            width: '100%'
        },
    },
    popover: {
        minHeight: '50vh'
    },
    tabsPanel: {
        marginTop: theme.spacing(1)
    },
}));

export const MessageToolbar = memo<MessageToolbarProps>(({ onToggle, onCreateMessageThread }) => {
    const styles = useStyles();
    const isMobile = useIsMobile();

    const popupState = usePopupState({ variant: 'popover', popupId: 'create-message-thread' })

    const [newMessageType, setNewMessageType] = useState<ChatType>(ChatType.DirectMessage);

    return (
        <div className={styles.root}>
            <IconButton aria-label={'Neue Nachricht schreiben'} {...bindTrigger(popupState)}>
                <Add />
            </IconButton>
            {isMobile && onToggle && (
                <IconButton style={{ float: 'right' }} aria-label={'Seitenleiste einklappen'} onClick={onToggle}>
                    <ArrowLeft />
                </IconButton>
            )}
            <Popover
                {...bindPopover(popupState)}
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
                <Box py={3} px={12} className={styles.popover}>
                    <Tabs value={newMessageType} onChange={(_e, value) => setNewMessageType(value)}>
                        <Tab value={ChatType.DirectMessage} label={'Nutzer'} />
                        <Tab value={ChatType.GroupChat} label={'Gruppe'} />
                    </Tabs>
                    <div className={styles.tabsPanel}>
                        {newMessageType === ChatType.DirectMessage && (
                            <SearchUserField
                                onSelectUser={user => {
                                    const newMessageThread = { messageType: ChatType.DirectMessage, counterpart: user, date: new Date() };
                                    popupState.close();
                                    onCreateMessageThread(newMessageThread);
                                }}
                            />
                        )}
                        {newMessageType === ChatType.GroupChat && (
                            <GroupSelect
                                hidePublicGroupSelection
                                label={''}
                                selectedGroups={[]}
                                onSelectGroups={([group]) => {
                                    if (group) {
                                        const newMessageThread = { messageType: ChatType.GroupChat, counterpart: group, date: new Date() };
                                        popupState.close();
                                        onCreateMessageThread(newMessageThread);
                                    }
                                }}
                            />
                        )}
                    </div>
                </Box>
            </Popover>
        </div>
    );
});
