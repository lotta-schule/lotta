import { ClientModel, UserModel, FileModel, UploadModel, ArticleModel, CategoryModel } from '../model';

export interface ClientState {
    client: ClientModel | null;
}

export interface UserState {
    user: UserModel | null;
    token: string | null;
}

export interface UserFilesState {
    files: FileModel[] | null;
    uploads: UploadModel[];
}

export interface ContentState {
    categories: CategoryModel[];
    articles: ArticleModel[];
}

export interface State {
    client: ClientState;
    content: ContentState;
    user: UserState;
    userFiles: UserFilesState;
}
