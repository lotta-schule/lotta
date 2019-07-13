import React, { FunctionComponent, memo } from 'react';
import { State } from 'store/State';
import { UploadModel } from 'model';
import { useSelector } from 'react-redux';
import { Dialog, DialogTitle, List, ListItem, ListItemAvatar, CircularProgress, ListItemText } from '@material-ui/core';

export interface ActiveUploadsModalProps {
    open: boolean;
    onClose(event: {}, reason: 'backdropClick' | 'escapeKeyDown'): void;
}

export const ActiveUploadsModal: FunctionComponent<ActiveUploadsModalProps> = memo(({ open, onClose }) => {
    const uploads: UploadModel[] = (useSelector<State, UploadModel[] | null>(s => s.userFiles.uploads) || []);

    if (uploads.length < 1) {
        onClose({}, 'backdropClick');
        return null;
    }

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{uploads.length} Dateien werden hochgeladen</DialogTitle>
            <List>
                {uploads.map(upload => (
                    <ListItem key={upload.id} button>
                        <ListItemAvatar>
                            <CircularProgress
                                variant={'static'}
                                value={upload.uploadProgress}
                            />
                        </ListItemAvatar>
                        <ListItemText
                            style={{
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden'
                            }}
                            primary={upload.filename}
                            secondary={upload.path}
                        />
                    </ListItem>
                ))}
            </List>
        </Dialog>
    )
});