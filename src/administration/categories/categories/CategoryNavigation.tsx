import * as React from 'react';
import { CategoryModel } from 'model';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@material-ui/core';
import { DragHandle } from 'shared/general/icon';
import { useCategories } from 'util/categories/useCategories';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { ID } from 'model/ID';
import { useMutation } from '@apollo/client';
import UpdateCategoryMutation from 'api/mutation/UpdateCategoryMutation.graphql';

import styles from './CategoryNavigation.module.scss';

export interface CategoryNavigationProps {
    selectedCategory: CategoryModel | null;
    onSelectCategory(categoryModel: CategoryModel): void;
}

export const CategoryNavigation = React.memo<CategoryNavigationProps>(
    ({ selectedCategory, onSelectCategory }) => {
        const [categories] = useCategories();

        const [expandedMainCategoryId, setExpandedMainCategoryId] =
            React.useState<ID | null>(null);

        const homepageCategory = (categories || []).find(
            (category) => category.isHomepage
        );
        const mainCategories = React.useMemo(
            () =>
                categories.filter(
                    (category) =>
                        !Boolean(category.category) &&
                        !category.isSidenav &&
                        !category.isHomepage
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
        >(UpdateCategoryMutation, {
            optimisticResponse: ({ id, category }) => {
                return {
                    __typename: 'Mutation',
                    category: {
                        __typename: 'Category',
                        id,
                        sortKey: category.sortKey,
                    },
                } as any;
            },
        });

        React.useEffect(() => {
            if (selectedCategory) {
                if (selectedCategory.category?.id) {
                    setExpandedMainCategoryId(selectedCategory.category.id);
                } else {
                    setExpandedMainCategoryId(selectedCategory.id);
                }
            }
        }, [selectedCategory]);

        return (
            <div className={styles.root}>
                <h4 className={styles.heading}>Alle Kategorien</h4>

                {homepageCategory && (
                    <Accordion
                        className={styles.before}
                        expanded={false}
                        key={homepageCategory.id}
                    >
                        <AccordionSummary
                            className={styles.expansionSummary}
                            onClick={() => onSelectCategory(homepageCategory)}
                        >
                            <b>{homepageCategory.title}</b>
                        </AccordionSummary>
                    </Accordion>
                )}

                <h6>Hauptnavigation</h6>
                <DragDropContext
                    onDragEnd={({ destination, source, draggableId }) => {
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
                                updateCategory({
                                    variables: {
                                        id: category.id,
                                        category: {
                                            sortKey: index * 10 + 10,
                                        },
                                    },
                                });
                            }
                        });
                    }}
                >
                    <Droppable
                        droppableId={'categories-root'}
                        type={'root-categories'}
                    >
                        {({ droppableProps, innerRef, placeholder }) => (
                            <div
                                {...droppableProps}
                                ref={innerRef}
                                style={{ paddingBottom: '5em' }}
                            >
                                {mainCategories.map((category, index) => (
                                    <Draggable
                                        key={category.id}
                                        draggableId={String(category.id)}
                                        index={index}
                                    >
                                        {({
                                            innerRef,
                                            dragHandleProps,
                                            draggableProps,
                                        }) => (
                                            <Accordion
                                                expanded={Boolean(
                                                    expandedMainCategoryId &&
                                                        expandedMainCategoryId ===
                                                            category.id
                                                )}
                                                onChange={(_e, expanded) => {
                                                    if (expanded) {
                                                        setExpandedMainCategoryId(
                                                            category.id
                                                        );
                                                    }
                                                }}
                                                innerRef={innerRef}
                                                {...draggableProps}
                                                className={styles.before}
                                            >
                                                <AccordionSummary
                                                    aria-controls={`${category.id}-content`}
                                                    id={`${category.id}-header`}
                                                    className={
                                                        styles.expansionSummary
                                                    }
                                                    onClick={() => {
                                                        onSelectCategory(
                                                            category
                                                        );
                                                    }}
                                                >
                                                    <div>
                                                        <span
                                                            {...dragHandleProps}
                                                        >
                                                            <DragHandle
                                                                className={
                                                                    styles.moveCategoryHandlerIcon
                                                                }
                                                            />
                                                        </span>
                                                        <b>{category.title}</b>
                                                    </div>
                                                </AccordionSummary>
                                                <AccordionDetails>
                                                    <Droppable
                                                        droppableId={String(
                                                            category.id
                                                        )}
                                                        type={`subcategories-to-${category.id}`}
                                                    >
                                                        {({
                                                            droppableProps,
                                                            innerRef,
                                                            placeholder,
                                                        }) => (
                                                            <nav
                                                                ref={innerRef}
                                                                {...droppableProps}
                                                            >
                                                                {getSubcategoriesForCategory(
                                                                    category
                                                                ).map(
                                                                    (
                                                                        subcategory,
                                                                        index
                                                                    ) => (
                                                                        <Draggable
                                                                            key={
                                                                                subcategory.id
                                                                            }
                                                                            draggableId={String(
                                                                                subcategory.id
                                                                            )}
                                                                            index={
                                                                                index
                                                                            }
                                                                        >
                                                                            {({
                                                                                innerRef,
                                                                                dragHandleProps,
                                                                                draggableProps,
                                                                            }) => (
                                                                                <li
                                                                                    ref={
                                                                                        innerRef
                                                                                    }
                                                                                    className={
                                                                                        styles.subcategories
                                                                                    }
                                                                                    style={{
                                                                                        cursor: 'pointer',
                                                                                    }}
                                                                                    onClick={() =>
                                                                                        onSelectCategory(
                                                                                            subcategory
                                                                                        )
                                                                                    }
                                                                                    {...draggableProps}
                                                                                >
                                                                                    <div>
                                                                                        <span
                                                                                            {...dragHandleProps}
                                                                                        >
                                                                                            <DragHandle
                                                                                                className={
                                                                                                    styles.moveCategoryHandlerIcon
                                                                                                }
                                                                                            />
                                                                                        </span>
                                                                                        {
                                                                                            subcategory.title
                                                                                        }
                                                                                    </div>
                                                                                </li>
                                                                            )}
                                                                        </Draggable>
                                                                    )
                                                                )}
                                                                {placeholder}
                                                            </nav>
                                                        )}
                                                    </Droppable>
                                                </AccordionDetails>
                                            </Accordion>
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
                    <Accordion
                        className={styles.before}
                        expanded={false}
                        key={category.id}
                    >
                        <AccordionSummary
                            className={styles.expansionSummary}
                            onClick={() => onSelectCategory(category)}
                        >
                            <b>{category.title}</b>
                        </AccordionSummary>
                    </Accordion>
                ))}
            </div>
        );
    }
);
CategoryNavigation.displayName = 'AdministrationCategoryNavigation';
