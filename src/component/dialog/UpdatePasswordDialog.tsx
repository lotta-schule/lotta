import React, { memo, useState } from 'react';
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

export interface UpdatePasswordDialogProps {
    isOpen: boolean;
    onRequestClose(): void;
}

export const UpdatePasswordDialog = memo<UpdatePasswordDialogProps>(
    ({ isOpen, onRequestClose }) => {
        const [currentPassword, setCurrentPassword] = useState('');
        const [newPassword, setNewPassword] = useState('');
        const [newPasswordRepetition, setNewPasswordRepetition] = useState('');
        const resetForm = () => {
            setCurrentPassword('');
            setNewPassword('');
            setNewPasswordRepetition('');
        };
        const [updatePassword, { loading: isLoading, error }] = useMutation<
            true,
            { currentPassword: string; newPassword: string }
        >(UpdatePasswordMutation, {
            variables: { currentPassword, newPassword },
            onCompleted: () => {
                resetForm();
                onRequestClose();
            },
        });
        return (
            <ResponsiveFullScreenDialog open={isOpen} fullWidth>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        updatePassword();
                    }}
                    data-testid="UpdatePasswordDialog"
                >
                    <DialogTitle>Passwort ändern</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Identifiziere dich mit deinem aktuellen Passwort,
                            wähle dann ein neues Passwort und bestätige es.
                        </DialogContentText>
                        <ErrorMessage error={error} />
                        <TextField
                            autoFocus
                            margin="dense"
                            id="current-password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            disabled={isLoading}
                            label={'Aktuelles Passwort:'}
                            placeholder={'Aktuelles Passwort'}
                            type="password"
                            autoComplete={'current-password'}
                            fullWidth
                        />
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
                        <Button
                            type={'submit'}
                            disabled={
                                !currentPassword ||
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
        );
    }
);
