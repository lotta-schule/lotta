import React, { memo, useCallback } from 'react';
import { TableCell, makeStyles } from '@material-ui/core';
import { AutoSizer, Column, RowMouseEventHandlerParams, Table, TableCellRenderer, TableHeaderProps } from 'react-virtualized';
import clsx from 'clsx'

declare module '@material-ui/core/styles/withStyles' {
    // Augment the BaseCSSProperties so that we can control jss-rtl
    interface BaseCSSProperties {
        /*
         * Used to control if the rule-set should be affected by rtl transformation
         */
        flip?: boolean;
    }
}

interface ColumnData {
    dataKey: string;
    label: string;
    numeric?: boolean;
    width?: number;
}

interface Row {
    index: number;
}

interface MuiVirtualizedTableProps<T = any> {
    className?: string;
    height?: number;
    columns: ColumnData[];
    headerHeight?: number;
    rowCount: number;
    rowHeight?: number;
    onRowClick?(params: RowMouseEventHandlerParams): void;
    rowGetter(row: Row): T;
}

const useStyles = makeStyles(theme => ({
    flexContainer: {
        display: 'flex',
        alignItems: 'center',
        boxSizing: 'border-box',
        backgroundColor: theme.palette.background.paper,
    },
    table: {
        backgroundColor: theme.palette.background.paper,
        // temporary right-to-left patch, waiting for
        // https://github.com/bvaughn/react-virtualized/issues/454
        '& .ReactVirtualized__Table__headerRow': {
            flip: false,
            paddingRight: theme.direction === 'rtl' ? '0px !important' : undefined,
        },
    },
    tableRow: {
        cursor: 'pointer',
    },
    tableRowHover: {
        '&:hover': {
            backgroundColor: theme.palette.grey[200],
        },
    },
    tableCell: {
        flex: 1,
    },
    noClick: {
        cursor: 'initial',
    },
    flexGrow: {
        flexGrow: 1
    },
    forceFlexGrow: {
        flex: '1 !important'
    }
}));

export const VirtualizedTable = memo<MuiVirtualizedTableProps>(({ className, height, columns, headerHeight, onRowClick, rowHeight, ...tableProps }) => {
    const styles = useStyles();

    const getRowClassName = ({ index }: Row) => {
        return clsx(styles.tableRow, styles.flexContainer, {
            [styles.tableRowHover]: index !== -1 && onRowClick != null,
        });
    };

    const cellRenderer: TableCellRenderer = useCallback(({ cellData, columnIndex }) => {
        return (
            <TableCell
                component="div"
                className={clsx(styles.tableCell, styles.flexContainer, {
                    [styles.noClick]: onRowClick == null,
                    [styles.flexGrow]: columns[columnIndex].width === undefined
                })}
                variant="body"
                style={{ height: rowHeight }}
                align={(columnIndex != null && columns[columnIndex].numeric) || false ? 'right' : 'left'}
            >
                {cellData}
            </TableCell>
        );
    }, [columns, styles, rowHeight, onRowClick]);

    const headerRenderer = useCallback(({ label, columnIndex }: TableHeaderProps & { columnIndex: number }) => {
        return (
            <TableCell
                component="div"
                className={clsx(styles.tableCell, styles.flexContainer, styles.noClick, styles.forceFlexGrow)}
                variant="head"
                style={{ height: headerHeight }}
                align={columns[columnIndex].numeric || false ? 'right' : 'left'}
            >
                <span>{label}</span>
            </TableCell>
        );
    }, [styles, headerHeight, columns]);

    return (
        <AutoSizer>
            {({ width }) => (
                <Table
                    height={height ?? 600}
                    width={width}
                    rowHeight={rowHeight ?? 48}
                    gridStyle={{
                        direction: 'inherit',
                    }}
                    headerHeight={headerHeight ?? 48}
                    className={clsx(className, styles.table)}
                    onRowClick={onRowClick}
                    {...tableProps}
                    rowClassName={getRowClassName}
                >
                    {columns.map(({ dataKey, width, ...other }, index) => {
                        return (
                            <Column
                                key={dataKey}
                                headerRenderer={headerProps =>
                                    headerRenderer({
                                        ...headerProps,
                                        columnIndex: index,
                                    })
                                }
                                className={clsx(styles.flexContainer, { [styles.forceFlexGrow]: !width })}
                                cellRenderer={cellRenderer}
                                dataKey={dataKey}
                                width={width ?? 200}
                                {...other}
                            />
                        );
                    })}
                </Table>
            )}
        </AutoSizer>
    );

});