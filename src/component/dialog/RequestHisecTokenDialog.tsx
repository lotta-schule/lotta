import * as React from 'react';
import {
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    TextField,
} from '@material-ui/core';
import { useMutation } from '@apollo/client';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { ResponsiveFullScreenDialog } from './ResponsiveFullScreenDialog';
import { RequestHisecTokenMutation } from 'api/mutation/RequestHisecTokenMutation';

export interface RequestHisecTokenDialogProps {
    isOpen: boolean;
    onRequestClose(token: string | null): void;
}

export const RequestHisecTokenDialog = React.memo<RequestHisecTokenDialogProps>(
    ({ isOpen, onRequestClose }) => {
        const [password, setPassword] = React.useState('');
        const [requestHisecToken, { loading: isLoading, error }] = useMutation<
            { token: string },
            { password: string }
        >(RequestHisecTokenMutation, {
            variables: { password },
            onCompleted: ({ token }) => {
                onRequestClose(token);
            },
        });
        React.useEffect(() => {
            setPassword('');
        }, [isOpen]);

        return (
            <ResponsiveFullScreenDialog open={isOpen} fullWidth>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        requestHisecToken();
                    }}
                    data-testid="RequestHisecTokenDialog"
                >
                    <DialogTitle>Durch Passwort bestätigen</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Bitte bestätige die Änderung mit deinem aktuellen
                            Passwort.
                        </DialogContentText>
                        <ErrorMessage error={error} />
                        <TextField
                            autoFocus
                            margin="dense"
                            id="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                            label={'Passwort:'}
                            placeholder={'Passwort'}
                            type="password"
                            autoComplete={'current-password'}
                            fullWidth
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => {
                                onRequestClose(null);
                            }}
                            color="secondary"
                            variant="outlined"
                        >
                            Abbrechen
                        </Button>
                        <Button
                            type={'submit'}
                            disabled={!password || isLoading}
                            color="secondary"
                            variant="contained"
                        >
                            senden
                        </Button>
                    </DialogActions>
                </form>
            </ResponsiveFullScreenDialog>
        );
    }
);
