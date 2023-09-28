import * as React from 'react';
import { useCategories } from 'util/categories/useCategories';
import { CategoryModel } from 'model';
import { Option, Select } from '@lotta-schule/hubert';

export interface CategorySelectProps {
  disabled?: boolean;
  className?: string;
  label?: string;
  hideSubCategories?: boolean;
  hideSidenav?: boolean;
  selectedCategory: CategoryModel | null;
  onSelectCategory(category: CategoryModel | null): void;
}

export const CategorySelect = React.memo(
  ({
    disabled,
    label,
    hideSubCategories,
    hideSidenav,
    selectedCategory,
    onSelectCategory,
    className,
  }: CategorySelectProps) => {
    const [categories] = useCategories();

    const mainCategories = categories.filter(
      (c) => !c.category && !c.isHomepage && (!c.isSidenav || !hideSidenav)
    );

    const getMenuItemForCategory = React.useCallback(
      (category: CategoryModel) => {
        const label =
          !category.category && !hideSubCategories
            ? category.title
            : `${category.category ? '\xa0 \xa0 \xa0' : ''}${category.title}`;
        return (
          <Option key={category.id} value={category.id}>
            {label}
          </Option>
        );
      },
      [hideSubCategories]
    );

    const menuItems = mainCategories
      .map((category) =>
        hideSubCategories
          ? [category]
          : [category].concat(
              categories.filter((c) => c.category?.id === category.id)
            )
      )
      .flat()
      .map(getMenuItemForCategory);

    return (
      <Select
        data-testid="CategorySelect"
        className={className}
        title={label ?? 'Kategorie wählen'}
        disabled={disabled}
        value={selectedCategory?.id ?? 'null'}
        onChange={(categoryId) =>
          onSelectCategory(
            categories.find(
              (cat) => categoryId !== 'null' && cat.id === categoryId
            ) || null
          )
        }
      >
        <Option key={'null'} value={'null'}>
          Kategorie wählen
        </Option>
        {menuItems}
      </Select>
    );
  }
);
CategorySelect.displayName = 'CategorySelect';
