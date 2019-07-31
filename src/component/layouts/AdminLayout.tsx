import React, { FunctionComponent, memo, useState } from 'react';
import { useSelector } from 'react-redux';
import { UserModel } from 'model';
import { State } from 'store/State';
import useRouter from 'use-react-router';
import { BaseLayoutMainContent } from './BaseLayoutMainContent';
import { BaseLayoutSidebar } from './BaseLayoutSidebar';
import SearchIcon from '@material-ui/icons/Search';
import {
    Tabs, Tab, Paper, Typography, Theme, makeStyles, Table, TableHead, TableRow, TableCell, TableBody,
    Avatar, FormControl, InputLabel, Select, MenuItem, Checkbox, IconButton, InputBase, Fab
} from '@material-ui/core';
import classNames from 'classnames';
import { AddUserToGroupDialog } from './userManagement/AddUserToGroupDialog';
import { Add, ExpandMore, ExpandLess } from '@material-ui/icons';
import { theme } from 'theme';

const useStyles = makeStyles((theme: Theme) => ({
    container: {
        paddingTop: theme.spacing(3),
        paddingBottom: theme.spacing(3),
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
    },
    adminNav: {
        marginTop: theme.spacing(1),
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
    root: {
        padding: 2,
        display: 'flex',
        alignItems: 'center',
        width: 400,
        backgroundColor: '#efefef',
        borderRadius: 4,
    },
    input: {
        marginLeft: 8,
        flex: 1,
    },
}));

export const AdminLayout: FunctionComponent = memo(() => {
    const [isAddUserToGroupDialogOpen, setIsAddUserToGroupDialogOpen] = useState(false);
    const user = useSelector<State, UserModel | null>(s => s.user.user);
    const { history } = useRouter();
    const styles = useStyles();
    if (!user) {
        history.replace('/');
        return <div></div>;
    }
    return (
        <>
            <BaseLayoutMainContent>
                <Paper className={styles.container}>
                    <Typography variant="h4" className={styles.headlines}>
                        Nutzerverwaltung
                            </Typography>
                    <div className={classNames(styles.root, styles.headlines)}>
                        <IconButton aria-label="Suche">
                            <SearchIcon />
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
                        <Fab variant="extended" size="small" style={{ marginLeft: theme.spacing(2), paddingRight: theme.spacing(2) }}>
                            <ExpandMore />
                            ausklappen
                        </Fab>
                        <Fab variant="extended" size="small" style={{ marginLeft: theme.spacing(2), paddingRight: theme.spacing(2) }}>
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
            </BaseLayoutMainContent>
            <BaseLayoutSidebar>
                <Paper className={styles.adminNav}>
                    <Tabs
                        value={0}
                        orientation="vertical"
                        variant="scrollable"
                        aria-label="Admin Einstellungen"
                    >
                        <Tab label="Nutzerverwaltung" />
                        <Tab label="Kategorienverwaltung" />
                        <Tab label="Beitrags-Übersicht" />
                        <Tab label="Grundlegendes" />
                    </Tabs>
                </Paper>
            </BaseLayoutSidebar>
        </>
    );
});