import React, { FunctionComponent, memo, useState } from 'react';
import {
    DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Dialog,
    Select, FormControl, Input, MenuItem, FormHelperText, Avatar, Typography, Grid,
} from '@material-ui/core';
import { UserModel } from 'model';
import { theme } from 'theme';

export interface AddUserToGroupDialogProps {
    isOpen: boolean;
    onConfirm(user: UserModel): void;
    onAbort(): void;
}

export const AddUserToGroupDialog: FunctionComponent<AddUserToGroupDialogProps> = memo(({
    isOpen,
    onConfirm,
    onAbort
}) => {
    const [, setTitle] = useState('');
    const [, setCategoryId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const resetForm = () => {
        setTitle('');
        setCategoryId(null);
    }
    return (
        <Dialog open={isOpen} fullWidth>
            <form onSubmit={async (e) => {
                e.preventDefault();
                setErrorMessage(null);
                setIsLoading(true);
                try {
                    // const { data } = await client.mutate<{ article: ArticleModel }, { article: ArticleModelInput }>({
                    //     mutation: CreateArticleMutation,
                    //     fetchPolicy: 'no-cache',
                    //     variables: {
                    //         article: {
                    //             title,
                    //             category: {
                    //                 id: categoryId || undefined
                    //             },
                    //             contentModules: []
                    //         }
                    //     }
                    // });
                    resetForm();
                } catch (e) {
                    console.error(e);
                    setErrorMessage(e.message);
                } finally {
                    setIsLoading(false);
                }
            }}>
                <DialogTitle>Nutzer eine Gruppe zuweisen</DialogTitle>
                <DialogContent>
                    <DialogContentText variant="body2">
                        Weise dem Nutzer eine Gruppe mit den dazugehörigen Rechten zu.
                    </DialogContentText>
                    {errorMessage && (
                        <p style={{ color: 'red' }}>{errorMessage}</p>
                    )}
                    <Grid container justify={'space-evenly'}>
                        <Grid item xs={3}>
                            <Avatar src={`https://avatars.dicebear.com/v2/avataaars/admin.svg`} />
                        </Grid>
                        <Grid item xs={9}>
                            <Typography variant="h6">
                                Ernie Sesam
                            </Typography>
                            <Typography variant="body2">
                                Nickname: Bibbedibabbedibu
                            </Typography>
                            <Typography variant="body2">
                                Klasse: 7/4
                            </Typography>
                            <Typography variant="body2">
                                E-Mail-Aresse: ernie@aol.com
                            </Typography>
                        </Grid>
                    </Grid>
                    <FormControl fullWidth style={{ marginTop: theme.spacing(2) }}>
                        <Select
                            value={1}
                            onChange={({ target }) => setCategoryId((target.value as string) || null)}
                            input={<Input name="category-id" id="category-id-placeholder" />}
                            fullWidth
                            name="category-id"
                            placeholder="Keine Gruppe"
                        >
                            <MenuItem value="1">
                                <em>Keine Gruppe</em>
                            </MenuItem>
                            <MenuItem >
                                Schüler
                                </MenuItem>
                            <MenuItem >
                                Lehrer
                                </MenuItem>
                            <MenuItem >
                                Administrator
                                </MenuItem>
                        </Select>
                        <FormHelperText>Gruppe auswählen</FormHelperText>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            resetForm();
                            onAbort();
                        }}
                        color="secondary"
                        variant="outlined"
                    >
                        Abbrechen
                        </Button>
                    <Button
                        type={'submit'}
                        disabled={isLoading}
                        color="secondary"
                        variant="contained">
                        Gruppe zuweisen
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
});