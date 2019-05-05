import { find } from 'lodash';
import { ContentModuleModel, ContentModuleType } from '../../model';
import { ContentState } from '../State';
import { AddArticleAction, AddPageAction, UpdateContentModuleAction, AddContentModuleAction, ContentActionType } from '../actions/content';

export type ContentActions = AddArticleAction | AddPageAction | AddContentModuleAction | UpdateContentModuleAction;

export const initialContentState: ContentState = {
    categories: [
        {
            id: 'C0001',
            title: 'Profil'
        },
        {
            id: 'C0002',
            title: 'GTA'
        },
        {
            id: 'C0003',
            title: 'Projekte'
        },
        {
            id: 'C0004',
            title: 'Fächer'
        },
        {
            id: 'C0005',
            title: 'Material'
        },
        {
            id: 'C0006',
            title: 'Galerien'
        },
    ],
    articles: [
        {
            id: 'A01',
            title: 'And the oskar goes to ...',
            preview: 'Hallo hallo hallo',
            category: {
                id: 'C01',
                title: 'Kategorie'
            },
            modules: [
                {
                    id: 'M01',
                    text: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.',
                    type: ContentModuleType.Text
                },
                {
                    id: 'M02',
                    text: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.',
                    type: ContentModuleType.Text
                }
            ]
        }
    ]
};

export const contentReducer = (s: ContentState = initialContentState, action: ContentActions): ContentState => {
    switch (action.type) {
        case ContentActionType.ADD_ARTICLE:
            return {
                ...s,
                articles: s.articles.map(page => {
                    return page.id === action.pageId
                        ? {
                            ...page,
                            articles: [...s.articles, action.article]
                        }
                        : page;
                })
            };
        case ContentActionType.ADD_PAGE:
            const foundPage = find(s.articles, { id: action.page.id });
            return foundPage
                ? {
                    ...s,
                    articles: s.articles.map(page => (page.id === action.page.id ? action.page : page))
                }
                : {
                    ...s,
                    articles: action.page ? s.articles.concat(action.page) : s.articles
                };
        case ContentActionType.ADD_CONTENT_MODULE:
            return {
                ...s,
                articles: s.articles.map(article => ({
                    ...article,
                    modules:
                        article.id === action.pageId
                            ? article.modules.concat([action.contentModule])
                            : article.modules
                }))
            };
        case ContentActionType.UPDATE_CONTENT_MODULE:
            const updateModuleMapFn = (contentModule: ContentModuleModel): ContentModuleModel => {
                if (contentModule.id === action.contentModule.id) {
                    return action.contentModule;
                }
                return contentModule;
            }
            return {
                ...s,
                articles: s.articles.map(page => ({
                    ...page,
                    modules: page.modules.map(updateModuleMapFn)
                }))
            };
        default:
            return s;
    }
};
