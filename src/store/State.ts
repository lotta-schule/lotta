import { ClientModel, UserModel, FileModel, UploadModel, ArticleModel, CategoryModel } from '../model';

export interface ClientState {
    client: ClientModel | null;
    categories: CategoryModel[];
}

export interface UserState {
    user: UserModel | null;
}

export interface UserFilesState {
    files: FileModel[] | null;
    uploads: UploadModel[];
}

export interface ContentState {
    articles: ArticleModel[];
}

export interface LayoutState {
    isDrawerOpen: boolean;
}

export interface State {
    client: ClientState;
    content: ContentState;
    user: UserState;
    userFiles: UserFilesState;
    layout: LayoutState;
}
