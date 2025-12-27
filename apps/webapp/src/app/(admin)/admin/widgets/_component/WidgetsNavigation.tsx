'use client';

import { useSuspenseQuery } from '@apollo/client/react';
import { List, ListItem, ListItemSecondaryText } from '@lotta-schule/hubert';
import { useParams, useRouter } from 'next/navigation';
import { t } from 'i18next';
import { WidgetModel } from 'model';
import { WidgetIcon } from 'category/widgets/WidgetIcon';

import GetWidgetsQuery from 'api/query/GetWidgetsQuery.graphql';

export const WidgetsNavigation = () => {
  const router = useRouter();
  const params = useParams();

  const selectedWidgetId = params?.widgetId ?? null;

  const { data } = useSuspenseQuery<{
    widgets: WidgetModel[];
  }>(GetWidgetsQuery);

  const widgets = data?.widgets ?? [];

  return (
    <List title={'Alle Marginalen'}>
      {widgets.map((widget) => (
        <ListItem
          key={widget.id}
          leftSection={
            <WidgetIcon icon={widget.configuration?.icon} size={36} />
          }
          title={widget.title}
          isSelected={selectedWidgetId === widget.id}
          onClick={() => {
            router.push(`/admin/widgets/${widget.id}`);
          }}
        >
          {widget.title}
          <ListItemSecondaryText>
            {t(widget.type)}
            {/*t('CALENDAR')*/}
            {/*t('SCHEDULE')*/}
            {/*t('IFRAME')*/}
          </ListItemSecondaryText>
        </ListItem>
      ))}
    </List>
  );
};
