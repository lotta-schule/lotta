import { CategoryModel } from 'model';

export const StartseiteCategory: CategoryModel = {
    id: 1,
    sortKey: 0,
    title: 'Start',
    isHomepage: true
};

export const SuedAmerikaCategory: CategoryModel = {
    id: 2,
    sortKey: 10,
    title: 'Südamerika'
};

export const ImpressumCategory: CategoryModel = {
    id: 3,
    sortKey: 10,
    title: 'Impressum',
    isSidenav: true,
    hideArticlesFromHomepage: true,
    redirect: '/article/100'
};

export const DatenschutzCategory: CategoryModel = {
    id: 4,
    sortKey: 20,
    title: 'Datenschutz',
    isSidenav: true,
    hideArticlesFromHomepage: true,
    redirect: '/article/101'
};