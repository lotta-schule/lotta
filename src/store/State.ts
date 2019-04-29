import { ClientModel, UserModel, FileModel, UploadModel, ArticleModel } from '../model';

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
    articles: ArticleModel[];
}

export interface State {
    client: ClientState;
    content: ContentState;
    user: UserState;
    userFiles: UserFilesState;
}
