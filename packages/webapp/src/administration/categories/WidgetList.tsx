import * as React from 'react';
import { Icon } from 'shared/Icon';
import { faAngleLeft, faCirclePlus } from '@fortawesome/free-solid-svg-icons';
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
} from '@lotta-schule/hubert';
import { WidgetModel, WidgetModelType } from 'model';
import { Widget } from 'util/model';
import { WidgetNavigation } from './widgets/WidgetNavigation';
import { WidgetEditor } from './widgets/WidgetEditor';

import GetWidgetsQuery from 'api/query/GetWidgetsQuery.graphql';
import CreateWidgetMutation from 'api/mutation/CreateWidgetMutation.graphql';

export const WidgetList = React.memo(() => {
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

  const onClickCreateWidget = (title: string, type: WidgetModelType) => {
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
    });
  };

  if (isLoading) {
    return <LinearProgress />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  return (
    <SplitView closeCondition={() => !!selectedWidget}>
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
                    WidgetModelType.Calendar
                  );
                case 'schedule':
                  return onClickCreateWidget('VPlan', WidgetModelType.Schedule);
                case 'iframe':
                  return onClickCreateWidget('IFrame', WidgetModelType.IFrame);
              }
            }}
          >
            <Item key={'calendar'} textValue={'Kalender-Marginale erstellen'}>
              {Widget.getIconForType(WidgetModelType.Calendar)}
              <span>Kalender-Marginale erstellen</span>
            </Item>
            <Item key={'schedule'} textValue={'VPlan-Marginale erstellen'}>
              {Widget.getIconForType(WidgetModelType.Schedule)}
              <span>VPlan-Marginale erstellen</span>
            </Item>
            <Item key={'iframe'} textValue={'IFrame-Marginale erstellen'}>
              {Widget.getIconForType(WidgetModelType.IFrame)}
              <span>IFrame-Marginale erstellen</span>
            </Item>
          </MenuButton>
          <SplitViewButton
            action={'close'}
            style={{ marginLeft: 'auto' }}
            icon={<Icon icon={faAngleLeft} />}
          />
        </Toolbar>
        <WidgetNavigation
          widgets={data!.widgets}
          selectedWidget={selectedWidget}
          onSelectWidget={setSelectedWidget}
        />
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
    </SplitView>
  );
});
WidgetList.displayName = 'AdministrationWidgetList';
