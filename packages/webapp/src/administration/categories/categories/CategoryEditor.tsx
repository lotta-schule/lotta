import * as React from 'react';
import { Icon } from 'shared/Icon';
import {
  faAngleLeft,
  faFloppyDisk,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { useMutation, useQuery } from '@apollo/client';
import {
  Button,
  Checkbox,
  Divider,
  ErrorMessage,
  Input,
  Label,
  Radio,
  RadioGroup,
  Option,
  Select,
  SplitViewButton,
  Toolbar,
  useSplitView,
  LoadingButton,
} from '@lotta-schule/hubert';
import { motion } from 'framer-motion';
import { CategoryModel, WidgetModel, ID, UserGroupModel } from 'model';
import { ResponsiveImage } from 'util/image/ResponsiveImage';
import { useCategories } from 'util/categories/useCategories';
import { SelectFileOverlay } from 'shared/edit/SelectFileOverlay';
import { GroupSelect } from 'shared/edit/GroupSelect';
import { PlaceholderImage } from 'shared/placeholder/PlaceholderImage';
import { useServerData } from 'shared/ServerDataContext';
import { DeleteCategoryDialog } from './DeleteCategoryDialog';
import { Category, File, RedirectType } from 'util/model';
import { CategoryWidgetSelector } from './CategoryWidgetSelector';
import { CategoryArticleRedirectSelection } from './CategoryArticleRedirectSelection';
import clsx from 'clsx';

import UpdateCategoryMutation from 'api/mutation/UpdateCategoryMutation.graphql';
import GetCategoryWidgetsQuery from 'api/query/GetCategoryWidgetsQuery.graphql';

import styles from './CategoryEditor.module.scss';

export interface CategoryEditorProps {
  selectedCategory: CategoryModel | null;
  onSelectCategory(category: CategoryModel | null): void;
}

export const CategoryEditor = React.memo<CategoryEditorProps>(
  ({ selectedCategory, onSelectCategory }) => {
    const { baseUrl } = useServerData();
    const { open: openSidebar } = useSplitView();

    const [categories] = useCategories();

    const [category, setCategory] = React.useState<CategoryModel | null>(null);
    const [isDeleteCategoryDialogOpen, setIsDeleteCategoryDialogOpen] =
      React.useState(false);

    const [selectedWidgets, setSelectedWidgets] = React.useState<WidgetModel[]>(
      []
    );
    const [mutateCategory, { error }] = useMutation<
      { category: CategoryModel },
      { id: ID; category: any }
    >(UpdateCategoryMutation, {
      refetchQueries: [
        {
          query: GetCategoryWidgetsQuery,
          variables: { categoryId: category?.id ?? null },
        },
      ],
    });
    const { data: currentWidgetsData, error: currentWidgetsError } = useQuery(
      GetCategoryWidgetsQuery,
      {
        variables: { categoryId: category?.id },
        skip: !category?.id,
      }
    );
    React.useEffect(() => {
      if (currentWidgetsData) {
        setSelectedWidgets(currentWidgetsData.widgets);
      }
    }, [currentWidgetsData]);

    const updateCategory = React.useCallback(() => {
      if (!selectedCategory || !category) {
        return null;
      }
      return mutateCategory({
        variables: {
          id: selectedCategory.id,
          category: {
            title: category.title,
            bannerImageFile: category.bannerImageFile && {
              id: category.bannerImageFile.id,
            },
            groups: category.groups?.map(({ id }) => ({ id })),
            redirect: category.redirect,
            layoutName: category.layoutName,
            hideArticlesFromHomepage:
              category.hideArticlesFromHomepage || false,
            widgets: selectedWidgets?.map(({ id }) => ({ id })) ?? [],
          },
        },
      });
    }, [category, mutateCategory, selectedCategory, selectedWidgets]);

    React.useEffect(() => {
      if (selectedCategory === null && category !== null) {
        setCategory(null);
      } else if (selectedCategory) {
        if (!category || category.id !== selectedCategory.id) {
          setCategory({ ...selectedCategory });
        }
      }
    }, [category, selectedCategory]);

    if (!category) {
      return null;
    }

    return (
      <div className={styles.root}>
        <Toolbar hasScrollableParent>
          <SplitViewButton
            action="open"
            icon={<Icon icon={faAngleLeft} size={'lg'} />}
          />
          <h3 className={styles.title}>
            {selectedCategory
              ? selectedCategory.title
              : category && category.title}
          </h3>
        </Toolbar>
        <ErrorMessage error={error || currentWidgetsError} />
        <Label label={'Name der Kategorie'}>
          <Input
            className={styles.input}
            aria-label={'Name der Kategorie'}
            value={category.title ?? ''}
            onChange={(e) =>
              setCategory({
                ...category,
                title: e.currentTarget.value,
              })
            }
          />
        </Label>

        {!category.isHomepage && (
          <GroupSelect
            className={styles.input}
            selectedGroups={category.groups || []}
            onSelectGroups={(groups: UserGroupModel[]) => {
              setCategory({ ...category, groups });
            }}
          />
        )}

        <h4 className={clsx(styles.input, styles.heading)}>
          Wähle ein Banner für diese Kategorie
        </h4>

        <SelectFileOverlay
          label={'Banner ändern'}
          onSelectFile={(bannerImageFile) =>
            setCategory({ ...category, bannerImageFile })
          }
          allowDeletion
        >
          {category.bannerImageFile ? (
            <ResponsiveImage
              style={{ width: '100%' }}
              alt={`Banner für ${category.title}`}
              width={900}
              aspectRatio={'6:1'}
              sizes={'80vw'}
              src={File.getFileRemoteLocation(
                baseUrl,
                category.bannerImageFile
              )}
            />
          ) : (
            <PlaceholderImage width={'100%'} height={75} />
          )}
        </SelectFileOverlay>

        {!category.isHomepage && (
          <Checkbox
            isSelected={category.hideArticlesFromHomepage}
            onChange={(isSelected) =>
              setCategory({
                ...category,
                hideArticlesFromHomepage: isSelected,
              })
            }
            value={'hideArticlesFromHomepage'}
          >
            Beiträge dieser Kategorie auf der Startseite verstecken
          </Checkbox>
        )}

        <Select
          className={styles.input}
          title={'Layout für die Kategorie wählen'}
          value={category.layoutName ?? 'standard'}
          onChange={(layoutName) =>
            setCategory({
              ...category,
              layoutName: layoutName as 'standard' | 'densed' | '2-columns',
            })
          }
          id={'category-layout'}
        >
          <Option value={'standard'}>Standardlayout</Option>
          <Option value={'densed'}>Kompaktlayout</Option>
          <Option value={'2-columns'}>Zweispaltenlayout</Option>
        </Select>

        {!category.isHomepage && (
          <>
            <h4 className={clsx(styles.input, styles.heading)}>
              Die Kategorie als Weiterleitung
            </h4>

            <RadioGroup
              name={'category-redirect-type'}
              aria-label={'Die Kategorie als Weiterleitung'}
              value={Category.getRedirectType(category)}
              onChange={(_e, value) => {
                if (value === RedirectType.None) {
                  setCategory({
                    ...category,
                    redirect: null,
                  });
                }
                if (value === RedirectType.InternalCategory) {
                  setCategory({
                    ...category,
                    redirect: Category.getPath(categories[0]),
                  });
                }
                if (value === RedirectType.InternalArticle) {
                  setCategory({
                    ...category,
                    redirect: '/a/',
                  });
                }
                if (value === RedirectType.Extern) {
                  setCategory({
                    ...category,
                    redirect: 'https://lotta.schule',
                  });
                }
              }}
            >
              <Radio
                value={RedirectType.None}
                label={
                  'Kategorie wird nicht weitergeleitet und zeigt eigene Beiträge an.'
                }
              />
              <Radio
                value={RedirectType.InternalCategory}
                label={'Kategorie zu einer anderen Kategorie weiterleiten:'}
              />

              <motion.div
                data-testid={'InternalCategoryRedirectWrapper'}
                className={styles.input}
                initial={'closed'}
                animate={
                  Category.getRedirectType(category) ===
                  RedirectType.InternalCategory
                    ? 'open'
                    : 'closed'
                }
                variants={{
                  open: { opacity: 1, height: 'auto' },
                  closed: { opacity: 0, height: 0 },
                }}
              >
                <Select
                  title={'Zu einer anderen Kategorie weiterleiten ...'}
                  value={category.redirect || 'null'}
                  onChange={(redirect) =>
                    setCategory({
                      ...category,
                      redirect,
                    })
                  }
                  id={'category-redirect'}
                >
                  {categories.map((category) => (
                    <Option
                      key={category.id}
                      value={Category.getPath(category)}
                    >
                      {category.title}
                    </Option>
                  ))}
                </Select>
              </motion.div>

              <Radio
                value={RedirectType.InternalArticle}
                label={'Kategorie zu einem Beitrag weiterleiten:'}
              />

              <motion.div
                data-testid={'InternalArticleRedirectWrapper'}
                initial={'closed'}
                animate={
                  Category.getRedirectType(category) ===
                  RedirectType.InternalArticle
                    ? 'open'
                    : 'closed'
                }
                variants={{
                  open: { opacity: 1, height: 'auto' },
                  closed: { opacity: 0, height: 0 },
                }}
              >
                <CategoryArticleRedirectSelection
                  redirectPath={category.redirect ?? '/a/'}
                  onSelectRedirectPath={(redirect) =>
                    setCategory({
                      ...category,
                      redirect,
                    })
                  }
                />
              </motion.div>

              <Radio
                value={RedirectType.Extern}
                label={'Kategorie zu einer Seite im Internet weiterleiten'}
              />

              <motion.div
                data-testid={'ExternalRedirectWrapper'}
                initial={'closed'}
                animate={
                  Category.getRedirectType(category) === RedirectType.Extern
                    ? 'open'
                    : 'closed'
                }
                variants={{
                  open: { opacity: 1, height: 'auto' },
                  closed: { opacity: 0, height: 0 },
                }}
              >
                <Label label={'Ziel der Weiterleitung:'}>
                  <Input
                    className={styles.input}
                    aria-label={'Ziel der Weiterleitung'}
                    value={category.redirect ?? ''}
                    onChange={(e) =>
                      setCategory({
                        ...category,
                        redirect: e.currentTarget.value,
                      })
                    }
                  />
                </Label>
              </motion.div>
            </RadioGroup>

            <p>&nbsp;</p>
          </>
        )}

        <h4 className={clsx(styles.input, styles.heading)}>
          Wähle die marginalen Module für diese Kategorie
        </h4>
        <CategoryWidgetSelector
          selectedWidgets={selectedWidgets}
          setSelectedWidgets={(widgets) => setSelectedWidgets(widgets)}
        />

        {!category.isHomepage && (
          <>
            <Divider className={styles.footerDivider} />
            <div className={styles.footer}>
              <Button
                icon={<Icon icon={faTrash} />}
                onClick={() => setIsDeleteCategoryDialogOpen(true)}
                variant={'error'}
              >
                Kategorie löschen
              </Button>
              <LoadingButton
                onAction={async () => {
                  await updateCategory();
                }}
                icon={<Icon icon={faFloppyDisk} />}
              >
                Kategorie speichern
              </LoadingButton>
            </div>
            <DeleteCategoryDialog
              isOpen={isDeleteCategoryDialogOpen}
              categoryToDelete={category}
              onRequestClose={() => setIsDeleteCategoryDialogOpen(false)}
              onConfirm={() => {
                setIsDeleteCategoryDialogOpen(false);
                onSelectCategory(null);
                openSidebar();
              }}
            />
          </>
        )}
      </div>
    );
  }
);
CategoryEditor.displayName = 'AdministrationCategoryEditor';
