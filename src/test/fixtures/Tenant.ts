import { CategoryModel, ClientModel, UserGroupModel } from 'model';

export const AdminGroup: UserGroupModel = {
    id: 1,
    createdAt: new Date(2015, 0, 1).toISOString(),
    updatedAt: new Date(2015, 0, 1).toISOString(),
    name: 'Administrator',
    priority: 1000,
    isAdminGroup: true,
    tenant: null!
}

export const TestTenant: ClientModel = {
    id: 1,
    title: 'Test Tenant',
    slug: 'test',
    createdAt: new Date(2015, 0, 1).toISOString(),
    updatedAt: new Date(2015, 0, 1).toISOString(),
    groups: [AdminGroup]
};

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