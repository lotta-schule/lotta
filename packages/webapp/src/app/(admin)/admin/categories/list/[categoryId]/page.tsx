import * as React from 'react';
import { loadCategories } from 'loader';
import { notFound } from 'next/navigation';
import { AdminPageTitle } from '../../../_component/AdminPageTitle';
import { CategoryEditor } from '../component';

async function GroupPage({
  params: { categoryId },
}: {
  params: { categoryId: string };
}) {
  const categories = await loadCategories();

  const category = categories.find((category) => category.id === categoryId);

  if (!category) {
    return notFound();
  }

  return (
    <div>
      <AdminPageTitle backUrl={'/admin/categories/list'}>
        {category.title}
      </AdminPageTitle>
      <CategoryEditor category={category} />
    </div>
  );
}

export default GroupPage;
