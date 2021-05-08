import * as React from 'react';
import {
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableRow,
    TextField,
    makeStyles,
    Tooltip,
    TextFieldProps,
} from '@material-ui/core';
import {
    SkipPrevious,
    SkipNext,
    ExpandLess,
    ExpandMore,
} from '@material-ui/icons';
import { range } from 'lodash';
import { ContentModuleModel } from '../../../../model';
import {
    TableCell as TableCellInterface,
    TableContent,
    TableConfiguration,
} from './Table';

interface EditProps {
    contentModule: ContentModuleModel<TableContent, TableConfiguration>;
    onUpdateModule(
        contentModule: ContentModuleModel<TableContent, TableConfiguration>
    ): void;
}

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'grid',
        gridTemplateRows: `${theme.mixins.toolbar.minHeight}px auto`,
        gridTemplateColumns: `auto ${theme.mixins.toolbar.minHeight}px`,
    },
    upperToolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gridRow: 1,
        gridColumn: 1,
    },
    asideToolbar: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gridRow: 2,
        gridColumn: 2,
    },
    table: {
        gridRow: 2,
        gridColumn: 1,
        '& td': {
            padding: theme.spacing(1),
            border: `1px solid ${theme.palette.divider}`,
        },
    },
}));

export interface EditTableCellProps
    extends Omit<
        TextFieldProps,
        'value' | 'variant' | 'style' | 'defaultValue' | 'onChange'
    > {
    cell: TableCellInterface;
    onChange(cell: TableCellInterface): void;
    position: { row: number; column: number };
}

const EditTableCell = React.memo<EditTableCellProps>(
    ({ cell, position: { row, column }, onChange, ...props }) => {
        const [text, setText] = React.useState(cell.text);
        React.useEffect(() => {
            setText(cell.text);
        }, [cell.text]);
        return (
            <TableCell>
                <TextField
                    multiline
                    variant={'standard'}
                    style={{ width: '100%', border: 0 }}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onBlur={(e) => onChange({ ...cell, text: e.target.value })}
                    inputProps={{
                        'data-row': row,
                        'data-column': column,
                    }}
                    {...props}
                />
            </TableCell>
        );
    }
);

