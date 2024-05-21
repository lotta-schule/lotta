import * as React from 'react';
import { Icon } from 'shared/Icon';
import { faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { AdminPage } from 'administration/AdminPage';
import { GroupList } from 'administration/users/GroupList';

const GroupsRoute = () => {
  return (
    <AdminPage
      title={
        <>
          <Icon icon={faUserGroup} /> Gruppen
        </>
      }
      component={GroupList}
      hasHomeLink
    />
  );
};

export default GroupsRoute;
