import * as React from 'react';
import { useMutation } from '@apollo/client';
import { Button } from 'shared/general/button/Button';
import {
    Dialog,
    DialogActions,
    DialogContent,
} from 'shared/general/dialog/Dialog';
import { ErrorMessage } from 'shared/general/ErrorMessage';
import { Input } from 'shared/general/form/input/Input';
import { Label } from 'shared/general/label/Label';

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
            <Dialog
                open={isOpen && !withCurrentPassword}
                onRequestClose={() => onRequestClose(null)}
                title={'Durch Passwort bestätigen'}
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        requestHisecToken();
                    }}
                    data-testid="RequestHisecTokenDialog"
                >
                    <DialogContent>
                        Bitte bestätige die Änderung mit deinem aktuellen
                        Passwort.
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
            </Dialog>
        );
    }
);
