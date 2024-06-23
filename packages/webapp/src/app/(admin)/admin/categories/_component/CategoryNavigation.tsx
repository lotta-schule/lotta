'use client';

import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation } from '@apollo/client';
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

export const CategoryNavigation = memo(() => {
  const router = useRouter();
  const params = useParams();
  const [categories] = useCategories();

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === params?.categoryId),
    [categories, params]
  );

  const [expandedMainCategoryId, setExpandedMainCategoryId] =
    useState<ID | null>(null);
  const [expandedMainCategoryToRestore, setExpandedMainCategoryToRestore] =
    useState<ID | null>(null);

  const homepageCategory = useMemo(
    () => categories.find((category) => category.isHomepage),
    [categories]
  );
  const mainCategories = useMemo(
    () =>
      categories.filter(
        (category) =>
          !category.category && !category.isSidenav && !category.isHomepage
      ),
    [categories]
  );
  const sidenavCategories = useMemo(
    () => categories.filter((c) => c.isSidenav),
    [categories]
  );

  const getSubcategoriesForCategory = useCallback(
    (category: Partial<CategoryModel>) => {
      return categories.filter(
        (c) => c.category && c.category.id === category.id
      );
    },
    [categories]
  );

  const [updateCategory] = useMutation<
    { category: CategoryModel },
    { id: ID; category: any }
  >(UpdateCategoryMutation);

  useEffect(() => {
    if (selectedCategory) {
      if (selectedCategory.category?.id) {
        setExpandedMainCategoryId(selectedCategory.category.id);
      } else {
        setExpandedMainCategoryId(selectedCategory.id);
      }
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (expandedMainCategoryId) {
      setExpandedMainCategoryToRestore(null);
    }
  }, [expandedMainCategoryId]);

  const onSelectCategory = useCallback(
    (category: CategoryModel) => {
      if (category.id !== selectedCategory?.id) {
        router.push(`/admin/categories/${category.id}`);
      }
    },
    [router]
  );

  const onChangeCategories = useCallback((categories: SortableItem[]) => {
    const newCategories = categories.map((category, index) => ({
      id: category.id,
      sortKey: index * 10 + 10,
    }));

    newCategories.forEach((category) => {
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
            id: category.id,
            sortKey: category.sortKey,
            widgets: null,
          },
        } as any,
      });
    });
  }, []);

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
        items={mainCategories.map((c) => ({
          id: c.id,
          title: c.title,
          icon:
            getSubcategoriesForCategory(c).length > 0 ? (
              <Icon
                title="Unterkategorien anzeigen"
                role={'button'}
                icon={expandedMainCategoryId === c.id ? faCaretUp : faCaretDown}
              />
            ) : undefined,
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
                onChange={() => {}}
              />
            </Collapse>
          ),
        }))}
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
