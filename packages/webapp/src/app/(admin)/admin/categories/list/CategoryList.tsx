'use client';

import * as React from 'react';
import { Icon } from 'shared/Icon';
import { faAngleRight, faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { CategoryModel } from 'model';
import {
  Button,
  NoSsr,
  SplitView,
  SplitViewButton,
  SplitViewContent,
  SplitViewNavigation,
  Toolbar,
} from '@lotta-schule/hubert';
import {
  CategoryEditor,
  CreateCategoryDialog,
  CategoryNavigation,
} from './component';

import styles from './CategoryList.module.scss';

export const CategoryList = React.memo(() => {
  const [selectedCategory, setSelectedCategory] =
    React.useState<CategoryModel | null>(null);
  const [isCreateCategoryDialogOpen, setIsCreateCategoryDialogOpen] =
    React.useState(false);

  return (
    <div className={styles.root}>
      <SplitView closeCondition={() => !!selectedCategory}>
        <SplitViewNavigation>
          <Toolbar hasScrollableParent>
            <Button
              className={styles.button}
              onClick={() => setIsCreateCategoryDialogOpen(true)}
              icon={<Icon icon={faCirclePlus} />}
            >
              Kategorie erstellen
            </Button>
            <SplitViewButton
              action={'close'}
              style={{ marginLeft: 'auto' }}
              aria-label={'Seitenleiste einklappen'}
              icon={<Icon icon={faAngleRight} size={'lg'} />}
            />
          </Toolbar>
          <NoSsr>
            <CategoryNavigation
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </NoSsr>
        </SplitViewNavigation>
        <SplitViewContent>
          {selectedCategory && (
            <CategoryEditor
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          )}
        </SplitViewContent>
      </SplitView>

      <CreateCategoryDialog
        isOpen={isCreateCategoryDialogOpen}
        onAbort={() => setIsCreateCategoryDialogOpen(false)}
        onConfirm={(category) => {
          setIsCreateCategoryDialogOpen(false);
          setSelectedCategory(category);
        }}
      />
    </div>
  );
});
CategoryList.displayName = 'AdminCategoryList';
