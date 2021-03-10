import { createContext } from 'react';
import { DirectoryModel } from 'model';

const directory: DirectoryModel | null = null;
const setDirectory = () => {};

export const SelectedDirectoryContext = createContext<
    [DirectoryModel | null, (d: DirectoryModel | null) => void]
>([directory, setDirectory] as any);
