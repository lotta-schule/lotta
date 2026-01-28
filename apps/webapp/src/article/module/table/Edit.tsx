import * as React from 'react';
import { range } from 'lodash';

import {
  Button,
  Input,
  InputProps,
  Table,
  Tooltip,
} from '@lotta-schule/hubert';
import { ContentModuleModel } from 'model';
import {
  TableCell as TableCellInterface,
  TableContent,
  TableConfiguration,
} from './Table';

import styles from './Table.module.scss';
import { faCircleMinus, faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { Icon } from 'shared/Icon';

interface EditProps {
  contentModule: ContentModuleModel<TableContent, TableConfiguration>;
  onUpdateModule(
    contentModule: ContentModuleModel<TableContent, TableConfiguration>
  ): void;
}

export interface EditTableCellProps extends Omit<
  InputProps,
  'value' | 'style' | 'onChange'
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
      <td>
        <Input
          multiline={true}
          value={text}
          onChange={(e) => setText(e.currentTarget.value)}
          onBlur={(e) => onChange({ ...cell, text: e.currentTarget.value })}
          data-row={row}
          data-column={column}
          {...(props as any)}
        />
      </td>
    );
  }
);
EditTableCell.displayName = 'TableEditTableCell';

export const Edit = React.memo<EditProps>(
  ({ contentModule, onUpdateModule }) => {
    const tableRef = React.useRef<HTMLTableElement>(null);
    const requestFocusOnNextUpdate = React.useRef(false);

    const rowCount = React.useMemo(
      () => contentModule.content?.rows?.length ?? 1,
      [contentModule.content]
    );
    const columnCount = React.useMemo(
      () =>
        Math.max(
          ...(contentModule.content?.rows?.map((row) => row?.length) ?? [1])
        ),
      [contentModule.content]
    );

    const contentRows = React.useMemo(
      () =>
        new Array(rowCount).fill(0).map((_, rowIndex) =>
          new Array(columnCount).fill(0).map(
            (_, columnIndex) =>
              contentModule.content?.rows?.[rowIndex]?.[columnIndex] ?? {
                text: '',
              }
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
                `[data-row="${parseInt(row, 10) + 1}"][data-column="0"]`
              )
              ?.focus();
          } else {
            e.preventDefault();
            tableRef
              .current!.querySelector<HTMLInputElement>(
                `[data-row="${row}"][data-column="${parseInt(column, 10) + 1}"]`
              )
              ?.focus();
          }
        }
      }
    };

    const onCellPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
      if (e.clipboardData.types.indexOf('text/html') > -1) {
        // if userAvatar is pasting an html table
        // table calculation programs like Excel or Numbers do provide copied data as html (next to other formats),
        // so this allows pasting from Excel or Numbers
        const htmlContent = e.clipboardData.getData('text/html');
        const container = document.createElement('html');
        container.innerHTML = htmlContent;
        const table = container.querySelector('table');
        if (table) {
          const convertedRows = Array.from(table.querySelectorAll('tr')).map(
            (trEl) =>
              Array.from(trEl.cells).map((tdEl) => ({
                text: tdEl.textContent?.trim() ?? '',
              }))
          );
          const convertedRowCount = convertedRows.length;
          const convertedColumnCount = Math.max(
            ...convertedRows.map((row) => row.length)
          );

          const relativePastePosition = {
            row: parseInt(e.currentTarget.dataset.row!, 10),
            column: parseInt(e.currentTarget.dataset.column!, 10),
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
                rows: range(newTableDimensions.rowsCount).map((rowI) =>
                  range(newTableDimensions.columnCount).map((colI) => {
                    const convertedCellAtPosition =
                      convertedRows[rowI - relativePastePosition.row]?.[
                        colI - relativePastePosition.column
                      ];
                    const contentCellAtPosition = contentRows[rowI]?.[
                      colI
                    ] as Partial<TableCellInterface>;
                    if (convertedCellAtPosition) {
                      return convertedCellAtPosition;
                    } else {
                      return {
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
      if (input && (currentlyHasFocus || requestFocusOnNextUpdate.current)) {
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
      if (input && (currentlyHasFocus || requestFocusOnNextUpdate.current)) {
        input.focus();
      }
      requestFocusOnNextUpdate.current = false;
    }, [rowCount]);

    return (
      <div className={styles.edit}>
        <div className={styles.upperToolbar}>
          <div>Spalten</div>
          <Tooltip label={'letzte Spalte entfernen'}>
            <span>
              <Button
                small
                icon={<Icon icon={faCircleMinus} size={'lg'} />}
                aria-label={'letzte Spalte entfernen'}
                disabled={columnCount <= 1}
                onClick={() => {
                  onUpdateModule({
                    ...contentModule,
                    content: {
                      ...contentModule.content,
                      rows: contentRows.map((row) =>
                        row.filter((_col, i) => i < columnCount - 1)
                      ),
                    },
                  });
                }}
              />
            </span>
          </Tooltip>
          <Tooltip label={'Spalte hinzufügen'}>
            <Button
              small
              icon={<Icon icon={faCirclePlus} size={'lg'} />}
              aria-label={'Spalte hinzufügen'}
              onClick={() => {
                requestFocusOnNextUpdate.current = true;
                onUpdateModule({
                  ...contentModule,
                  content: {
                    ...contentModule.content,
                    rows: contentRows.map((row) => [...row, { text: '' }]),
                  },
                });
              }}
            />
          </Tooltip>
        </div>
        <div className={styles.asideToolbar}>
          <div> Zeilen</div>
          <Tooltip label={'Zeile entfernen'}>
            <span>
              <Button
                small
                icon={<Icon icon={faCircleMinus} size={'lg'} />}
                disabled={rowCount <= 1}
                aria-label={'Zeile entfernen'}
                onClick={() => {
                  onUpdateModule({
                    ...contentModule,
                    content: {
                      ...contentModule.content,
                      rows: contentRows.filter((_row, i) => i < rowCount - 1),
                    },
                  });
                }}
              />
            </span>
          </Tooltip>
          <Tooltip label={'Zeile hinzufügen'}>
            <Button
              small
              icon={<Icon icon={faCirclePlus} size={'lg'} />}
              aria-label={'Zeile hinzufügen'}
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
            />
          </Tooltip>
        </div>
        <Table ref={tableRef} className={styles.table}>
          <tbody>
            {range(rowCount).map((rowIndex) => {
              return (
                <tr key={`row-${rowIndex}`}>
                  {range(columnCount).map((columnIndex) => {
                    return (
                      <EditTableCell
                        key={`row-${rowIndex}-col-${columnIndex}`}
                        position={{
                          row: rowIndex,
                          column: columnIndex,
                        }}
                        cell={contentRows[rowIndex][columnIndex]}
                        onKeyDown={onCellKeyDown}
                        onPaste={onCellPaste}
                        onChange={(updatedCell) => {
                          onUpdateModule({
                            ...contentModule,
                            content: {
                              rows: contentRows.map((row, rowI) =>
                                row.map((cell, columnI) =>
                                  rowI === rowIndex && columnI === columnIndex
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
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    );
  }
);
Edit.displayName = 'TableEdit';
