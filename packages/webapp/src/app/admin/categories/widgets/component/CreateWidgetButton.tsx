'use client';

import * as React from 'react';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { MenuButton, Item } from '@lotta-schule/hubert';
import { useMutation } from '@apollo/client';
import { WidgetModel, WidgetModelType } from 'model';
import { Widget } from 'util/model';
import { Icon } from 'shared/Icon';

import CreateWidgetMutation from 'api/mutation/CreateWidgetMutation.graphql';

export type CreateWidgetButtonProps = {
  onComplete?: (widget: WidgetModel) => void;
};

export const CreateWidgetButton = React.memo(
  ({ onComplete }: CreateWidgetButtonProps) => {
    const [createWidget, { loading: isLoading }] = useMutation<
      { widget: WidgetModel },
      { title: string; type: WidgetModelType }
    >(CreateWidgetMutation, {
      onCompleted: ({ widget }) => {
        onComplete?.(widget);
      },
    });

    const onClickCreateWidget = (title: string, type: WidgetModelType) => {
      createWidget({
        variables: {
          title,
          type,
        },
      });
    };

    return (
      <MenuButton
        title={'Marginale erstellen'}
        buttonProps={{
          disabled: isLoading,
          icon: <Icon icon={faCirclePlus} />,
          label: 'neue Marginale',
        }}
        onAction={(key) => {
          switch (key) {
            case 'calendar':
              return onClickCreateWidget('Kalender', WidgetModelType.Calendar);
            case 'schedule':
              return onClickCreateWidget('VPlan', WidgetModelType.Schedule);
            case 'iframe':
              return onClickCreateWidget('Webseite', WidgetModelType.IFrame);
          }
        }}
      >
        <Item key={'calendar'} textValue={'Kalender-Marginale erstellen'}>
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
    );
  }
);
CreateWidgetButton.displayName = 'CreateWidgetButton';
