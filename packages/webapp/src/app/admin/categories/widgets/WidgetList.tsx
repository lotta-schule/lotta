'use client';

import * as React from 'react';
import { Icon } from 'shared/Icon';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import {
  SplitView,
  SplitViewNavigation,
  SplitViewContent,
  Toolbar,
  SplitViewButton,
  List,
  ListItem,
  ListItemSecondaryText,
} from '@lotta-schule/hubert';
import { useRouter } from 'next/navigation';
import { WidgetIcon } from 'category/widgets/WidgetIcon';
import { WidgetModel } from 'model';
import { WidgetEditor } from './component';
import { CreateWidgetButton } from './component/CreateWidgetButton';

export type WidgetListProps = {
  widgets: WidgetModel[];
};

export const WidgetList = React.memo(({ widgets }: WidgetListProps) => {
  const router = useRouter();
  const { t } = useTranslation();
  const [selectedWidget, setSelectedWidget] =
    React.useState<WidgetModel | null>(null);

  return (
    <SplitView closeCondition={() => !!selectedWidget}>
      {({ close: closeSidebar }) => (
        <>
          <SplitViewNavigation>
            <Toolbar hasScrollableParent>
              <CreateWidgetButton
                onComplete={(widget) => {
                  router.refresh();
                  setSelectedWidget(widget);
                  closeSidebar({ force: true });
                }}
              />
              <SplitViewButton
                action={'close'}
                style={{ marginLeft: 'auto' }}
                icon={<Icon icon={faAngleLeft} />}
              />
            </Toolbar>
            <List title={'Alle Marginalen'}>
              {widgets.map((widget) => (
                <ListItem
                  key={widget.id}
                  leftSection={
                    <WidgetIcon icon={widget.configuration?.icon} size={36} />
                  }
                  title={widget.title}
                  isSelected={selectedWidget?.id === widget.id}
                  onClick={() => {
                    setSelectedWidget(widget);
                    closeSidebar({ force: true });
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
