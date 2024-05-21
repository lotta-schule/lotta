import * as React from 'react';
import { Icon } from 'shared/Icon';
import { faShapes } from '@fortawesome/free-solid-svg-icons';
import { AdminPage } from 'administration/AdminPage';
import { CategoryList } from 'administration/categories/CategoryList';

const CategoryListRoute = () => {
  return (
    <AdminPage
      title={
        <>
          <Icon icon={faShapes} size={'lg'} /> Kategorien
        </>
      }
      component={CategoryList}
      hasHomeLink
    />
  );
};

export default CategoryListRoute;
