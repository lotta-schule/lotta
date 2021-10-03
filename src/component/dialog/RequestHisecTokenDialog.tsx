import * as React from 'react';
import {
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@material-ui/core';
import { Button } from 'component/general/button/Button';
import { useMutation } from '@apollo/client';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { Input } from 'component/general/form/input/Input';
import { Label } from 'component/general/label/Label';
import { ResponsiveFullScreenDialog } from './ResponsiveFullScreenDialog';
import RequestHisecTokenMutation from 'api/mutation/RequestHisecTokenMutation.graphql';

export interface RequestHisecTokenDialogProps {
    isOpen: boolean;
    withCurrentPassword?: string;
    onRequestClose(token: string | null): void;
}

export const RequestHisecTokenDialog = React.memo<RequestHisecTokenDialogProps>(
    ({ isOpen, onRequestClose, withCurrentPassword }) => {
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
        React.useEffect(() => {
            if (isOpen && withCurrentPassword) {
                requestHisecToken({
                    variables: { password: withCurrentPassword },
                });
            }
        }, [withCurrentPassword, requestHisecToken, isOpen]);

        return (
            <ResponsiveFullScreenDialog
                open={isOpen && !withCurrentPassword}
                fullWidth
            >
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
                        <Label label={'Passwort:'}>
                            <Input
                                autoFocus
                                id="current-password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.currentTarget.value)
                                }
                                disabled={isLoading}
                                placeholder={'Passwort'}
                                type="password"
                                autoComplete={'current-password'}
                            />
                        </Label>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => {
                                onRequestClose(null);
                            }}
                        >
                            Abbrechen
                        </Button>
                        <Button
                            type={'submit'}
                            disabled={!password || isLoading}
                        >
                            senden
                        </Button>
                    </DialogActions>
                </form>
            </ResponsiveFullScreenDialog>
        );
    }
);
