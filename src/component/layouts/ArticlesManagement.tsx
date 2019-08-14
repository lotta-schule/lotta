
import React, { FunctionComponent, memo } from 'react';
import {
    makeStyles, Theme, Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, CardMedia, Tooltip, IconButton
} from '@material-ui/core';
import { Edit, Delete } from '@material-ui/icons';

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        paddingTop: theme.spacing(3),
        paddingBottom: theme.spacing(3),
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
    },
    headlines: {
        marginBottom: theme.spacing(2),
    },
    actionButton: {
        height: 24,
        width: 24,
        padding: 0
    },
}));

export const ArticlesManagement: FunctionComponent = memo(() => {
    const styles = useStyles();

    return (
        <Table size={'small'}>
            <TableHead>
                <TableRow>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell>Erstellungsdatum</TableCell>
                    <TableCell>Vorschaubild</TableCell>
                    <TableCell>Beitragsname</TableCell>
                    <TableCell>Kategorie</TableCell>
                    <TableCell>Status</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                    <TableRow>
                        <TableCell>
                            <Tooltip title="Beitrag bearbeiten">
                                <IconButton className={styles.actionButton} aria-label="Beitrag bearbeiten" onClick={() => { }}>
                                    <Edit />
                                </IconButton>
                            </Tooltip>
                        </TableCell>
                        <TableCell>
                        <Tooltip title="Beitrag löschen">
                            <IconButton className={styles.actionButton} aria-label="Beitrag löschen" onClick={() => { }}>
                                <Delete />
                            </IconButton>
                        </Tooltip>
                        </TableCell>
                        <TableCell>23.07.2019</TableCell>
                        <TableCell>
                            <CardMedia
                            style={{ height: 50, width: 75, }}
                            image="https://placeimg.com/75/50/any"
                            />
                        </TableCell>
                        <TableCell><b>Oglaf – eine besondere Berichterstattung</b></TableCell>
                        <TableCell>Oskarverleihung</TableCell>
                        <TableCell>Sichtbar</TableCell>
                    </TableRow>
            </TableBody>
        </Table>
    );
});