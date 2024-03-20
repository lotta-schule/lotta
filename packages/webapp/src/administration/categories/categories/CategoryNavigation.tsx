import * as React from 'react';
import { useMutation } from '@apollo/client';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
  ResponderProvided,
} from 'react-beautiful-dnd';
import { motion } from 'framer-motion';
import { useSplitView } from '@lotta-schule/hubert';
import { ID, CategoryModel } from 'model';
import { useCategories } from 'util/categories/useCategories';
import { CategoryNavigationItem } from './CategoryNavigationItem';

import styles from './CategoryNavigation.module.scss';

import UpdateCategoryMutation from 'api/mutation/UpdateCategoryMutation.graphql';

export interface CategoryNavigationProps {
  selectedCategory: CategoryModel | null;
  onSelectCategory(categoryModel: CategoryModel): void;
}

export const CategoryNavigation = React.memo(
  ({ selectedCategory, onSelectCategory }: CategoryNavigationProps) => {
    const [categories] = useCategories();
    const { close: closeSidebar } = useSplitView();

    const [expandedMainCategoryId, setExpandedMainCategoryId] =
      React.useState<ID | null>(null);

    const homepageCategory = (categories || []).find(
      (category) => category.isHomepage
    );
    const mainCategories = React.useMemo(
      () =>
        categories.filter(
          (category) =>
            !category.category && !category.isSidenav && !category.isHomepage
        ),
      [categories]
    );
    const sidenavCategories = categories.filter((c) => c.isSidenav);

    const getSubcategoriesForCategory = React.useCallback(
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

    React.useEffect(() => {
      if (selectedCategory) {
        if (selectedCategory.category?.id) {
          setExpandedMainCategoryId(selectedCategory.category.id);
        } else {
          setExpandedMainCategoryId(selectedCategory.id);
        }
      }
    }, [selectedCategory]);

    const subtitleListMotionProps = (isExpanded: boolean) => ({
      variants: {
        open: { opacity: 1, height: 'auto' },
        closed: { opacity: 0, height: 0 },
      },
      initial: 'closed',
      animate: isExpanded ? 'open' : 'closed',
    });

    return (
      <div className={styles.root}>
        <h4 className={styles.heading}>Alle Kategorien</h4>

        {homepageCategory && (
          <CategoryNavigationItem
            data-testid={'main-category-item'}
            title={homepageCategory.title}
            className={styles.before}
            onClick={() => {
              onSelectCategory(homepageCategory);
              closeSidebar({ force: true });
            }}
          />
        )}

        <h6>Hauptnavigation</h6>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId={'categories-root'} type={'main-categories'}>
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
                        <CategoryNavigationItem
                          data-testid={'main-category-item'}
                          onClick={(_e) => {
                            onSelectCategory(category);
                            closeSidebar({ force: true });
                            setExpandedMainCategoryId((categoryId) =>
                              categoryId === category.id ? null : categoryId
                            );
                          }}
                          dragHandleProps={
                            provided.dragHandleProps ?? undefined
                          }
                          title={category.title}
                        />
                        <Droppable
                          droppableId={String(category.id)}
                          type={'subcategories'}
                        >
                          {({ droppableProps, innerRef, placeholder }) => (
                            <motion.nav
                              ref={innerRef}
                              aria-expanded={
                                expandedMainCategoryId === category.id
                              }
                              {...droppableProps}
                              {...subtitleListMotionProps(
                                expandedMainCategoryId === category.id
                              )}
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
                                      <CategoryNavigationItem
                                        key={subcategory.id}
                                        data-testid={'subcategory-item'}
                                        ref={innerRef}
                                        {...draggableProps}
                                        onClick={(_e) => {
                                          closeSidebar({ force: true });
                                          onSelectCategory(subcategory);
                                        }}
                                        dragHandleProps={
                                          dragHandleProps ?? undefined
                                        }
                                        title={subcategory.title}
                                      />
                                    )}
                                  </Draggable>
                                )
                              )}
                              {placeholder}
                            </motion.nav>
                          )}
                        </Droppable>
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
          <CategoryNavigationItem
            data-testid={'sidenav-category-item'}
            key={category.id}
            title={category.title}
            className={styles.before}
            onClick={() => {
              onSelectCategory(category);
              closeSidebar({ force: true });
            }}
          />
        ))}
      </div>
    );
  }
);
CategoryNavigation.displayName = 'AdministrationCategoryNavigation';
