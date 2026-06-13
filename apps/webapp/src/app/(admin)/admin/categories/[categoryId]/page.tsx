import * as React from 'react';
import { loadCategories } from '#/loader/index.js';
import { notFound } from 'next/navigation.js';
import { AdminPageTitle } from '../../_component/AdminPageTitle.js';
import { CategoryEditor } from '../_component/index.js';

async function GroupPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = await params;
  const categories = await loadCategories();

  const category = categories.find((category) => category.id === categoryId);

  if (!category) {
    return notFound();
  }

  return (
    <div>
      <AdminPageTitle backUrl={'/admin/categories'}>
        {category.title}
      </AdminPageTitle>
      <CategoryEditor category={category} />
    </div>
  );
}

export default GroupPage;
