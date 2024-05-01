import * as React from 'react';
import { Dialog, DialogContent } from '../../dialog';
import { List, ListItem, ListItemSecondaryText } from '../../list';
import { CircularProgress } from '../../progress';
import { useBrowserState } from '../BrowserStateContext';
import { Check, Close } from '../../icon';
import clsx from 'clsx';

import styles from './ActiveUploadsDialog.module.scss';

export type ActiveUploadsDialogProps = {
  isOpen: boolean;
  onRequestClose: () => void;
};

export const ActiveUploadsDialog = React.memo(
  ({ isOpen, onRequestClose }: ActiveUploadsDialogProps) => {
    const { uploadClient } = useBrowserState();

    const currentUploads = Array.from(uploadClient?.currentUploads ?? []).sort(
      (u1, u2) => {
        return u2.startTime - u1.startTime;
      }
    );

    return (
      <Dialog
        open={isOpen}
        onRequestClose={onRequestClose}
        title={`Aktive Uploads`}
        className={styles.root}
      >
        <DialogContent>
          <List label="Aktive Uploads">
            {currentUploads.map((upload, i) => (
              <ListItem
                title={upload.file.name}
                leftSection={
                  <>
                    {upload.error && (
                      <Close
                        data-testid="error-icon"
                        className={clsx(styles.icon, styles.errorIcon)}
                        aria-label={`${upload.file.name} konnte nicht hochgeladen werden`}
                      />
                    )}
                    {(upload.status === 'uploading' ||
                      upload.status === 'pending') && (
                      <CircularProgress
                        aria-label={`${upload.file.name} wird hochgeladen`}
                        value={upload.progress}
                        showValue
                      />
                    )}
                    {upload.status === 'done' && (
                      <Check
                        data-testid="success-icon"
                        className={clsx(styles.icon, styles.successIcon)}
                        aria-label={`${upload.file.name} wurde erfolgreich hochgeladen hochgeladen`}
                      />
                    )}
                  </>
                }
                key={i}
              >
                <span
                  style={{
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  }}
                >
                  {upload.file.name}
                </span>
                <ListItemSecondaryText>
                  {!!upload.error && (
                    <span className={styles.errorMessage}>
                      {upload.error.message}
                    </span>
                  )}
                  <br />
                  {upload.parentNode.name}
                  <br />
                  {upload.status === 'uploading' && (
                    <span>
                      {upload.transferSpeed.toFixed(2)} MB/s &bull;{' '}
                      {upload.progress.toFixed(2)}%
                    </span>
                  )}
                </ListItemSecondaryText>
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    );
  }
);
ActiveUploadsDialog.displayName = 'ActiveUploadsDialog';
