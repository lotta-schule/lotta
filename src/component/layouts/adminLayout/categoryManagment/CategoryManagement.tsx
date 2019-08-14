import React, { FunctionComponent, memo, useState, useCallback } from 'react';
import {
    Paper, Typography, makeStyles, Theme, Button, Grid
} from '@material-ui/core';
import { Add as AddCircleIcon } from '@material-ui/icons';
import classNames from 'classnames';
import { theme } from 'theme';
import { CategoryModel } from 'model';
import { CategoryNavigation } from './CategoryNavigation';
import { CategoryEditor } from './CategoryEditor';
import { useDispatch } from 'react-redux';
import { UpdateCategoryMutation } from 'api/mutation/UpdateCategoryMutation';
import { useApolloClient } from 'react-apollo';
import { createUpdateCategoryAction } from 'store/actions/client';

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        padding: 2,
        display: 'flex',
        alignItems: 'center',
        width: 400,
        backgroundColor: '#efefef',
        borderRadius: 4,
    },
    container: {
        paddingTop: theme.spacing(3),
        paddingBottom: theme.spacing(3),
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
    },
    headlines: {
        marginBottom: theme.spacing(4),
    },
    button: {
        marginBottom: theme.spacing(1),

    },
    leftIcon: {
        marginRight: theme.spacing(1),
    },
    iconSmall: {
        fontSize: 20,
    },
}));

export const CategoriesManagement: FunctionComponent = memo(() => {
    const styles = useStyles();

    const [selectedCategory, setSelectedCategory] = useState<CategoryModel | null>(null);

    const dispatch = useDispatch();
    const apolloClient = useApolloClient();
    const mutateCategory = useCallback(async (updatedCategory: Partial<CategoryModel>): Promise<void> => {
        const result = await apolloClient.mutate<{ category: CategoryModel }, { id: string; category: Partial<CategoryModel>; }>({
            mutation: UpdateCategoryMutation,
            variables: {
                id: updatedCategory.id!,
                category: {
                    title: updatedCategory.title!,
                    sortKey: updatedCategory.sortKey!,
                    bannerImageFile: updatedCategory.bannerImageFile!,
                    group: updatedCategory.group!,
                    redirect: updatedCategory.redirect!
                }
            },
            fetchPolicy: 'no-cache'
        });
        if (result.data.category) {
            dispatch(createUpdateCategoryAction({ ...selectedCategory, ...result.data.category }));
        }
    }, [apolloClient, dispatch, selectedCategory]);

    return (
        <Paper className={styles.container}>
            <Typography variant="h4" className={styles.headlines}>
                Kategorienverwaltung
                    <Button
                    size="small"
                    variant="contained"
                    color="secondary"
                    className={styles.button}
                    style={{ float: 'right', marginTop: theme.spacing(1), }}
                >
                    <AddCircleIcon className={classNames(styles.leftIcon, styles.iconSmall)} />
                    Kategorie hinzufügen
                    </Button>
            </Typography>

            <Grid container>
                <Grid item sm={5} style={{ paddingRight: theme.spacing(4) }} >
                    <CategoryNavigation selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} mutateCategory={mutateCategory} />
                </Grid>
                <Grid item sm={7}>
                    {selectedCategory && (
                        <CategoryEditor selectedCategory={selectedCategory} mutateCategory={mutateCategory} />
                    )}
                </Grid>
            </Grid>
        </Paper>
    );
});