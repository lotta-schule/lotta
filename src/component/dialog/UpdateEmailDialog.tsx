import * as React from 'react';
import {
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    TextField,
} from '@material-ui/core';
import { UpdateEmailMutation } from 'api/mutation/UpdateEmailMutation';
import { useMutation } from '@apollo/client';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { ResponsiveFullScreenDialog } from './ResponsiveFullScreenDialog';
import { RequestHisecTokenDialog } from './RequestHisecTokenDialog';
import { Button } from 'component/general/button/Button';

export interface UpdateEmailDialogProps {
    isOpen: boolean;
    onRequestClose(): void;
}

export const UpdateEmailDialog = React.memo<UpdateEmailDialogProps>(
    ({ isOpen, onRequestClose }) => {
        const [
            showRequestHisecToken,
            setShowRequestHisecToken,
        ] = React.useState(false);
        const [newEmail, setNewEmail] = React.useState('');
        const resetForm = () => {
            setNewEmail('');
        };
        const [updateEmail, { loading: isLoading, error }] = useMutation<
            { updateEmail: boolean },
            { newEmail: string }
        >(UpdateEmailMutation, {
            variables: { newEmail },
            onCompleted: () => {
                resetForm();
                onRequestClose();
            },
        });

        return (
            <>
                <ResponsiveFullScreenDialog open={isOpen} fullWidth>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            setShowRequestHisecToken(true);
                        }}
                        data-testid="UpdateEmailDialog"
                    >
                        <DialogTitle>Email ändern</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Wähle eine neue Email-Adresse.
                            </DialogContentText>
                            <ErrorMessage error={error} />
                            <TextField
                                margin="dense"
                                id="new-email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                disabled={isLoading}
                                label={'Neue Email:'}
                                placeholder={'Neue Email'}
                                type="email"
                                autoComplete={'new-email'}
                                autoFocus
                                fullWidth
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button
                                onClick={() => {
                                    resetForm();
                                    onRequestClose();
                                }}
                            >
                                Abbrechen
                            </Button>
                            <Button
                                type={'submit'}
                                disabled={!newEmail || isLoading}
                            >
                                Email ändern
                            </Button>
                        </DialogActions>
                    </form>
                </ResponsiveFullScreenDialog>
                <RequestHisecTokenDialog
                    isOpen={showRequestHisecToken}
                    onRequestClose={(authToken) => {
                        setShowRequestHisecToken(false);
                        if (authToken) {
                            updateEmail({
                                context: { authToken },
                            });
                        }
                    }}
                />
            </>
        );
    }
);
