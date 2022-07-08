import * as React from 'react';
import { Table } from '@lotta-schule/hubert';
import { range } from 'lodash';
import { ContentModuleModel } from 'model';
import { TableContent, TableConfiguration } from './Table';

interface ShowProps {
    contentModule: ContentModuleModel<TableContent, TableConfiguration>;
}

export const Show = React.memo<ShowProps>(({ contentModule }) => {
    const rowCount = React.useMemo(
        () => contentModule.content?.rows?.length ?? 1,
        [contentModule.content]
    );
    const columnCount = React.useMemo(
        () =>
            Math.max(
                ...(contentModule.content?.rows?.map((row) => row?.length) ?? [
                    1,
                ])
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

    return (
        <Table>
            <tbody>
                {range(rowCount).map((rowIndex) => (
                    <tr key={`row-${rowIndex}`}>
                        {range(columnCount).map((columnIndex) => (
                            <td key={`row-${rowIndex}-col-${columnIndex}`}>
                                {contentRows[rowIndex][columnIndex].text}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </Table>
    );
});
Show.displayName = 'TableShow';
