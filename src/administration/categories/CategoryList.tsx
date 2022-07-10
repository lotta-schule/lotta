import * as React from 'react';
import { Add as AddCircleIcon } from '@material-ui/icons';
import { CategoryModel } from 'model';
import { Button, NoSsr } from '@lotta-schule/hubert';
import { CategoryNavigation } from './categories/CategoryNavigation';
import { CategoryEditor } from './categories/CategoryEditor';
import { CreateCategoryDialog } from './categories/CreateCategoryDialog';

import styles from './CategoryList.module.scss';

export const CategoryList = React.memo(() => {
    const [selectedCategory, setSelectedCategory] =
        React.useState<CategoryModel | null>(null);
    const [isCreateCategoryDialogOpen, setIsCreateCategoryDialogOpen] =
        React.useState(false);

    return (
        <div className={styles.root}>
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

            <section>
                <div>
                    <NoSsr>
                        <CategoryNavigation
                            selectedCategory={selectedCategory}
                            onSelectCategory={setSelectedCategory}
                        />
                    </NoSsr>
                </div>
                <div>
                    {selectedCategory && (
                        <CategoryEditor
                            selectedCategory={selectedCategory}
                            onSelectCategory={setSelectedCategory}
                        />
                    )}
                </div>
            </section>

            <CreateCategoryDialog
                isOpen={isCreateCategoryDialogOpen}
                onAbort={() => setIsCreateCategoryDialogOpen(false)}
                onConfirm={(category) => {
                    setIsCreateCategoryDialogOpen(false);
                    setSelectedCategory(category);
                }}
            />
        </div>
    );
});
CategoryList.displayName = 'AdminCategoryList';
