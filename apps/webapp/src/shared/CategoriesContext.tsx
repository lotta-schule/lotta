'use client';

import * as React from 'react';
import { CategoryModel } from 'model';

const CategoriesContext = React.createContext<CategoryModel[]>([]);

export const CategoriesProvider = ({
  categories,
  children,
}: React.PropsWithChildren<{ categories: CategoryModel[] }>) => {
  return (
    <CategoriesContext.Provider value={categories}>
      {children}
    </CategoriesContext.Provider>
  );
};

export const useCategories = () => React.useContext(CategoriesContext);
