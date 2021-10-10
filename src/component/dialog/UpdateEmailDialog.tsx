import * as React from 'react';
import { useMutation } from '@apollo/client';
import { Button } from 'component/general/button/Button';
import {
    Dialog,
    DialogActions,
    DialogContent,
} from 'component/general/dialog/Dialog';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { Input } from 'component/general/form/input/Input';
import { Label } from 'component/general/label/Label';
import { RequestHisecTokenDialog } from './RequestHisecTokenDialog';

import UpdateEmailMutation from 'api/mutation/UpdateEmailMutation.graphql';

export interface UpdateEmailDialogProps {
    isOpen: boolean;
    onRequestClose(): void;
}

export const UpdateEmailDialog = React.memo<UpdateEmailDialogProps>(
    ({ isOpen, onRequestClose }) => {
        const [showRequestHisecToken, setShowRequestHisecToken] =
            React.useState(false);
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
                <Dialog
                    open={isOpen}
                    onRequestClose={onRequestClose}
                    title={'Email ändern'}
                >
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            setShowRequestHisecToken(true);
                        }}
                        data-testid="UpdateEmailDialog"
                    >
                        <DialogContent>
                            Wähle eine neue Email-Adresse.
                            <ErrorMessage error={error} />
                            <Label label={'Neue Email:'}>
                                <Input
                                    autoFocus
                                    id="new-email"
                                    value={newEmail}
                                    onChange={(e) =>
                                        setNewEmail(e.currentTarget.value)
                                    }
                                    disabled={isLoading}
                                    placeholder={'Neue Email'}
                                    type="email"
                                    autoComplete={'new-email'}
                                />
                            </Label>
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
                </Dialog>
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
