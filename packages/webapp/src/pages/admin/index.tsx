import * as React from 'react';
import { AdminPage } from 'administration/AdminPage';
import { Navigation } from 'administration/Navigation';

const AdminRoute = () => {
  return <AdminPage title={'Start'} component={Navigation} />;
};

export default AdminRoute;