export const Edit = React.memo<EditProps>(
    ({ contentModule, onUpdateModule }) => {
        const styles = useStyles();

        const tableRef = React.useRef<HTMLTableElement>(null);
        const requestFocusOnNextUpdate = React.useRef(false);

        const rowCount = React.useMemo(
            () => contentModule.content?.rows?.length ?? 1,
            [contentModule.content]
        );
        const columnCount = React.useMemo(
            () =>
                Math.max(
                    ...(contentModule.content?.rows?.map(
                        (row) => row?.length
                    ) ?? [1])
                ),
            [contentModule.content]
        );

        const contentRows = React.useMemo(
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

        const onCellKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            const input = e.target as HTMLInputElement;
            if (e.key === 'Enter' && !e.shiftKey) {
                const { row, column } = input.dataset;
                if (row !== undefined && column !== undefined) {
                    if (
                        row === String(rowCount - 1) &&
                        column === String(columnCount - 1)
                    ) {
                        e.preventDefault();
                        requestFocusOnNextUpdate.current = true;
                        onUpdateModule({
                            ...contentModule,
                            content: {
                                ...contentModule.content,
                                rows: [
                                    ...contentRows,
                                    range(columnCount).map(() => ({
                                        text: '',
                                    })),
                                ],
                            },
                        });
                    } else if (column === String(columnCount - 1)) {
                        e.preventDefault();
                        tableRef
                            .current!.querySelector<HTMLInputElement>(
                                `[data-row="${
                                    parseInt(row, 10) + 1
                                }"][data-column="0"]`
                            )
                            ?.focus();
                    } else {
                        e.preventDefault();
                        tableRef
                            .current!.querySelector<HTMLInputElement>(
                                `[data-row="${row}"][data-column="${
                                    parseInt(column, 10) + 1
                                }"]`
                            )
                            ?.focus();
                    }
                }
            }
        };

        const onCellPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
            if (e.clipboardData.types.indexOf('text/html') > -1) {
                // if user is pasting an html table
                // table calculation programs like Excel or Numbers do provide copied data as html (next to other formats),
                // so this allows pasting from Excel or Numbers
                const htmlContent = e.clipboardData.getData('text/html');
                const container = document.createElement('html');
                container.innerHTML = htmlContent;
                const table = container.querySelector('table');
                if (table) {
                    const convertedRows = Array.from(
                        table.querySelectorAll('tr')
                    ).map((trEl) =>
                        Array.from(trEl.cells).map((tdEl) => ({
                            text: tdEl.textContent?.trim() ?? '',
                        }))
                    );
                    const convertedRowCount = convertedRows.length;
                    const convertedColumnCount = Math.max(
                        ...convertedRows.map((row) => row.length)
                    );

                    const relativePastePosition = {
                        row: parseInt(
                            e.currentTarget.querySelector<HTMLInputElement>(
                                '[data-row]'
                            )!.dataset.row!,
                            10
                        ),
                        column: parseInt(
                            e.currentTarget.querySelector<HTMLInputElement>(
                                '[data-row]'
                            )!.dataset.column!,
                            10
                        ),
                    };
                    const newTableDimensions = {
                        rowsCount: Math.max(
                            rowCount,
                            relativePastePosition.row + convertedRowCount
                        ),
                        columnCount: Math.max(
                            columnCount,
                            relativePastePosition.column + convertedColumnCount
                        ),
                    };
                    if (convertedRowCount > 0 && convertedColumnCount > 0) {
                        e.preventDefault();
                        onUpdateModule({
                            ...contentModule,
                            content: {
                                rows: range(newTableDimensions.rowsCount).map(
                                    (rowI) =>
                                        range(
                                            newTableDimensions.columnCount
                                        ).map((colI) => {
                                            const convertedCellAtPosition =
                                                convertedRows[
                                                    rowI -
                                                        relativePastePosition.row
                                                ]?.[
                                                    colI -
                                                        relativePastePosition.column
                                                ];
                                            const contentCellAtPosition =
                                                contentRows[rowI]?.[colI];
                                            if (convertedCellAtPosition) {
                                                return convertedCellAtPosition;
                                            } else {
                                                return {
                                                    // @ts-ignore
                                                    text: '',
                                                    ...contentCellAtPosition,
                                                };
                                            }
                                        })
                                ),
                            },
                        });
                    }
                }
            }
        };

        React.useLayoutEffect(() => {
            const input = tableRef.current!.querySelector<HTMLInputElement>(
                `[data-column="${columnCount - 1}"]`
            );
            const currentlyHasFocus = Boolean(
                tableRef.current!.querySelector('input:focus')
            );
            if (
                input &&
                (currentlyHasFocus || requestFocusOnNextUpdate.current)
            ) {
                input.focus();
            }
            requestFocusOnNextUpdate.current = false;
        }, [columnCount]);

        React.useLayoutEffect(() => {
            const input = tableRef.current!.querySelector<HTMLInputElement>(
                `[data-row="${rowCount - 1}"]`
            );
            const currentlyHasFocus = Boolean(
                tableRef.current!.querySelector('input:focus')
            );
            if (
                input &&
                (currentlyHasFocus || requestFocusOnNextUpdate.current)
            ) {
                input.focus();
            }
            requestFocusOnNextUpdate.current = false;
        }, [rowCount]);

        return (
            <div className={styles.root}>
                <div className={styles.upperToolbar}>
                    <Tooltip
                        title={'letzte Spalte entfernen'}
                        id={`cm-${contentModule.id}-delete-column-tooltip`}
                    >
                        <span>
                            <IconButton
                                size={'small'}
                                aria-labelledby={`cm-${contentModule.id}-delete-column-tooltip`}
                                aria-label={'letzte Spalte entfernen'}
                                disabled={columnCount <= 1}
                                onClick={(_e) => {
                                    onUpdateModule({
                                        ...contentModule,
                                        content: {
                                            ...contentModule.content,
                                            rows: contentRows.map((row) =>
                                                row.filter(
                                                    (_col, i) =>
                                                        i < columnCount - 1
                                                )
                                            ),
                                        },
                                    });
                                }}
                            >
                                <SkipPrevious />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip
                        title={'Spalte hinzufügen'}
                        id={`cm-${contentModule.id}-insert-column-tooltip`}
                    >
                        <IconButton
                            size={'small'}
                            aria-labelledby={`cm-${contentModule.id}-insert-column-tooltip`}
                            onClick={() => {
                                requestFocusOnNextUpdate.current = true;
                                onUpdateModule({
                                    ...contentModule,
                                    content: {
                                        ...contentModule.content,
                                        rows: contentRows.map((row) => [
                                            ...row,
                                            { text: '' },
                                        ]),
                                    },
                                });
                            }}
                        >
                            <SkipNext />
                        </IconButton>
                    </Tooltip>
                </div>
                <div className={styles.asideToolbar}>
                    <Tooltip
                        title={'Zeile entfernen'}
                        id={`cm-${contentModule.id}-delete-row-tooltip`}
                    >
                        <span>
                            <IconButton
                                size={'small'}
                                disabled={rowCount <= 1}
                                aria-labelledby={`cm-${contentModule.id}-delete-row-tooltip`}
                                aria-label={'Zeile entfernen'}
                                onClick={(_e) => {
                                    onUpdateModule({
                                        ...contentModule,
                                        content: {
                                            ...contentModule.content,
                                            rows: contentRows.filter(
                                                (_row, i) => i < rowCount - 1
                                            ),
                                        },
                                    });
                                }}
                            >
                                <ExpandLess />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip
                        title={'Zeile hinzufügen'}
                        id={`cm-${contentModule.id}-insert-row-tooltip`}
                    >
                        <IconButton
                            size={'small'}
                            aria-labelledby={`cm-${contentModule.id}-insert-row-tooltip`}
                            onClick={() => {
                                requestFocusOnNextUpdate.current = true;
                                onUpdateModule({
                                    ...contentModule,
                                    content: {
                                        ...contentModule.content,
                                        rows: [
                                            ...contentRows,
                                            range(columnCount).map(() => ({
                                                text: '',
                                            })),
                                        ],
                                    },
                                });
                            }}
                        >
                            <ExpandMore />
                        </IconButton>
                    </Tooltip>
                </div>
                <Table ref={tableRef} className={styles.table}>
                    <TableBody>
                        {range(rowCount).map((rowIndex) => {
                            return (
                                <TableRow key={`row-${rowIndex}`}>
                                    {range(columnCount).map((columnIndex) => {
                                        return (
                                            <EditTableCell
                                                key={`row-${rowIndex}-col-${columnIndex}`}
                                                position={{
                                                    row: rowIndex,
                                                    column: columnIndex,
                                                }}
                                                cell={
                                                    contentRows[rowIndex][
                                                        columnIndex
                                                    ]
                                                }
                                                onKeyDown={onCellKeyDown}
                                                onPaste={onCellPaste}
                                                onChange={(updatedCell) => {
                                                    onUpdateModule({
                                                        ...contentModule,
                                                        content: {
                                                            rows: contentRows.map(
                                                                (row, rowI) =>
                                                                    row.map(
                                                                        (
                                                                            cell,
                                                                            columnI
                                                                        ) =>
                                                                            rowI ===
                                                                                rowIndex &&
                                                                            columnI ===
                                                                                columnIndex
                                                                                ? updatedCell
                                                                                : cell
                                                                    )
                                                            ),
                                                        },
                                                    });
                                                }}
                                            />
                                        );
                                    })}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        );
    }
);
