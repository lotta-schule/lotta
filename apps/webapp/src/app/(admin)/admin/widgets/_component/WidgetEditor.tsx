'use client';
import * as React from 'react';
import { useMutation } from '@apollo/client/react';
import { ID, UserGroupModel, WidgetModel, WidgetModelType } from 'model';
import {
  Button,
  ErrorMessage,
  Input,
  Label,
  LinearProgress,
  LoadingButton,
} from '@lotta-schule/hubert';
import { faFloppyDisk, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Icon } from 'shared/Icon';
import { GroupSelect } from 'shared/edit/GroupSelect';
import { IFrameWidgetConfiguration } from './configuration/IFrameWidgetConfiguration';
import { CalendarWidgetConfiguration } from './configuration/CalendarWidgetConfiguration';
import { ScheduleWidgetConfiguration } from './configuration/ScheduleWidgetConfiguration';
import { AdminPageSection } from 'app/(admin)/admin/_component/AdminPageSection';
import { useRouter } from 'next/navigation';
import { DeleteWidgetDialog } from './DeleteWidgetDialog';
import { WidgetIconSelection } from './WidgetIconSelection';

import UpdateWidgetMutation from 'api/mutation/UpdateWidgetMutation.graphql';

export interface WidgetEditorProps {
  widget: WidgetModel;
}

export const WidgetEditor = React.memo(({ widget }: WidgetEditorProps) => {
  const router = useRouter();
  const [widgetConfig, setWidgetConfig] = React.useState(widget);

  const [isDeleteWidgetDialogOpen, setIsDeleteWidgetDialogOpen] =
    React.useState(false);

  const [mutateWidget, { error }] = useMutation<
    { widget: WidgetModel },
    { id: ID; widget: any }
  >(UpdateWidgetMutation);

  const updateWidget = React.useCallback(async () => {
    await mutateWidget({
      variables: {
        id: widget.id,
        widget: {
          title: widgetConfig.title,
          groups: widgetConfig.groups?.map(({ id }) => ({ id })),
          iconImageFile: widgetConfig.iconImageFile && {
            id: widgetConfig.iconImageFile.id,
          },
          configuration: JSON.stringify(widgetConfig.configuration),
        },
      },
    });
  }, [widget, widgetConfig, mutateWidget]);

  return (
    <div data-testid="WidgetEditor">
      <ErrorMessage error={error} />

      <AdminPageSection title="Darstellung">
        <Label label="Name des Widget">
          <Input
            value={widgetConfig.title}
            onChange={(e) =>
              setWidgetConfig({
                ...widgetConfig,
                title: e.currentTarget.value,
              })
            }
          />
        </Label>

        <WidgetIconSelection
          icon={widgetConfig.configuration?.icon ?? {}}
          onSelectIcon={(icon) =>
            setWidgetConfig({
              ...widgetConfig,
              configuration: {
                ...(widgetConfig.configuration as any),
                icon,
              },
            })
          }
        />
      </AdminPageSection>

      <AdminPageSection title="Zugriff">
        <React.Suspense
          fallback={
            <LinearProgress
              isIndeterminate
              aria-label="Gruppen werden geladen ..."
            />
          }
        >
          <GroupSelect
            selectedGroups={widgetConfig.groups || []}
            disableAdminGroupsExclusivity
            onSelectGroups={(groups: UserGroupModel[]) => {
              setWidgetConfig({ ...widgetConfig, groups });
            }}
          />
        </React.Suspense>
      </AdminPageSection>

      <AdminPageSection title="Konfiguration">
        {widgetConfig.type === WidgetModelType.Calendar && (
          <CalendarWidgetConfiguration
            configuration={widgetConfig.configuration || {}}
            setConfiguration={(configuration) =>
              setWidgetConfig({
                ...widgetConfig,
                configuration: {
                  ...widgetConfig.configuration,
                  ...configuration,
                },
              })
            }
          />
        )}
        {widgetConfig.type === WidgetModelType.Schedule && (
          <ScheduleWidgetConfiguration
            configuration={widgetConfig.configuration || {}}
            setConfiguration={(configuration) =>
              setWidgetConfig({
                ...widgetConfig,
                configuration: {
                  ...widgetConfig.configuration,
                  ...configuration,
                },
              })
            }
          />
        )}
        {widgetConfig.type === WidgetModelType.IFrame && (
          <IFrameWidgetConfiguration
            configuration={widgetConfig.configuration || {}}
            setConfiguration={(configuration) =>
              setWidgetConfig({
                ...widgetConfig,
                configuration: {
                  ...widgetConfig.configuration,
                  ...configuration,
                },
              })
            }
          />
        )}
      </AdminPageSection>

      <AdminPageSection bottomToolbar>
        <Button
          variant={'error'}
          icon={<Icon icon={faTrash} />}
          onClick={() => setIsDeleteWidgetDialogOpen(true)}
        >
          Marginale löschen
        </Button>

        <LoadingButton
          onAction={async () => {
            await updateWidget();
          }}
          icon={<Icon icon={faFloppyDisk} />}
        >
          Marginale speichern
        </LoadingButton>

        <DeleteWidgetDialog
          isOpen={isDeleteWidgetDialogOpen}
          widget={widget}
          onRequestClose={() => setIsDeleteWidgetDialogOpen(false)}
          onConfirm={() => {
            setIsDeleteWidgetDialogOpen(false);
            router.replace('/admin/widgets');
          }}
        />
      </AdminPageSection>
    </div>
  );
});
WidgetEditor.displayName = 'WidgetEditor';
