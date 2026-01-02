'use client';
import * as React from 'react';
import { Icon } from 'shared/Icon';
import { faFloppyDisk, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useMutation, useQuery } from '@apollo/client/react';
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
import { useRouter } from 'next/navigation';

import UpdateCategoryMutation from 'api/mutation/UpdateCategoryMutation.graphql';
import GetCategoryWidgetsQuery from 'api/query/GetCategoryWidgetsQuery.graphql';

export interface CategoryEditorProps {
  category: CategoryModel;
}

export const CategoryEditor = React.memo(
  ({ category }: CategoryEditorProps) => {
    const router = useRouter();

    const [categories] = useCategories();

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

        <AdminPageSection title="Allgemeines">
          <Label label={'Name der Kategorie'}>
            <Input
              aria-label={'Name der Kategorie'}
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
                  aria-label="Gruppen werden geladen..."
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

        <AdminPageSection title="Darstellung">
          <Label label={'Bannerbild'}>
            <SelectFileOverlay
              label={'Banner ändern'}
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
                  alt={`Banner für ${categoryOptions.title}`}
                  format="banner"
                  file={categoryOptions.bannerImageFile}
                />
              ) : (
                <PlaceholderImage width={'100%'} height={75} />
              )}
            </SelectFileOverlay>
          </Label>
          <Select
            title={'Layout für die Kategorie wählen'}
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
          <AdminPageSection title="Konfiguration">
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
              aria-label={'Die Kategorie als Weiterleitung'}
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
                label={
                  'Kategorie wird nicht weitergeleitet und zeigt eigene Beiträge an.'
                }
              />
              <Radio
                value={RedirectType.InternalCategory}
                label={'Kategorie zu einer anderen Kategorie weiterleiten:'}
              />

              <Collapse
                data-testid={'InternalCategoryRedirectWrapper'}
                isOpen={
                  Category.getRedirectType(categoryOptions) ===
                  RedirectType.InternalCategory
                }
              >
                <Select
                  title={'Zu einer anderen Kategorie weiterleiten ...'}
                  value={categoryOptions.redirect || 'null'}
                  onChange={(redirect) =>
                    setCategoryOptions({
                      ...categoryOptions,
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
              </Collapse>

              <Radio
                value={RedirectType.InternalArticle}
                label={'Kategorie zu einem Beitrag weiterleiten:'}
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
                label={'Kategorie zu einer Seite im Internet weiterleiten'}
              />

              <Collapse
                data-testid={'ExternalRedirectWrapper'}
                isOpen={
                  Category.getRedirectType(categoryOptions) ===
                  RedirectType.Extern
                }
              >
                <Label label={'Ziel der Weiterleitung:'}>
                  <Input
                    aria-label={'Ziel der Weiterleitung'}
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
