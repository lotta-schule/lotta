import React, { memo, useMemo, useCallback, useState } from 'react';
import { CategoryModel } from 'model';
import { makeStyles } from '@material-ui/styles';
import { Theme, Typography, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, List, ListItem } from '@material-ui/core';
import { useCategories } from 'util/categories/useCategories';
import { MoreVert } from '@material-ui/icons';

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
}

export const CategoryNavigation = memo<CategoryNavigationProps>(({ selectedCategory, onSelectCategory }) => {
    const styles = useStyles();

    const categories = useCategories();

    const [expandedMainCategoryId, setExpandedMainCategoryId] = useState<string | null>(null);

    const mainCategories = useMemo(() => categories.filter(category => !Boolean(category.category)), [categories]);

    const getSubcategoriesForCategory = useCallback((category: CategoryModel) => {
        return categories.filter(c => c.category && c.category.id === category.id);
    }, [categories]);

    return (
        <>
            <Typography variant="h5" className={styles.heading}>
                Kategorienübersicht
            </Typography>
            {mainCategories.map(category => (
                <ExpansionPanel
                    key={category.id}
                    expanded={Boolean(expandedMainCategoryId && expandedMainCategoryId === category.id)}
                    onChange={(e, expanded) => {
                        if (expanded) {
                            setExpandedMainCategoryId(category.id);
                        }
                    }}
                    TransitionProps={{ unmountOnExit: true }}
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
                            <MoreVert className={styles.moveCategoryHandlerIcon} />
                            <b>{category.title}</b>
                        </Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <List component="nav">
                            {getSubcategoriesForCategory(category).map(subcategory => (
                                <ListItem
                                    key={subcategory.id}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => onSelectCategory(subcategory)}
                                >
                                    <Typography>
                                        <MoreVert className={styles.moveCategoryHandlerIcon} />
                                        {subcategory.title}
                                    </Typography>
                                </ListItem>
                            ))}
                        </List>
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            ))}
        </>
    );
});