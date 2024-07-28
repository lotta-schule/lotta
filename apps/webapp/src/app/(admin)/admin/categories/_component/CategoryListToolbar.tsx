'use client';

import * as React from 'react';
import { Button, Toolbar } from '@lotta-schule/hubert';
import { Icon } from 'shared/Icon';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { CreateCategoryDialog } from './CreateCategoryDialog';
import { useRouter } from 'next/navigation';

export const CategoryListToolbar = () => {
  const router = useRouter();
  const [isCreateCategoryDialogOpen, setIsCreateCategoryDialogOpen] =
    React.useState(false);
  return (
    <Toolbar hasScrollableParent withPadding>
      <Button
        style={{ marginLeft: 'auto' }}
        onClick={() => setIsCreateCategoryDialogOpen(true)}
        icon={<Icon icon={faCirclePlus} />}
      >
        Kategorie erstellen
      </Button>
      <CreateCategoryDialog
        isOpen={isCreateCategoryDialogOpen}
        onAbort={() => setIsCreateCategoryDialogOpen(false)}
        onConfirm={(category) => {
          setIsCreateCategoryDialogOpen(false);
          router.push(`/admin/categories/${category.id}`);
        }}
      />
    </Toolbar>
  );
};
