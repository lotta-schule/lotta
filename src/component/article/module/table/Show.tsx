import React, { memo, useMemo } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
    makeStyles,
} from '@material-ui/core';
import { range } from 'lodash';
import { ContentModuleModel } from 'model';
import { TableContent, TableConfiguration } from './Table';

interface ShowProps {
    contentModule: ContentModuleModel<TableContent, TableConfiguration>;
}

const useStyles = makeStyles((theme) => ({
    root: {},
}));

export const Show = memo<ShowProps>(({ contentModule }) => {
    const styles = useStyles();

    const rowCount = useMemo(() => contentModule.content?.rows?.length ?? 1, [
        contentModule.content,
    ]);
    const columnCount = useMemo(
        () =>
            Math.max(
                ...(contentModule.content?.rows?.map((row) => row?.length) ?? [
                    1,
                ])
            ),
        [contentModule.content]
    );

    const contentRows = useMemo(
        () =>
            range(rowCount).map((rowIndex) =>
                range(columnCount).map(
                    (columnIndex) =>
                        contentModule.content?.rows?.[rowIndex]?.[
                            columnIndex
                        ] ?? { text: '' }
                )
            ),
        [rowCount, columnCount, contentModule.content]
    );

    return (
        <Table className={styles.root}>
            <TableBody>
                {range(rowCount).map((rowIndex) => {
                    return (
                        <TableRow key={`row-${rowIndex}`}>
                            {range(columnCount).map((columnIndex) => {
                                return (
                                    <TableCell
                                        key={`row-${rowIndex}-col-${columnIndex}`}
                                    >
                                        {
                                            contentRows[rowIndex][columnIndex]
                                                .text
                                        }
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
});
