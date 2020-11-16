import React, { FunctionComponent, memo, useState } from 'react';
import {
    Paper, Typography, makeStyles, Theme, Button, Grid
} from '@material-ui/core';
import { Add as AddCircleIcon } from '@material-ui/icons';
import clsx from 'clsx';
import { CategoryModel } from 'model';
import { CategoryNavigation } from './CategoryNavigation';
import { CategoryEditor } from './CategoryEditor';
import { CreateCategoryDialog } from './CreateCategoryDialog';

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        padding: 2,
        display: 'flex',
        alignItems: 'center',
        width: 400,
        backgroundColor: theme.palette.grey[200],
        borderRadius: theme.shape.borderRadius,
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
        float: 'right',
        marginTop: theme.spacing(1),
    },
    leftIcon: {
        marginRight: theme.spacing(1),
    },
    iconSmall: {
        fontSize: 20,
    },
    padding: {
        paddingRight: theme.spacing(4),
    }
}));

export const CategoriesManagement: FunctionComponent = memo(() => {
    const styles = useStyles();

    const [selectedCategory, setSelectedCategory] = useState<CategoryModel | null>(null);
    const [isCreateCategoryDialogOpen, setIsCreateCategoryDialogOpen] = useState(false);

    return (
        <Paper className={styles.container}>
            <Typography variant="h4" className={styles.headlines}>
                Kategorien
                <Button
                    size="small"
                    variant="contained"
                    color="secondary"
                    className={styles.button}
                    onClick={() => setIsCreateCategoryDialogOpen(true)}
                >
                    <AddCircleIcon className={clsx(styles.leftIcon, styles.iconSmall)} />
                    Kategorie erstellen
                </Button>
            </Typography>

            <Grid container>
                <Grid item sm={5} className={styles.padding} >
                    <CategoryNavigation selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
                </Grid>
                <Grid item sm={7}>
                    {selectedCategory && (
                        <CategoryEditor selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
                    )}
                </Grid>
            </Grid>

            <CreateCategoryDialog
                isOpen={isCreateCategoryDialogOpen}
                onAbort={() => setIsCreateCategoryDialogOpen(false)}
                onConfirm={category => {
                    setIsCreateCategoryDialogOpen(false);
                    setSelectedCategory(category);
                }}
            />
        </Paper>
    );
});