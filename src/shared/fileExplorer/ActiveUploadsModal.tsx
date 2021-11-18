import * as React from 'react';
import {
    List,
    ListItem,
    ListItemAvatar,
    CircularProgress,
    ListItemText,
} from '@material-ui/core';
import { ErrorOutline } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { useUploads } from './context/UploadQueueContext';
import { Dialog, DialogContent } from 'shared/general/dialog/Dialog';
import fileExplorerContext from './context/FileExplorerContext';

export const ActiveUploadsModal = React.memo(() => {
    const { t } = useTranslation();
    const [state, dispatch] = React.useContext(fileExplorerContext);
    const uploads = useUploads();

    return (
        <Dialog
            open={state.showActiveUploads && uploads.length > 0}
            onRequestClose={() => dispatch({ type: 'hideActiveUploads' })}
            title={t('files.explorer.filesAreBeingUploaded', {
                count: uploads.length,
            })}
        >
            <DialogContent>
                <List>
                    {uploads.map((upload) => (
                        <ListItem key={upload.id} button>
                            <ListItemAvatar>
                                <>
                                    {upload.error && (
                                        <ErrorOutline color={'error'} />
                                    )}
                                    {!upload.error && (
                                        <CircularProgress
                                            variant={'determinate'}
                                            value={upload.uploadProgress}
                                        />
                                    )}
                                </>
                            </ListItemAvatar>
                            <ListItemText
                                style={{
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                }}
                                primary={upload.filename}
                                secondary={
                                    upload.error?.message ??
                                    upload.parentDirectory.name
                                }
                            />
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
        </Dialog>
    );
});
ActiveUploadsModal.displayName = 'ActiveUploadsModal';
