'use client';

import * as React from 'react';
import { Icon } from 'shared/Icon';
import { faFloppyDisk, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useMutation, useQuery } from '@apollo/client';
import {
  Button,
  Checkbox,
  ErrorMessage,
  Input,
  Label,
  Radio,
  RadioGroup,
  Option,
  Select,
  LoadingButton,
  Collapse,
  LinearProgress,
} from '@lotta-schule/hubert';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { CategoryModel, WidgetModel, ID, UserGroupModel } from 'model';
import { ResponsiveImage } from 'util/image/ResponsiveImage';
import { useCategories } from 'util/categories/useCategories';
import { SelectFileOverlay } from 'shared/edit/SelectFileOverlay';
import { GroupSelect } from 'shared/edit/GroupSelect';
import { PlaceholderImage } from 'shared/placeholder/PlaceholderImage';
import { DeleteCategoryDialog } from './DeleteCategoryDialog';
import { Category, RedirectType } from 'util/model';
import { CategoryWidgetSelector } from './CategoryWidgetSelector';
import { CategoryArticleRedirectSelection } from './CategoryArticleRedirectSelection';
import { AdminPageSection } from '../../_component/AdminPageSection';

import UpdateCategoryMutation from 'api/mutation/UpdateCategoryMutation.graphql';
import GetCategoryWidgetsQuery from 'api/query/GetCategoryWidgetsQuery.graphql';

export interface CategoryEditorProps {
  category: CategoryModel;
}

