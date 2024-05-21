import * as React from 'react';
import { Icon } from 'shared/Icon';
import { faSquareCaretRight } from '@fortawesome/free-solid-svg-icons';
import { AdminPage } from 'administration/AdminPage';
import { WidgetList } from 'administration/categories/WidgetList';

const WidgetsRoute = () => {
  return (
    <AdminPage
      title={
        <>
          <Icon icon={faSquareCaretRight} /> Marginalen
        </>
      }
      component={WidgetList}
      hasHomeLink
    />
  );
};

export default WidgetsRoute;
