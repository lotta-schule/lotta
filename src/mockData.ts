import { State } from "./store/State";

export const mockData: State = {
    user: {
        user: null
    },
    client: {
        client: null,
        categories: []
    },
    content: {
        articles: []
    },
    userFiles: {
        files: null,
        uploads: []
    }
};