export const CategoryEditor = React.memo(
  ({ category }: CategoryEditorProps) => {
    const router = useRouter();
    const { t } = useTranslation();

    const [categories, { withIndentedLabels: categoriesWithIndentedLabels }] =
      useCategories();

    const [categoryOptions, setCategoryOptions] = React.useState(category);
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
          variables: { categoryId: categoryOptions?.id ?? null },
        },
      ],
    });
    const { data: currentWidgetsData, error: currentWidgetsError } = useQuery(
      GetCategoryWidgetsQuery,
      {
        variables: { categoryId: categoryOptions?.id },
        skip: !categoryOptions?.id,
      }
    );
    React.useEffect(() => {
      if (currentWidgetsData) {
        setSelectedWidgets(currentWidgetsData.widgets);
      }
    }, [currentWidgetsData]);

    const updateCategory = React.useCallback(() => {
      if (!category || !categoryOptions) {
        return null;
      }
      return mutateCategory({
        variables: {
          id: category.id,
          category: {
            title: categoryOptions.title,
            bannerImageFile: categoryOptions.bannerImageFile && {
              id: categoryOptions.bannerImageFile.id,
            },
            groups: categoryOptions.groups?.map(({ id }) => ({ id })),
            redirect: categoryOptions.redirect,
            layoutName: categoryOptions.layoutName,
            hideArticlesFromHomepage:
              categoryOptions.hideArticlesFromHomepage || false,
            widgets: selectedWidgets?.map(({ id }) => ({ id })) ?? [],
          },
        },
      });
    }, [categoryOptions, mutateCategory, category, selectedWidgets]);

    return (
      <div>
        <ErrorMessage error={error || currentWidgetsError} />

        <AdminPageSection title={t('general')}>
          <Label label={t('category name')}>
            <Input
              aria-label={t('category name')}
              value={categoryOptions.title ?? ''}
              onChange={(e) =>
                setCategoryOptions({
                  ...categoryOptions,
                  title: e.currentTarget.value,
                })
              }
            />
          </Label>

          {!categoryOptions.isHomepage && (
            <React.Suspense
              fallback={
                <LinearProgress
                  isIndeterminate
                  aria-label={t('loading user groups ...')}
                />
              }
            >
              <GroupSelect
                selectedGroups={categoryOptions.groups || []}
                onSelectGroups={(groups: UserGroupModel[]) => {
                  setCategoryOptions({ ...categoryOptions, groups });
                }}
              />
            </React.Suspense>
          )}
        </AdminPageSection>

        <AdminPageSection title={t('appearance')}>
          <Label label={t('banner image')}>
            <SelectFileOverlay
              label={t('change banner')}
              onSelectFile={(bannerImageFile) =>
                setCategoryOptions({ ...categoryOptions, bannerImageFile })
              }
              style={{ width: '100%' }}
              allowDeletion
            >
              {categoryOptions.bannerImageFile ? (
                <ResponsiveImage
                  lazy
                  sizes="auto"
                  style={{ width: '100%' }}
                  alt={t('banner for {{categoryName}}', {
                    categoryName: categoryOptions.title,
                  })}
                  format="banner"
                  file={categoryOptions.bannerImageFile}
                />
              ) : (
                <PlaceholderImage width={'100%'} height={75} />
              )}
            </SelectFileOverlay>
          </Label>
          <Select
            title={t('category layout')}
            value={categoryOptions.layoutName ?? 'standard'}
            onChange={(layoutName) =>
              setCategoryOptions({
                ...categoryOptions,
                layoutName: layoutName as 'standard' | 'densed' | '2-columns',
              })
            }
            id={'category-layout'}
          >
            <Option value={'standard'}>Standardlayout</Option>
            <Option value={'densed'}>Kompaktlayout</Option>
            <Option value={'2-columns'}>Zweispaltenlayout</Option>
          </Select>
        </AdminPageSection>

        {!categoryOptions.isHomepage && (
          <AdminPageSection title={t('configuration')}>
            <Checkbox
              isSelected={categoryOptions.hideArticlesFromHomepage}
              onChange={(isSelected) =>
                setCategoryOptions({
                  ...categoryOptions,
                  hideArticlesFromHomepage: isSelected,
                })
              }
              value={'hideArticlesFromHomepage'}
            >
              Beiträge dieser Kategorie auf der Startseite verstecken. Wenn
              diese Option ausgewählt ist, werden Beiträge, die dieser Kategorie
              zugeordnet sind, nicht auf der Startseite angezeigt.
            </Checkbox>
            <RadioGroup
              name={'category-redirect-type'}
              aria-label={t('use the category as redirection')}
              value={Category.getRedirectType(categoryOptions)}
              onChange={(_e, value) => {
                if (value === RedirectType.None) {
                  setCategoryOptions({
                    ...categoryOptions,
                    redirect: null,
                  });
                }
                if (value === RedirectType.InternalCategory) {
                  setCategoryOptions({
                    ...categoryOptions,
                    redirect: Category.getPath(categories[0]),
                  });
                }
                if (value === RedirectType.InternalArticle) {
                  setCategoryOptions({
                    ...categoryOptions,
                    redirect: '/a/',
                  });
                }
                if (value === RedirectType.Extern) {
                  setCategoryOptions({
                    ...categoryOptions,
                    redirect: 'https://lotta.schule',
                  });
                }
              }}
            >
              <Radio
                value={RedirectType.None}
                label={t(
                  'the category is not redirected and shows its own posts'
                )}
              />
              <Radio
                value={RedirectType.InternalCategory}
                label={t('redirect category to another category:')}
              />

              <Collapse
                data-testid={'InternalCategoryRedirectWrapper'}
                isOpen={
                  Category.getRedirectType(categoryOptions) ===
                  RedirectType.InternalCategory
                }
              >
                <Select
                  title={t('redirect to another category ...')}
                  value={categoryOptions.redirect || 'null'}
                  onChange={(redirect) =>
                    setCategoryOptions({
                      ...categoryOptions,
                      redirect,
                    })
                  }
                  id={'category-redirect'}
                >
                  {categoriesWithIndentedLabels.map(
                    ({ category, indentedLabel }) => (
                      <Option
                        key={category.id}
                        value={Category.getPath(category)}
                      >
                        {indentedLabel}
                      </Option>
                    )
                  )}
                </Select>
              </Collapse>

              <Radio
                value={RedirectType.InternalArticle}
                label={t('redirect category to an article:')}
              />

              <Collapse
                data-testid={'InternalArticleRedirectWrapper'}
                isOpen={
                  Category.getRedirectType(categoryOptions) ===
                  RedirectType.InternalArticle
                }
              >
                <CategoryArticleRedirectSelection
                  redirectPath={categoryOptions.redirect ?? '/a/'}
                  onSelectRedirectPath={(redirect) =>
                    setCategoryOptions({
                      ...categoryOptions,
                      redirect,
                    })
                  }
                />
              </Collapse>

              <Radio
                value={RedirectType.Extern}
                label={t('redirect category to a website in the internet:')}
              />

              <Collapse
                data-testid={'ExternalRedirectWrapper'}
                isOpen={
                  Category.getRedirectType(categoryOptions) ===
                  RedirectType.Extern
                }
              >
                <Label label={t('target of the redirection:')}>
                  <Input
                    aria-label={t('redirection target')}
                    value={categoryOptions.redirect ?? ''}
                    onChange={(e) =>
                      setCategoryOptions({
                        ...categoryOptions,
                        redirect: e.currentTarget.value,
                      })
                    }
                  />
                </Label>
              </Collapse>
            </RadioGroup>
          </AdminPageSection>
        )}

        <AdminPageSection title="Marginalen">
          <CategoryWidgetSelector
            selectedWidgets={selectedWidgets}
            setSelectedWidgets={(widgets) => setSelectedWidgets(widgets)}
          />
        </AdminPageSection>

        <AdminPageSection bottomToolbar>
          {categoryOptions.isHomepage ? (
            <div />
          ) : (
            <Button
              icon={<Icon icon={faTrash} />}
              onClick={() => setIsDeleteCategoryDialogOpen(true)}
              variant={'error'}
            >
              löschen
            </Button>
          )}
          <LoadingButton
            type="submit"
            onAction={async () => {
              await updateCategory();
            }}
            icon={<Icon icon={faFloppyDisk} />}
          >
            speichern
          </LoadingButton>
          <DeleteCategoryDialog
            isOpen={isDeleteCategoryDialogOpen}
            categoryToDelete={categoryOptions}
            onRequestClose={() => setIsDeleteCategoryDialogOpen(false)}
            onConfirm={() => {
              setIsDeleteCategoryDialogOpen(false);
              router.replace('/admin/categories');
            }}
          />
        </AdminPageSection>
      </div>
    );
  }
);
CategoryEditor.displayName = 'AdministrationCategoryEditor';
