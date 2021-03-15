import * as React from 'react';
import {
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    TextField,
} from '@material-ui/core';
import { UpdatePasswordMutation } from 'api/mutation/UpdatePasswordMutation';
import { useMutation } from '@apollo/client';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { ResponsiveFullScreenDialog } from './ResponsiveFullScreenDialog';
import { RequestHisecTokenDialog } from './RequestHisecTokenDialog';

export interface UpdatePasswordDialogProps {
    isOpen: boolean;
    isFirstPasswordChange?: boolean;
    withCurrentPassword?: string;
    onRequestClose(): void;
}

export const UpdatePasswordDialog = React.memo<UpdatePasswordDialogProps>(
    ({
        isOpen,
        onRequestClose,
        isFirstPasswordChange,
        withCurrentPassword,
    }) => {
        const [
            showRequestHisecToken,
            setShowRequestHisecToken,
        ] = React.useState(false);
        const [newPassword, setNewPassword] = React.useState('');
        const [
            newPasswordRepetition,
            setNewPasswordRepetition,
        ] = React.useState('');
        const resetForm = () => {
            setNewPassword('');
            setNewPasswordRepetition('');
        };
        const [updatePassword, { loading: isLoading, error }] = useMutation<
            { updatePassword: boolean },
            { newPassword: string }
        >(UpdatePasswordMutation, {
            variables: { newPassword },
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
                        data-testid="UpdatePasswordDialog"
                    >
                        <DialogTitle>Passwort ändern</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                {!isFirstPasswordChange && (
                                    <>
                                        Wähle ein neues Passwort und bestätige
                                        es.
                                    </>
                                )}
                                {isFirstPasswordChange && (
                                    <>
                                        Du meldest dich zum ersten Mal. Wähle
                                        ein sicheres Passwort dass du in Zukunft
                                        nutzen kannst.
                                    </>
                                )}
                            </DialogContentText>
                            <ErrorMessage error={error} />
                            <TextField
                                margin="dense"
                                id="new-password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                disabled={isLoading}
                                label={'Neues Passwort:'}
                                placeholder={'Neues Passwort'}
                                type="password"
                                autoComplete={'new-password'}
                                autoFocus
                                fullWidth
                            />
                            <TextField
                                margin="dense"
                                id="new-password-repetition"
                                value={newPasswordRepetition}
                                onChange={(e) =>
                                    setNewPasswordRepetition(e.target.value)
                                }
                                disabled={isLoading}
                                label={'Wiederholung Neues Passwort:'}
                                placeholder={'Neues Passwort'}
                                type="password"
                                autoComplete={'new-password'}
                                fullWidth
                            />
                        </DialogContent>
                        <DialogActions>
                            {!isFirstPasswordChange && (
                                <Button
                                    onClick={() => {
                                        resetForm();
                                        onRequestClose();
                                    }}
                                    color="secondary"
                                    variant="outlined"
                                >
                                    Abbrechen
                                </Button>
                            )}
                            <Button
                                type={'submit'}
                                disabled={
                                    !newPassword ||
                                    newPassword !== newPasswordRepetition ||
                                    isLoading
                                }
                                color="secondary"
                                variant="contained"
                            >
                                Passwort ändern
                            </Button>
                        </DialogActions>
                    </form>
                </ResponsiveFullScreenDialog>
                <RequestHisecTokenDialog
                    isOpen={showRequestHisecToken}
                    withCurrentPassword={withCurrentPassword}
                    onRequestClose={(authToken) => {
                        setShowRequestHisecToken(false);
                        if (authToken) {
                            updatePassword({
                                context: { authToken },
                            });
                        }
                    }}
                />
            </>
        );
    }
);
