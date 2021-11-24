import * as React from 'react';
import { TableCell } from '@material-ui/core';
import {
    AutoSizer,
    Column,
    RowMouseEventHandlerParams,
    Table,
    TableCellRenderer,
    TableHeaderProps,
} from 'react-virtualized';
import clsx from 'clsx';

import styles from './VirtualizedTable.module.scss';

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

export const VirtualizedTable = React.memo<MuiVirtualizedTableProps>(
    ({
        className,
        height,
        columns,
        headerHeight,
        onRowClick,
        rowHeight,
        ...tableProps
    }) => {
        const getRowClassName = ({ index }: Row) => {
            return clsx(styles.tableRow, styles.flexContainer, {
                [styles.tableRowHover]: index !== -1 && onRowClick != null,
            });
        };

        const cellRenderer: TableCellRenderer = React.useCallback(
            ({ cellData, columnIndex }) => {
                return (
                    <TableCell
                        component="div"
                        className={clsx(
                            styles.tableCell,
                            styles.flexContainer,
                            {
                                [styles.noClick]: onRowClick == null,
                                [styles.flexGrow]:
                                    columns[columnIndex].width === undefined,
                            }
                        )}
                        variant="body"
                        style={{ height: rowHeight }}
                        align={
                            (columnIndex != null &&
                                columns[columnIndex].numeric) ||
                            false
                                ? 'right'
                                : 'left'
                        }
                    >
                        {cellData}
                    </TableCell>
                );
            },
            [columns, rowHeight, onRowClick]
        );

        const headerRenderer = React.useCallback(
            ({
                label,
                columnIndex,
            }: TableHeaderProps & { columnIndex: number }) => {
                return (
                    <TableCell
                        component="div"
                        className={clsx(
                            styles.tableCell,
                            styles.flexContainer,
                            styles.noClick,
                            styles.forceFlexGrow
                        )}
                        variant="head"
                        style={{ height: headerHeight }}
                        align={
                            columns[columnIndex].numeric || false
                                ? 'right'
                                : 'left'
                        }
                    >
                        <span>{label}</span>
                    </TableCell>
                );
            },
            [headerHeight, columns]
        );

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
                                    headerRenderer={(headerProps) =>
                                        headerRenderer({
                                            ...headerProps,
                                            columnIndex: index,
                                        })
                                    }
                                    className={clsx(styles.flexContainer, {
                                        [styles.forceFlexGrow]: !width,
                                    })}
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
    }
);
VirtualizedTable.displayName = 'VirtualizedTable';
