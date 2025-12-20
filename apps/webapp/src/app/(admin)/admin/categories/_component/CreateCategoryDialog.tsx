import * as React from 'react';
import { useMutation } from '@apollo/client/react';
import { CategoryModel } from 'model';
import {
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  ErrorMessage,
  Input,
  Label,
  LoadingButton,
  Radio,
  RadioGroup,
} from '@lotta-schule/hubert';
import { CategorySelect } from 'shared/categorySelect/CategorySelect';

import CreateCategoryMutation from 'api/mutation/CreateCategoryMutation.graphql';
import GetCategoriesQuery from 'api/query/GetCategoriesQuery.graphql';

import styles from './CreateCategoryDialog.module.scss';

enum CategoryPosition {
  Main,
  Sub,
  Side,
}

export interface CreateCategoryDialogProps {
  isOpen: boolean;
  onAbort(): void;
  onConfirm(category: CategoryModel): void;
}

export const CreateCategoryDialog = React.memo(
  ({ isOpen, onAbort, onConfirm }: CreateCategoryDialogProps) => {
    const firstInputRef = React.useRef<HTMLInputElement>(null);

    const [title, setTitle] = React.useState('');
    const [categoryPosition, setCategoryPosition] = React.useState(
      CategoryPosition.Main
    );
    const [parentCategory, setParentCategory] =
      React.useState<CategoryModel | null>(null);
    const [createCategory, { loading: isLoading, error }] = useMutation<
      { category: CategoryModel },
      { category: any }
    >(CreateCategoryMutation, {
      update: (cache, { data }) => {
        let categories: CategoryModel[] = [];
        if (data && data.category) {
          const readCategoriesResult = cache.readQuery<{
            categories: CategoryModel[];
          }>({ query: GetCategoriesQuery });
          if (readCategoriesResult && readCategoriesResult.categories) {
            categories = [...readCategoriesResult.categories];
          }
          cache.writeQuery<{ categories: CategoryModel[] }>({
            query: GetCategoriesQuery,
            data: {
              categories: [...categories, data.category],
            },
          });
        }
      },
      onCompleted: ({ category }) => {
        onConfirm(category);
      },
    });
    const resetForm = () => {
      setTitle('');
    };

    React.useEffect(() => {
      resetForm();
      if (isOpen) {
        setTimeout(() => firstInputRef.current?.focus(), 100);
      }
    }, [isOpen]);

    return (
      <Dialog
        open={isOpen}
        onRequestClose={() => onAbort()}
        title={'Kategorie erstellen'}
      >
        <form>
          <DialogContent>
            <ErrorMessage error={error} />
            <Label label="Name der Kategorie:">
              <Input
                id="title"
                value={title}
                ref={firstInputRef}
                onChange={({ currentTarget }) => setTitle(currentTarget.value)}
                disabled={isLoading}
                placeholder="Meine neue Kategorie"
                required
              />
            </Label>
            <Label
              label={'Art der Kategorie'}
              className={styles.categoryPositionSet}
            >
              <RadioGroup
                name={'category-type'}
                aria-label={'Art der Kategorie'}
                value={categoryPosition}
                onChange={(_e, value) =>
                  setCategoryPosition(parseInt(value, 10))
                }
              >
                <Radio
                  value={CategoryPosition.Main}
                  label={'Hauptnavigation'}
                />
                <Radio value={CategoryPosition.Sub} label={'Subnavigation'} />
                <Collapse
                  isOpen={categoryPosition === CategoryPosition.Sub}
                  data-testid="CategorySelectCollapse"
                >
                  <CategorySelect
                    hideSubCategories
                    className={styles.categorySelect}
                    label={'Übergeordnete Kategorie'}
                    disabled={
                      categoryPosition !== CategoryPosition.Sub || isLoading
                    }
                    selectedCategory={parentCategory}
                    onSelectCategory={setParentCategory}
                  />
                </Collapse>
                <Radio value={CategoryPosition.Side} label={'Randnavigation'} />
              </RadioGroup>
            </Label>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                resetForm();
                onAbort();
              }}
            >
              Abbrechen
            </Button>
            <LoadingButton
              type="submit"
              disabled={
                !title ||
                isLoading ||
                (categoryPosition === CategoryPosition.Sub && !parentCategory)
              }
              onAction={async () => {
                await createCategory({
                  variables: {
                    category: {
                      title,
                      isSidenav: categoryPosition === CategoryPosition.Side,
                      category:
                        categoryPosition !== CategoryPosition.Side &&
                        parentCategory
                          ? { id: parentCategory.id }
                          : null,
                    },
                  },
                });
              }}
            >
              Kategorie erstellen
            </LoadingButton>
          </DialogActions>
        </form>
      </Dialog>
    );
  }
);
CreateCategoryDialog.displayName = 'CreateCategoryDialog';
