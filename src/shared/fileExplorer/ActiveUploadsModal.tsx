import * as React from 'react';
import {
    List,
    ListItem,
    ListItemSecondaryText,
    Dialog,
    DialogContent,
    CircularProgress,
} from '@lotta-schule/hubert';
import { ErrorOutline } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { useUploads } from './context/UploadQueueContext';
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
                        <ListItem
                            leftSection={
                                <>
                                    {upload.error && (
                                        <ErrorOutline color={'error'} />
                                    )}
                                    {!upload.error && (
                                        <CircularProgress
                                            aria-label={`${upload.filename} wird hochgeladen`}
                                            value={upload.uploadProgress}
                                            showValue
                                        />
                                    )}
                                </>
                            }
                            key={upload.id}
                        >
                            <span
                                style={{
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                }}
                            >
                                {upload.filename}
                            </span>
                            <ListItemSecondaryText>
                                {upload.error?.message ??
                                    upload.parentDirectory.name}
                            </ListItemSecondaryText>
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
        </Dialog>
    );
});
ActiveUploadsModal.displayName = 'ActiveUploadsModal';
