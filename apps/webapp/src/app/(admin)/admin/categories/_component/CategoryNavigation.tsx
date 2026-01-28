'use client';
import * as React from 'react';
import { useMutation } from '@apollo/client/react';
import {
  Collapse,
  DraggableListItem,
  SortableDraggableList,
  SortableItem,
} from '@lotta-schule/hubert';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import { ID, CategoryModel } from 'model';
import { useParams, useRouter } from 'next/navigation';
import { Icon } from 'shared/Icon';
import { useCategories } from 'util/categories/useCategories';

import styles from './CategoryNavigation.module.scss';

import UpdateCategoryMutation from 'api/mutation/UpdateCategoryMutation.graphql';

export const CategoryNavigation = React.memo(() => {
  const router = useRouter();
  const params = useParams();
  const [categories] = useCategories();

  const selectedCategory = React.useMemo(
    () => categories.find((category) => category.id === params?.categoryId),
    [categories, params]
  );

  const [expandedMainCategoryId, setExpandedMainCategoryId] =
    React.useState<ID | null>(null);
  const [expandedMainCategoryToRestore, setExpandedMainCategoryToRestore] =
    React.useState<ID | null>(null);

  const homepageCategory = React.useMemo(
    () => categories.find((category) => category.isHomepage),
    [categories]
  );
  const mainCategories = React.useMemo(
    () =>
      categories.filter(
        (category) =>
          !category.category && !category.isSidenav && !category.isHomepage
      ),
    [categories]
  );
  const sidenavCategories = React.useMemo(
    () => categories.filter((c) => c.isSidenav),
    [categories]
  );

  const getSubcategoriesForCategory = React.useCallback(
    (category: Partial<CategoryModel>) =>
      categories.filter((c) => c.category && c.category.id === category.id),
    [categories]
  );

  const [updateCategory] = useMutation<
    { category: CategoryModel },
    { id: ID; category: any }
  >(UpdateCategoryMutation);

  React.useEffect(() => {
    if (selectedCategory) {
      if (selectedCategory.category?.id) {
        setExpandedMainCategoryId(selectedCategory.category.id);
      } else {
        setExpandedMainCategoryId(selectedCategory.id);
      }
    }
  }, [selectedCategory]);

  React.useEffect(() => {
    if (expandedMainCategoryId) {
      setExpandedMainCategoryToRestore(null);
    }
  }, [expandedMainCategoryId]);

  const onSelectCategory = React.useCallback(
    (category: CategoryModel) => {
      if (category.id !== selectedCategory?.id) {
        router.push(`/admin/categories/${category.id}`);
      }
    },
    [router, selectedCategory?.id]
  );

  const onChangeCategories = React.useCallback(
    (updatedCategories: SortableItem[]) => {
      updatedCategories
        .map((category, index) => ({
          ...(categories.find((c) => c.id === category.id) ?? {
            id: category.id,
          }),
          sortKey: index * 10 + 10,
        }))
        .filter(
          (category) =>
            category.sortKey !==
            categories.find((c) => c.id === category.id)?.sortKey
        )
        .forEach((category) => {
          updateCategory({
            variables: {
              id: category.id,
              category: {
                sortKey: category.sortKey,
              },
            },
            optimisticResponse: {
              __typename: 'Mutation',
              category: {
                __typename: 'Category',
                ...category,
                id: category.id,
                sortKey: category.sortKey,
                widgets: null,
              },
            } as any,
          });
        });
    },
    [categories, updateCategory]
  );

  return (
    <div className={styles.root}>
      {homepageCategory && (
        <DraggableListItem
          id={homepageCategory.id}
          isDraggable={false}
          data-testid={'main-category-item'}
          title={homepageCategory.title}
          className={styles.before}
          selected={selectedCategory?.id === homepageCategory.id}
          onClick={() => {
            onSelectCategory(homepageCategory);
          }}
        />
      )}

      <h5>Hauptnavigation</h5>
      <SortableDraggableList
        id={'main-categories'}
        onChange={onChangeCategories}
        onDragStart={() => {
          setExpandedMainCategoryId(null);
          setExpandedMainCategoryToRestore(expandedMainCategoryId);
        }}
        onDragEnd={() => {
          setExpandedMainCategoryId(expandedMainCategoryToRestore);
        }}
        items={mainCategories.map((c) => {
          const subcategories = getSubcategoriesForCategory(c);
          return {
            id: c.id,
            title: c.title,
            icon:
              subcategories.length > 0 ? (
                <Icon
                  title="Unterkategorien anzeigen"
                  role={'button'}
                  icon={
                    expandedMainCategoryId === c.id ? faCaretUp : faCaretDown
                  }
                />
              ) : undefined,
            iconTitle: subcategories.length
              ? expandedMainCategoryId === c.id
                ? 'Unterkategorien ausblenden'
                : 'Unterkategorien anzeigen'
              : undefined,
            onClickIcon: (e) => {
              e.stopPropagation();
              setExpandedMainCategoryId((categoryId) =>
                categoryId === c.id ? null : c.id
              );
            },
            selected: selectedCategory?.id === c.id,
            onClick: () => onSelectCategory(c),
            testId: 'main-category-item',
            children: (
              <Collapse isOpen={expandedMainCategoryId === c.id}>
                <SortableDraggableList
                  id={`subcategories-for-c-${c.id}`}
                  className={styles.categoriesSublist}
                  items={getSubcategoriesForCategory(c).map((subcategory) => ({
                    id: subcategory.id,
                    title: subcategory.title,
                    onClick: () => onSelectCategory(subcategory),
                    selected: selectedCategory?.id === subcategory.id,
                  }))}
                  onChange={onChangeCategories}
                />
              </Collapse>
            ),
          };
        })}
      />

      <h5 className={styles.heading}>Randnavigation</h5>
      {sidenavCategories.map((category) => (
        <DraggableListItem
          id={category.id}
          data-testid={'sidenav-category-item'}
          key={category.id}
          title={category.title}
          className={styles.before}
          selected={selectedCategory?.id === category.id}
          isDraggable={false}
          onClick={() => {
            onSelectCategory(category);
          }}
        />
      ))}
    </div>
  );
});
CategoryNavigation.displayName = 'AdministrationCategoryNavigation';
