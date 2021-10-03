import * as React from 'react';
import { Grid } from '@material-ui/core';
import { Add as AddCircleIcon, Category } from '@material-ui/icons';
import { CategoryModel } from 'model';
import { AdminLayout } from 'component/layouts/adminLayout/AdminLayout';
import { CategoryNavigation } from 'component/layouts/adminLayout/categoryManagment/categories/CategoryNavigation';
import { CategoryEditor } from 'component/layouts/adminLayout/categoryManagment/categories/CategoryEditor';
import { CreateCategoryDialog } from 'component/layouts/adminLayout/categoryManagment/categories/CreateCategoryDialog';
import { Button } from 'component/general/button/Button';
import { GetServerSidePropsContext } from 'next';

import styles from './list.module.scss';

export const List = () => {
    const [selectedCategory, setSelectedCategory] =
        React.useState<CategoryModel | null>(null);
    const [isCreateCategoryDialogOpen, setIsCreateCategoryDialogOpen] =
        React.useState(false);

    return (
        <AdminLayout
            title={
                <>
                    <Category /> Kategorien
                </>
            }
            hasHomeLink
        >
            <h3 className={styles.headlines}>
                Kategorien
                <Button
                    className={styles.button}
                    onClick={() => setIsCreateCategoryDialogOpen(true)}
                    icon={<AddCircleIcon />}
                >
                    Kategorie erstellen
                </Button>
            </h3>

            <Grid container>
                <Grid item sm={5} className={styles.padding}>
                    <CategoryNavigation
                        selectedCategory={selectedCategory}
                        onSelectCategory={setSelectedCategory}
                    />
                </Grid>
                <Grid item sm={7}>
                    {selectedCategory && (
                        <CategoryEditor
                            selectedCategory={selectedCategory}
                            onSelectCategory={setSelectedCategory}
                        />
                    )}
                </Grid>
            </Grid>

            <CreateCategoryDialog
                isOpen={isCreateCategoryDialogOpen}
                onAbort={() => setIsCreateCategoryDialogOpen(false)}
                onConfirm={(category) => {
                    setIsCreateCategoryDialogOpen(false);
                    setSelectedCategory(category);
                }}
            />
        </AdminLayout>
    );
};

export const getServerSideProps = async ({}: GetServerSidePropsContext) => {
    return {
        props: {},
    };
};

export default List;
