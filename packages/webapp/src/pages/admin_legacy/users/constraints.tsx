import * as React from 'react';
import { Icon } from 'shared/Icon';
import { faExpand } from '@fortawesome/free-solid-svg-icons';
import { AdminPage } from 'administration/AdminPage';
import { ConstraintList } from 'administration/users/ConstraintsList';

const ConstraintsRoute = () => {
  return (
    <AdminPage
      title={
        <>
          <Icon icon={faExpand} /> Beschränkungen
        </>
      }
      component={ConstraintList}
      hasHomeLink
    />
  );
};

export default ConstraintsRoute;
