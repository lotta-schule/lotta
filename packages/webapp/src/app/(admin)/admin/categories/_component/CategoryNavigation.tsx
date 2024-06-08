'use client';

import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation } from '@apollo/client';
import { Collapse, DraggableListItem } from '@lotta-schule/hubert';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
  ResponderProvided,
} from 'react-beautiful-dnd';
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

  const onDragEnd = (
    { destination, source, draggableId }: DropResult,
    _provided: ResponderProvided
  ) => {
    if (!destination) {
      return;
    }

    if (destination.droppableId !== source.droppableId) {
      return;
    }

    const initialCategoriesArray =
      destination.droppableId === 'categories-root'
        ? mainCategories
        : getSubcategoriesForCategory({
            id: destination.droppableId,
          });
    const sourceIndex = initialCategoriesArray.findIndex(
      (category) => category.id === draggableId
    );
    const newCategoriesArray = [...initialCategoriesArray];
    newCategoriesArray.splice(sourceIndex, 1);
    newCategoriesArray.splice(
      destination.index,
      0,
      initialCategoriesArray[sourceIndex]
    );
    newCategoriesArray.forEach((category, index) => {
      if (category) {
        const sortKey = index * 10 + 10;
        updateCategory({
          variables: {
            id: category.id,
            category: {
              sortKey,
            },
          },
          optimisticResponse: {
            __typename: 'Mutation',
            category: {
              __typename: 'Category',
              ...category,
              sortKey,
              widgets: null,
            },
          } as any,
        });
      }
    });
  };

  useEffect(() => {
    if (selectedCategory) {
      if (selectedCategory.category?.id) {
        setExpandedMainCategoryId(selectedCategory.category.id);
      } else {
        setExpandedMainCategoryId(selectedCategory.id);
      }
    }
  }, [selectedCategory]);

  const onSelectCategory = useCallback(
    (category: CategoryModel) => {
      if (category.id !== selectedCategory?.id) {
        router.push(`/admin/categories/list/${category.id}`);
      }
    },
    [router]
  );

  return (
    <div className={styles.root}>
      {homepageCategory && (
        <DraggableListItem
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
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable
          droppableId={'categories-root'}
          type={'main-categories'}
          mode="standard"
          direction="vertical"
          isDropDisabled={false}
          isCombineEnabled={false}
          ignoreContainerClipping={false}
        >
          {({ droppableProps, innerRef, placeholder }) => (
            <div {...droppableProps} ref={innerRef}>
              {mainCategories.map((category, index) => (
                <Draggable
                  key={category.id}
                  draggableId={String(category.id)}
                  index={index}
                  disableInteractiveElementBlocking
                >
                  {(provided) => (
                    <div {...provided.draggableProps} ref={provided.innerRef}>
                      <DraggableListItem
                        data-testid={'main-category-item'}
                        onClick={() => {
                          onSelectCategory(category);
                          setExpandedMainCategoryId((categoryId) =>
                            categoryId === category.id ? null : categoryId
                          );
                        }}
                        icon={
                          getSubcategoriesForCategory(category).length > 0 && (
                            <Icon
                              title="Unterkategorien anzeigen"
                              role={'button'}
                              icon={
                                expandedMainCategoryId === category.id
                                  ? faCaretDown
                                  : faCaretUp
                              }
                            />
                          )
                        }
                        onClickIcon={(e) => {
                          e.stopPropagation();
                          setExpandedMainCategoryId((categoryId) =>
                            categoryId === category.id ? null : category.id
                          );
                        }}
                        dragHandleProps={provided.dragHandleProps ?? undefined}
                        title={category.title}
                        selected={selectedCategory?.id === category.id}
                      />
                      <Collapse isOpen={expandedMainCategoryId === category.id}>
                        <Droppable
                          isDropDisabled={false}
                          isCombineEnabled={false}
                          ignoreContainerClipping={false}
                          droppableId={String(category.id)}
                          type={'subcategories'}
                        >
                          {({ droppableProps, innerRef, placeholder }) => (
                            <div
                              role="list"
                              className={styles.categoriesSublist}
                              ref={innerRef}
                              {...droppableProps}
                            >
                              {getSubcategoriesForCategory(category).map(
                                (subcategory, index) => (
                                  <Draggable
                                    key={subcategory.id}
                                    draggableId={String(subcategory.id)}
                                    index={index}
                                  >
                                    {({
                                      innerRef,
                                      dragHandleProps,
                                      draggableProps,
                                    }) => (
                                      <DraggableListItem
                                        key={subcategory.id}
                                        data-testid={'subcategory-item'}
                                        ref={innerRef}
                                        {...draggableProps}
                                        onClick={() => {
                                          onSelectCategory(subcategory);
                                        }}
                                        dragHandleProps={
                                          dragHandleProps ?? undefined
                                        }
                                        title={subcategory.title}
                                        selected={
                                          selectedCategory?.id ===
                                          subcategory.id
                                        }
                                      />
                                    )}
                                  </Draggable>
                                )
                              )}
                              {placeholder}
                            </div>
                          )}
                        </Droppable>
                      </Collapse>
                    </div>
                  )}
                </Draggable>
              ))}
              {placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <h5 className={styles.heading}>Randnavigation</h5>
      {sidenavCategories.map((category) => (
        <DraggableListItem
          data-testid={'sidenav-category-item'}
          key={category.id}
          title={category.title}
          className={styles.before}
          onClick={() => {
            onSelectCategory(category);
          }}
          selected={selectedCategory?.id === category.id}
        />
      ))}
    </div>
  );
});
CategoryNavigation.displayName = 'AdministrationCategoryNavigation';
