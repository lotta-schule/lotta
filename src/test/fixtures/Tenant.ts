import { CategoryModel, ClientModel, UserGroupModel } from 'model';

export const AdminGroup: UserGroupModel = {
    id: 1,
    createdAt: new Date(2015, 0, 1).toISOString(),
    updatedAt: new Date(2015, 0, 1).toISOString(),
    name: 'Administrator',
    sortKey: 1000,
    isAdminGroup: true,
    tenant: null!,
    enrollmentTokens: []
}

export const TestTenant: ClientModel = {
    id: 1,
    title: 'Test Tenant',
    slug: 'test',
    createdAt: new Date(2015, 0, 1).toISOString(),
    updatedAt: new Date(2015, 0, 1).toISOString(),
    groups: [AdminGroup],
    customDomains: []
};

export const StartseiteCategory: CategoryModel = {
    id: 1,
    sortKey: 0,
    title: 'Start',
    isHomepage: true,
    groups: []
};

export const SuedAmerikaCategory: CategoryModel = {
    id: 2,
    sortKey: 10,
    title: 'Südamerika',
    groups: []
};

export const ImpressumCategory: CategoryModel = {
    id: 3,
    sortKey: 10,
    title: 'Impressum',
    isSidenav: true,
    hideArticlesFromHomepage: true,
    redirect: '/article/100',
    groups: []
};

export const DatenschutzCategory: CategoryModel = {
    id: 4,
    sortKey: 20,
    title: 'Datenschutz',
    isSidenav: true,
    hideArticlesFromHomepage: true,
    redirect: '/article/101',
    groups: []
};