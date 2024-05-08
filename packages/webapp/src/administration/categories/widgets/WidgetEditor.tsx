import * as React from 'react';
import { useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { ID, UserGroupModel, WidgetModel, WidgetModelType } from 'model';
import {
  Button,
  Divider,
  ErrorMessage,
  Input,
  Label,
  SplitViewButton,
  Toolbar,
} from '@lotta-schule/hubert';
import {
  faAngleRight,
  faFloppyDisk,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { Icon } from 'shared/Icon';
import { GroupSelect } from 'shared/edit/GroupSelect';
import { IFrameWidgetConfiguration } from './configuration/IFrameWidgetConfiguration';
import { CalendarWidgetConfiguration } from './configuration/CalendarWidgetConfiguration';
import { ScheduleWidgetConfiguration } from './configuration/ScheduleWidgetConfiguration';
import { DeleteWidgetDialog } from './DeleteWidgetDialog';
import { WidgetIconSelection } from './WidgetIconSelection';

import UpdateWidgetMutation from 'api/mutation/UpdateWidgetMutation.graphql';

import styles from './WidgetEditor.module.scss';

export interface WidgetEditorProps {
  selectedWidget: WidgetModel | null;
  onSelectWidget(widget: WidgetModel | null): void;
}

export const WidgetEditor = React.memo<WidgetEditorProps>(
  ({ selectedWidget, onSelectWidget }) => {
    const { t } = useTranslation();
    const [widget, setWidget] = React.useState<WidgetModel | null>(null);
    const [isDeleteWidgetDialogOpen, setIsDeleteWidgetDialogOpen] =
      React.useState(false);

    const [mutateWidget, { loading: isLoading, error }] = useMutation<
      { widget: WidgetModel },
      { id: ID; widget: any }
    >(UpdateWidgetMutation);

    const updateWidget = React.useCallback(async () => {
      if (!selectedWidget || !widget) {
        return null;
      }
      mutateWidget({
        variables: {
          id: selectedWidget.id,
          widget: {
            title: widget.title,
            groups: widget.groups?.map(({ id }) => ({ id })),
            iconImageFile: widget.iconImageFile && {
              id: widget.iconImageFile.id,
            },
            configuration: JSON.stringify(widget.configuration),
          },
        },
      });
    }, [selectedWidget, widget, mutateWidget]);

    React.useEffect(() => {
      if (selectedWidget === null && widget !== null) {
        setWidget(null);
      } else if (selectedWidget) {
        if (!widget || widget.id !== selectedWidget.id) {
          setWidget({ ...selectedWidget });
        }
      }
    }, [widget, selectedWidget]);

    if (!widget) {
      return null;
    }

    return (
      <div data-testid="WidgetEditor" className={styles.root}>
        <Toolbar hasScrollableParent className={styles.toolbar}>
          <SplitViewButton
            action={'open'}
            icon={<Icon icon={faAngleRight} />}
          />
          <h5>{selectedWidget ? selectedWidget.title : widget.title}</h5>
          <span className={styles.widgetType}>
            {t(`widgets.widgetTypes.${widget.type}`)}
          </span>
        </Toolbar>
        <ErrorMessage error={error} />
        <Label label="Name des Widget">
          <Input
            value={widget.title}
            onChange={(e) =>
              setWidget({
                ...widget,
                title: e.currentTarget.value,
              })
            }
          />
        </Label>

        <Divider />

        <WidgetIconSelection
          icon={widget.configuration?.icon ?? {}}
          onSelectIcon={(icon) =>
            setWidget({
              ...widget,
              configuration: {
                ...(widget.configuration as any),
                icon,
              },
            })
          }
        />

        <Divider />

        <GroupSelect
          selectedGroups={widget.groups || []}
          disableAdminGroupsExclusivity
          onSelectGroups={(groups: UserGroupModel[]) => {
            setWidget({ ...widget, groups });
          }}
        />

        {widget.type === WidgetModelType.Calendar && (
          <CalendarWidgetConfiguration
            configuration={widget.configuration || {}}
            setConfiguration={(configuration) =>
              setWidget({
                ...widget,
                configuration: {
                  ...widget.configuration,
                  ...configuration,
                },
              })
            }
          />
        )}
        {widget.type === WidgetModelType.Schedule && (
          <ScheduleWidgetConfiguration
            configuration={widget.configuration || {}}
            setConfiguration={(configuration) =>
              setWidget({
                ...widget,
                configuration: {
                  ...widget.configuration,
                  ...configuration,
                },
              })
            }
          />
        )}
        {widget.type === WidgetModelType.IFrame && (
          <IFrameWidgetConfiguration
            configuration={widget.configuration || {}}
            setConfiguration={(configuration) =>
              setWidget({
                ...widget,
                configuration: {
                  ...widget.configuration,
                  ...configuration,
                },
              })
            }
          />
        )}
        <Divider className={styles.footerDevider} />
        <div className={styles.footer}>
          <Button
            style={{ float: 'right' }}
            disabled={isLoading}
            className={styles.button}
            onClick={() => updateWidget()}
            icon={<Icon icon={faFloppyDisk} />}
          >
            Marginale speichern
          </Button>

          <Button
            variant={'error'}
            icon={<Icon icon={faTrash} />}
            className={styles.button}
            onClick={() => setIsDeleteWidgetDialogOpen(true)}
          >
            Marginale löschen
          </Button>

          <DeleteWidgetDialog
            isOpen={isDeleteWidgetDialogOpen}
            widget={widget}
            onRequestClose={() => setIsDeleteWidgetDialogOpen(false)}
            onConfirm={() => {
              setIsDeleteWidgetDialogOpen(false);
              onSelectWidget(null);
            }}
          />
        </div>
      </div>
    );
  }
);
WidgetEditor.displayName = 'WidgetEditor';
