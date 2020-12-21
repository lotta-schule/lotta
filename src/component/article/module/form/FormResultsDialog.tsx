import React, { memo, useMemo, useCallback } from 'react';
import { ContentModuleModel, ID, ContentModuleResultModel } from 'model';
import { ResponsiveFullScreenDialog } from 'component/dialog/ResponsiveFullScreenDialog';
import { DialogTitle, DialogContent, Button, Typography, LinearProgress } from '@material-ui/core';
import { useQuery } from '@apollo/client';
import { GetContentModuleResults } from 'api/query/GetContentModuleResults';
import { FormConfiguration } from './Form';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { saveAs } from 'file-saver';

export interface FormResultsDialogProps {
    isOpen: boolean;
    onRequestClose(): void;
    contentModule: ContentModuleModel<{}, FormConfiguration>;
}

export const FormResultsDialog = memo<FormResultsDialogProps>(({ isOpen, onRequestClose, contentModule }) => {
    const { data, loading: isLoading, error } = useQuery<{ contentModuleResults: ContentModuleResultModel[] }, { contentModuleId: ID }>(
        GetContentModuleResults,
        {
            variables: { contentModuleId: contentModule.id }
        },
    );
    const downloadCsv = useCallback(() => {
        const replacer = (_key: string, value: unknown) => value === null ? '' : value;
        const header = data?.contentModuleResults.reduce((acc: string[], contentModuleResult) => (
            [...acc, ...Object.keys(contentModuleResult.result.responses).filter(key => acc.indexOf(key) < 0)]
        ), []) ?? [];
        const rows = [
            ['Datum', ...header].map(key => JSON.stringify(key)).join(','),
            ...(data?.contentModuleResults.map(result =>
                [
                    JSON.stringify(format(new Date(result.insertedAt), 'Pp', { locale: de })),
                    ...header.map(key => (
                        JSON.stringify(String(result.result.responses[key]), replacer)
                    ))
                ].join(',')
            )) ?? []
        ];
        const csv = new Blob([rows.join('\r\n')], { type: 'text/csv;charset=utf-8' });
        saveAs(csv, 'formulardaten.csv');
    }, [data]);
    const content = useMemo(() => {
        if (isLoading) {
            return (
                <LinearProgress />
            );
        }
        if (error) {
            return (
                <ErrorMessage error={error} />
            );
        }
        return (
            <div>
                <Typography variant={'body1'} component={'section'}>
                    {data?.contentModuleResults.length ?? 0} gespeicherte Einsendungen
                </Typography>
                <section>
                    <Button fullWidth onClick={() => downloadCsv()}>Einsendungen als CSV herunterladen</Button>
                </section>
            </div>
        );
    }, [data, downloadCsv, error, isLoading]);
    return (
        <ResponsiveFullScreenDialog open={isOpen} onClose={() => onRequestClose()} fullWidth>
            <DialogTitle>Formulardaten</DialogTitle>
            <DialogContent>
                {content}
            </DialogContent>
        </ResponsiveFullScreenDialog>
    )
});
