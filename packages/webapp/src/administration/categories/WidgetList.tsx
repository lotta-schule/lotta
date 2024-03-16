import * as React from 'react';
import { Icon } from 'shared/Icon';
import { faAngleLeft, faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@apollo/client';
import {
  ErrorMessage,
  LinearProgress,
  MenuButton,
  Item,
  SplitView,
  SplitViewNavigation,
  SplitViewContent,
  Toolbar,
  SplitViewButton,
  List,
  ListItem,
  ListItemSecondaryText,
} from '@lotta-schule/hubert';
import { WidgetIcon } from 'category/widgets/WidgetIcon';
import { WidgetModel, WidgetModelType } from 'model';
import { Widget } from 'util/model';
import { WidgetEditor } from './widgets/WidgetEditor';

import GetWidgetsQuery from 'api/query/GetWidgetsQuery.graphql';
import CreateWidgetMutation from 'api/mutation/CreateWidgetMutation.graphql';

export const WidgetList = React.memo(() => {
  const { t } = useTranslation();
  const [selectedWidget, setSelectedWidget] =
    React.useState<WidgetModel | null>(null);

  const {
    data,
    loading: isLoading,
    error,
  } = useQuery<{
    widgets: WidgetModel[];
  }>(GetWidgetsQuery);
  const [
    createWidget,
    { loading: isLoadingCreateWidget, error: errorCreateWidget },
  ] = useMutation<
    { widget: WidgetModel },
    { title: string; type: WidgetModelType }
  >(CreateWidgetMutation, {
    onCompleted: ({ widget }) => {
      setSelectedWidget(widget);
    },
  });

  const onClickCreateWidget = (
    title: string,
    type: WidgetModelType,
    cb: () => void = () => {}
  ) => {
    createWidget({
      variables: {
        title,
        type,
      },
      update: (cache, { data }) => {
        const { widgets } = cache.readQuery<{ widgets: WidgetModel[] }>({
          query: GetWidgetsQuery,
        }) || { widgets: [] };
        cache.writeQuery({
          query: GetWidgetsQuery,
          data: { widgets: widgets.concat([data!.widget]) },
        });
      },
      onCompleted: cb,
    });
  };

  if (isLoading) {
    return <LinearProgress aria-label={'Marginalen werden geladen'} />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  return (
    <SplitView closeCondition={() => !!selectedWidget}>
      {({ close: closeSidebar }) => (
        <>
          <SplitViewNavigation>
            <Toolbar hasScrollableParent>
              <MenuButton
                title={'Marginale erstellen'}
                buttonProps={{
                  disabled: isLoadingCreateWidget,
                  icon: <Icon icon={faCirclePlus} />,
                  label: 'neue Marginale',
                }}
                onAction={(key) => {
                  switch (key) {
                    case 'calendar':
                      return onClickCreateWidget(
                        'Kalender',
                        WidgetModelType.Calendar,
                        closeSidebar
                      );
                    case 'schedule':
                      return onClickCreateWidget(
                        'VPlan',
                        WidgetModelType.Schedule,
                        closeSidebar
                      );
                    case 'iframe':
                      return onClickCreateWidget(
                        'Webseite',
                        WidgetModelType.IFrame,
                        closeSidebar
                      );
                  }
                }}
              >
                <Item
                  key={'calendar'}
                  textValue={'Kalender-Marginale erstellen'}
                >
                  {Widget.getIconForType(WidgetModelType.Calendar)}
                  <span>Kalender-Marginale erstellen</span>
                </Item>
                <Item
                  key={'schedule'}
                  textValue={'Vertretungsplan-Marginale erstellen'}
                >
                  {Widget.getIconForType(WidgetModelType.Schedule)}
                  <span>Vertretungsplan-Marginale erstellen</span>
                </Item>
                <Item key={'iframe'} textValue={'Webseite-Marginale erstellen'}>
                  {Widget.getIconForType(WidgetModelType.IFrame)}
                  <span>Webseite-Marginale erstellen</span>
                </Item>
              </MenuButton>
              <SplitViewButton
                action={'close'}
                style={{ marginLeft: 'auto' }}
                icon={<Icon icon={faAngleLeft} />}
              />
            </Toolbar>
            <List title={'Alle Marginalen'}>
              {data?.widgets.map((widget) => (
                <ListItem
                  key={widget.id}
                  leftSection={
                    <WidgetIcon icon={widget.configuration?.icon} size={36} />
                  }
                  title={widget.title}
                  isSelected={selectedWidget?.id === widget.id}
                  onClick={() => {
                    setSelectedWidget(widget);
                    closeSidebar();
                  }}
                >
                  {widget.title}
                  <ListItemSecondaryText>
                    {t(`widgets.widgetTypes.${widget.type}`)}
                  </ListItemSecondaryText>
                </ListItem>
              )) ?? null}
            </List>
          </SplitViewNavigation>
          <SplitViewContent>
            <ErrorMessage error={errorCreateWidget} />
            {selectedWidget && (
              <WidgetEditor
                selectedWidget={selectedWidget}
                onSelectWidget={setSelectedWidget}
              />
            )}
          </SplitViewContent>
        </>
      )}
    </SplitView>
  );
});
WidgetList.displayName = 'AdministrationWidgetList';
