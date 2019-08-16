import React, { memo, useMemo, useCallback, useState } from 'react';
import { CategoryModel } from 'model';
import { makeStyles } from '@material-ui/styles';
import { Theme, Typography, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, List, ListItem } from '@material-ui/core';
import { useCategories } from 'util/categories/useCategories';
import { MoreVert } from '@material-ui/icons';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { findIndex } from 'lodash';
import { ID } from 'model/ID';

const useStyles = makeStyles((theme: Theme) => {
    return ({
        heading: {
            marginBottom: theme.spacing(3),
        },
        moveCategoryHandlerIcon: {
            verticalAlign: 'bottom',
            marginRight: theme.spacing(3)
        },
        expansionSummary: {
            backgroundColor: theme.palette.divider
        }
    });
});

export interface CategoryNavigationProps {
    selectedCategory: CategoryModel | null;
    onSelectCategory(categoryModel: CategoryModel): void;
    mutateCategory(updatedCategory: Partial<CategoryModel>): Promise<void>;
}

export const CategoryNavigation = memo<CategoryNavigationProps>(({ selectedCategory, onSelectCategory, mutateCategory }) => {
    const styles = useStyles();

    const categories = useCategories();

    const [expandedMainCategoryId, setExpandedMainCategoryId] = useState<ID | null>(null);

    const mainCategories = useMemo(() => categories.filter(category => !Boolean(category.category)), [categories]);

    const getSubcategoriesForCategory = useCallback((category: Partial<CategoryModel>) => {
        return categories.filter(c => c.category && c.category.id === category.id);
    }, [categories]);

    return (
        <>
            <Typography variant="h5" className={styles.heading}>
                Kategorienübersicht
            </Typography>
            <DragDropContext
                onDragEnd={({ destination, source, reason, draggableId }) => {
                    if (!destination) {
                        return;
                    }

                    if (destination.droppableId !== source.droppableId) {
                        return;
                    }

                    const initialCategoriesArray = destination.droppableId === 'root' ? mainCategories : getSubcategoriesForCategory({ id: Number(destination.droppableId) });
                    const sourceIndex = findIndex(initialCategoriesArray, { id: Number(draggableId) })
                    const newCategoriesArray = [...initialCategoriesArray];
                    newCategoriesArray.splice(sourceIndex, 1);
                    newCategoriesArray.splice(destination.index, 0, initialCategoriesArray[sourceIndex]);
                    console.log(newCategoriesArray);
                    Promise.all(newCategoriesArray.map((category, index) => {
                        if (!category) {
                            return Promise.resolve();
                        }
                        return mutateCategory({
                            id: category.id,
                            sortKey: index * 10 + 10,
                            title: category.title,
                            bannerImageFile: category.bannerImageFile,
                            group: category.group,
                            redirect: category.redirect
                        });
                    }));
                }}
            >
                <Droppable droppableId={'root'}>
                    {({ droppableProps, innerRef, placeholder }) => (
                        <div {...droppableProps} ref={innerRef} style={{ paddingBottom: '5em' }}>
                            {mainCategories.map((category, index) => (
                                <Draggable key={category.id} draggableId={String(category.id)} index={index}>
                                    {({ innerRef, dragHandleProps, draggableProps }) => (
                                        <ExpansionPanel
                                            expanded={Boolean(expandedMainCategoryId && expandedMainCategoryId === category.id)}
                                            onChange={(e, expanded) => {
                                                if (expanded) {
                                                    setExpandedMainCategoryId(category.id);
                                                }
                                            }}
                                            innerRef={innerRef}
                                            {...draggableProps}
                                        >
                                            <ExpansionPanelSummary
                                                aria-controls={`${category.id}-content`}
                                                id={`${category.id}-header`}
                                                className={styles.expansionSummary}
                                                onClick={() => {
                                                    onSelectCategory(category);
                                                }}
                                            >
                                                <Typography variant="body1">
                                                    <span {...dragHandleProps}>
                                                        <MoreVert className={styles.moveCategoryHandlerIcon} />
                                                    </span>
                                                    <b>{category.title}</b>
                                                </Typography>
                                            </ExpansionPanelSummary>
                                            <ExpansionPanelDetails>
                                                <Droppable droppableId={String(category.id)}>
                                                    {({ droppableProps, innerRef, placeholder }) => (
                                                        <List component="nav" innerRef={innerRef} {...droppableProps}>
                                                            {
                                                                getSubcategoriesForCategory(category).map(subcategory => (
                                                                    <Draggable key={subcategory.id} draggableId={String(subcategory.id)} index={index}>
                                                                        {({ innerRef, dragHandleProps, draggableProps }) => (
                                                                            <ListItem
                                                                                className={'expansionSummary'}
                                                                                style={{ cursor: 'pointer' }}
                                                                                onClick={() => onSelectCategory(subcategory)}
                                                                                innerRef={innerRef}
                                                                                {...draggableProps}
                                                                            >
                                                                                <Typography>
                                                                                    <span {...dragHandleProps}>
                                                                                        <MoreVert className={styles.moveCategoryHandlerIcon} />
                                                                                    </span>
                                                                                    {subcategory.title}
                                                                                </Typography>
                                                                            </ListItem>
                                                                        )}
                                                                    </Draggable>
                                                                ))
                                                            }
                                                            {placeholder}
                                                        </List>
                                                    )}
                                                </Droppable>
                                            </ExpansionPanelDetails>
                                        </ExpansionPanel>
                                    )}
                                </Draggable>
                            ))}
                            {placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </>
    );
});