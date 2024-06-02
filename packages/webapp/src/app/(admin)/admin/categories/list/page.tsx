import * as React from 'react';
import { CategoryList } from './CategoryList';
import { AdminPage } from 'app/(admin)/admin/_component/AdminPage';
import { faShapes } from '@fortawesome/free-solid-svg-icons';

async function CategoryListPage() {
  return (
    <AdminPage icon={faShapes} title={'Kategorien'} hasHomeLink>
      <CategoryList />
    </AdminPage>
  );
}

export default CategoryListPage;
