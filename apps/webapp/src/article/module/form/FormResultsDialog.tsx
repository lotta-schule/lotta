import * as React from 'react';
import { useQuery } from '@apollo/client/react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { saveAs } from 'file-saver';
import { ContentModuleModel, ID, ContentModuleResultModel } from 'model';
import {
  Button,
  Dialog,
  DialogContent,
  ErrorMessage,
  LinearProgress,
} from '@lotta-schule/hubert';
import { FormConfiguration } from './Form';

import GetContentModuleResults from 'api/query/GetContentModuleResults.graphql';

export interface FormResultsDialogProps {
  isOpen: boolean;
  onRequestClose(): void;
  contentModule: ContentModuleModel<Record<string, string>, FormConfiguration>;
}

export const FormResultsDialog = React.memo(
  ({ isOpen, onRequestClose, contentModule }: FormResultsDialogProps) => {
    const {
      data,
      loading: isLoading,
      error,
    } = useQuery<
      { contentModuleResults: ContentModuleResultModel[] },
      { contentModuleId: ID }
    >(GetContentModuleResults, {
      variables: { contentModuleId: contentModule.id },
    });
    const downloadCsv = React.useCallback(() => {
      const replacer = (_key: string, value: unknown) =>
        value === null ? '' : value;
      const header =
        data?.contentModuleResults.reduce(
          (acc: string[], contentModuleResult) => [
            ...acc,
            ...Object.keys(contentModuleResult.result.responses).filter(
              (key) => acc.indexOf(key) < 0
            ),
          ],
          []
        ) ?? [];
      const rows = [
        ['Datum', ...header].map((key) => JSON.stringify(key)).join(','),
        ...(data?.contentModuleResults.map((result) =>
          [
            JSON.stringify(
              format(new Date(result.insertedAt), 'Pp', {
                locale: de,
              })
            ),
            ...header.map((key) =>
              JSON.stringify(String(result.result.responses[key]), replacer)
            ),
          ].join(',')
        ) ?? []),
      ];
      const csv = new Blob([rows.join('\r\n')], {
        type: 'text/csv;charset=utf-8',
      });
      saveAs(csv, 'formulardaten.csv');
    }, [data]);
    const content = (() => {
      if (isLoading) {
        return (
          <LinearProgress
            isIndeterminate
            aria-label={'Ergebnisse werden geladen'}
          />
        );
      }
      if (error) {
        return <ErrorMessage error={error} />;
      }
      return (
        <div>
          <section>
            {data?.contentModuleResults.length ?? 0} gespeicherte Einsendungen
          </section>
          <section>
            <Button fullWidth onClick={() => downloadCsv()}>
              Einsendungen als CSV herunterladen
            </Button>
          </section>
        </div>
      );
    })();
    return (
      <Dialog
        open={isOpen}
        onRequestClose={() => onRequestClose()}
        title={'Formulardaten'}
      >
        <DialogContent>{content}</DialogContent>
      </Dialog>
    );
  }
);
FormResultsDialog.displayName = 'FormResultsDialog';
