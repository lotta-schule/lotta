import React, { memo, useContext } from 'react';
import { Dialog, DialogTitle, List, ListItem, ListItemAvatar, CircularProgress, ListItemText } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { State } from 'store/State';
import { UploadModel } from 'model';
import { ErrorOutline } from '@material-ui/icons';
import fileExplorerContext from './context/FileExplorerContext';

export const ActiveUploadsModal = memo(() => {
    const uploads = (useSelector<State, UploadModel[]>(s => s.userFiles.uploads) || []);
    const [state, dispatch] = useContext(fileExplorerContext);

    return (
        <Dialog open={state.showActiveUploads && uploads.length > 0} onClose={() => dispatch({ type: 'hideActiveUploads' })}>
            <DialogTitle>{uploads.length} Dateien werden hochgeladen</DialogTitle>
            <List>
                {uploads.map(upload => (
                    <ListItem key={upload.id} button>
                        <ListItemAvatar>
                            <>
                                {upload.error && (

                                    <ErrorOutline color={'error'} />
                                )}
                                {!upload.error && (
                                    <CircularProgress
                                        variant={'static'}
                                        value={upload.uploadProgress}
                                    />
                                )}
                            </>
                        </ListItemAvatar>
                        <ListItemText
                            style={{
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden'
                            }}
                            primary={upload.filename}
                            secondary={upload.error?.message ?? upload.parentDirectory.name}
                        />
                    </ListItem>
                ))}
            </List>
        </Dialog>
    )
});