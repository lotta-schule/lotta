import * as React from 'react';
import { Icon } from 'shared/Icon';
import { faCircleUser } from '@fortawesome/free-solid-svg-icons';
import { AdminPage } from 'administration/AdminPage';
import { UserList } from 'administration/users/UserList';

const ListRoute = () => {
  return (
    <AdminPage
      title={
        <>
          <Icon icon={faCircleUser} /> Nutzer
        </>
      }
      hasHomeLink
      component={UserList}
    />
  );
};

export default ListRoute;
