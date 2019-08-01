import React, { FunctionComponent, memo, useState } from 'react';
import {
    Paper, Typography, IconButton, Fab, Table, TableHead, TableRow, TableCell, FormControl,
    Checkbox, TableBody, Avatar, InputLabel, Select, MenuItem, InputBase, makeStyles, Theme
} from '@material-ui/core';
import classNames from 'classnames';
import { ExpandMore, Search, Add, ExpandLess } from '@material-ui/icons';
import { AddUserToGroupDialog } from './AddUserToGroupDialog';

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        padding: 2,
        display: 'flex',
        alignItems: 'center',
        width: 400,
        backgroundColor: '#efefef',
        borderRadius: 4,
    },
    container: {
        paddingTop: theme.spacing(3),
        paddingBottom: theme.spacing(3),
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
    },
    avatar: {
        height: '1.5em',
        width: '1.5em',
        margin: '.25em .5em .25em 0',
    },
    headlines: {
        marginBottom: theme.spacing(2),
    },
    formControl: {
        width: '100%',
    },
    input: {
        marginLeft: 8,
        flex: 1,
    },
    expandButton: {
        marginLeft: theme.spacing(2),
        paddingRight: theme.spacing(2)
    }
}));

export const UserManagement: FunctionComponent = memo(() => {
    const [isAddUserToGroupDialogOpen, setIsAddUserToGroupDialogOpen] = useState(false);
    const styles = useStyles();

    return (
        <>
            <Paper className={styles.container}>
                <Typography variant="h4" className={styles.headlines}>
                    Nutzerverwaltung
                            </Typography>
                <div className={classNames(styles.root, styles.headlines)}>
                    <IconButton aria-label="Suche">
                        <Search />
                    </IconButton>
                    <InputBase placeholder="Suche nach Nutzern" className={styles.input} />
                    <a href="/" onClick={(e) => { e.preventDefault(); setIsAddUserToGroupDialogOpen(true); }}>
                        <IconButton aria-label="Suche">
                            <Add />
                        </IconButton>
                    </a>
                </div>
                <Typography variant="h6">
                    Gruppe: Schüler
                    <Fab variant="extended" size="small" className={styles.expandButton}>
                        <ExpandMore />
                        ausklappen
                    </Fab>
                    <Fab variant="extended" size="small" className={styles.expandButton}>
                        <ExpandLess />
                        einklappen
                    </Fab>
                </Typography>
                <Table size={'small'}>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <FormControl>
                                    <Checkbox value="1" />
                                </FormControl>
                            </TableCell>
                            <TableCell></TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Rechte</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                <FormControl>
                                    <Checkbox value="1" />
                                </FormControl>
                            </TableCell>
                            <TableCell>
                                <Avatar className={styles.avatar} src={`https://avatars.dicebear.com/v2/avataaars/ernie.svg`} />
                            </TableCell>
                            <TableCell>Ernie Sesam</TableCell>
                            <TableCell>
                                <FormControl className={styles.formControl}>
                                    <InputLabel htmlFor="heading-level">Rechte</InputLabel>
                                    <Select fullWidth>
                                        <MenuItem value={1}>Schüler</MenuItem>
                                        <MenuItem value={2}>Öffentlich</MenuItem>
                                        <MenuItem value={3}>...</MenuItem>
                                    </Select>
                                </FormControl>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                <FormControl>
                                    <Checkbox value="1" />
                                </FormControl>
                            </TableCell>
                            <TableCell>
                                <Avatar className={styles.avatar} src={`https://avatars.dicebear.com/v2/avataaars/ernie.svg`} />
                            </TableCell>
                            <TableCell>Ernie Sesam</TableCell>
                            <TableCell>
                                <FormControl className={styles.formControl}>
                                    <InputLabel htmlFor="heading-level">Rechte</InputLabel>
                                    <Select fullWidth>
                                        <MenuItem value={1}>Schüler</MenuItem>
                                        <MenuItem value={2}>Öffentlich</MenuItem>
                                        <MenuItem value={3}>...</MenuItem>
                                    </Select>
                                </FormControl>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                <FormControl>
                                    <Checkbox value="1" />
                                </FormControl>
                            </TableCell>
                            <TableCell>
                                <Avatar className={styles.avatar} src={`https://avatars.dicebear.com/v2/avataaars/ernie.svg`} />
                            </TableCell>
                            <TableCell>Ernie Sesam</TableCell>
                            <TableCell>
                                <FormControl className={styles.formControl}>
                                    <InputLabel htmlFor="heading-level">Rechte</InputLabel>
                                    <Select fullWidth>
                                        <MenuItem value={1}>Schüler</MenuItem>
                                        <MenuItem value={2}>Öffentlich</MenuItem>
                                        <MenuItem value={3}>...</MenuItem>
                                    </Select>
                                </FormControl>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                <FormControl>
                                    <Checkbox value="1" />
                                </FormControl>
                            </TableCell>
                            <TableCell>
                                <Avatar className={styles.avatar} src={`https://avatars.dicebear.com/v2/avataaars/ernie.svg`} />
                            </TableCell>
                            <TableCell>Ernie Sesam</TableCell>
                            <TableCell>
                                <FormControl className={styles.formControl}>
                                    <InputLabel htmlFor="heading-level">Rechte</InputLabel>
                                    <Select fullWidth>
                                        <MenuItem value={1}>Schüler</MenuItem>
                                        <MenuItem value={2}>Öffentlich</MenuItem>
                                        <MenuItem value={3}>...</MenuItem>
                                    </Select>
                                </FormControl>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                <FormControl>
                                    <Checkbox value="1" />
                                </FormControl>
                            </TableCell>
                            <TableCell>
                                <Avatar className={styles.avatar} src={`https://avatars.dicebear.com/v2/avataaars/ernie.svg`} />
                            </TableCell>
                            <TableCell>Ernie Sesam</TableCell>
                            <TableCell>
                                <FormControl className={styles.formControl}>
                                    <InputLabel htmlFor="heading-level">Rechte</InputLabel>
                                    <Select fullWidth>
                                        <MenuItem value={1}>Schüler</MenuItem>
                                        <MenuItem value={2}>Öffentlich</MenuItem>
                                        <MenuItem value={3}>...</MenuItem>
                                    </Select>
                                </FormControl>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                <FormControl>
                                    <Checkbox value="1" />
                                </FormControl>
                            </TableCell>
                            <TableCell>
                                <Avatar className={styles.avatar} src={`https://avatars.dicebear.com/v2/avataaars/ernie.svg`} />
                            </TableCell>
                            <TableCell>Ernie Sesam</TableCell>
                            <TableCell>
                                <FormControl className={styles.formControl}>
                                    <InputLabel htmlFor="heading-level">Rechte</InputLabel>
                                    <Select fullWidth>
                                        <MenuItem value={1}>Schüler</MenuItem>
                                        <MenuItem value={2}>Öffentlich</MenuItem>
                                        <MenuItem value={3}>...</MenuItem>
                                    </Select>
                                </FormControl>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                <FormControl>
                                    <Checkbox value="1" />
                                </FormControl>
                            </TableCell>
                            <TableCell>
                                <Avatar className={styles.avatar} src={`https://avatars.dicebear.com/v2/avataaars/ernie.svg`} />
                            </TableCell>
                            <TableCell>Ernie Sesam</TableCell>
                            <TableCell>
                                <FormControl className={styles.formControl}>
                                    <InputLabel htmlFor="heading-level">Rechte</InputLabel>
                                    <Select fullWidth>
                                        <MenuItem value={1}>Schüler</MenuItem>
                                        <MenuItem value={2}>Öffentlich</MenuItem>
                                        <MenuItem value={3}>...</MenuItem>
                                    </Select>
                                </FormControl>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </Paper>
            <Paper className={styles.container}>
                <Typography variant="h6">
                    Gruppe: Lehrer
                </Typography>
                <Table size={'small'}>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <FormControl>
                                    <Checkbox value="1" />
                                </FormControl>
                            </TableCell>
                            <TableCell></TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Rechte</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                <FormControl>
                                    <Checkbox value="1" />
                                </FormControl>
                            </TableCell>
                            <TableCell>
                                <Avatar className={styles.avatar} src={`https://avatars.dicebear.com/v2/avataaars/bert.svg`} />
                            </TableCell>
                            <TableCell>Ernie Sesam</TableCell>
                            <TableCell>
                                <FormControl className={styles.formControl}>
                                    <InputLabel htmlFor="heading-level">Rechte</InputLabel>
                                    <Select fullWidth>
                                        <MenuItem value={1}>Schüler</MenuItem>
                                        <MenuItem value={2}>Öffentlich</MenuItem>
                                        <MenuItem value={3}>...</MenuItem>
                                    </Select>
                                </FormControl>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </Paper>
            <Paper className={styles.container}>
                <Typography variant="h6">
                    Gruppe: Administratoren
                </Typography>
                <Table size={'small'}>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <FormControl>
                                    <Checkbox value="1" />
                                </FormControl>
                            </TableCell>
                            <TableCell></TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Rechte</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                <FormControl>
                                    <Checkbox value="1" />
                                </FormControl>
                            </TableCell>
                            <TableCell>
                                <Avatar className={styles.avatar} src={`https://avatars.dicebear.com/v2/avataaars/admin.svg`} />
                            </TableCell>
                            <TableCell>Ernie Sesam</TableCell>
                            <TableCell>
                                <FormControl className={styles.formControl}>
                                    <InputLabel htmlFor="heading-level">Rechte</InputLabel>
                                    <Select fullWidth>
                                        <MenuItem value={1}>Schüler</MenuItem>
                                        <MenuItem value={2}>Öffentlich</MenuItem>
                                        <MenuItem value={3}>...</MenuItem>
                                    </Select>
                                </FormControl>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </Paper>
            <AddUserToGroupDialog
                onAbort={() => setIsAddUserToGroupDialogOpen(false)}
                onConfirm={() => setIsAddUserToGroupDialogOpen(false)}
                isOpen={isAddUserToGroupDialogOpen}
            />
        </>
    );
});