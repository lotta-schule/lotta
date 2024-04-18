import * as React from 'react';
import { Icon } from 'shared/Icon';
import { faPalette } from '@fortawesome/free-solid-svg-icons';
import { Presentation } from 'administration/system/Presentation';
import { AdminPage } from 'administration/AdminPage';

const PresentationRoute = () => {
  return (
    <AdminPage
      title={
        <>
          <Icon icon={faPalette} size={'lg'} /> Darstellung
        </>
      }
      component={Presentation}
      hasHomeLink
    />
  );
};

export default PresentationRoute;
